import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useRequestOtp, useVerifyOtp } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    setLocation("/profile");
  }

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await requestOtpMutation.mutateAsync({
        data: { phone },
      });
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtp(res.devOtp);
      }
      setStep(2);
      toast.success("OTP sent to your WhatsApp!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyOtpMutation.mutateAsync({
        data: { phone, otp },
      });
      login(res.token, res.user);
      toast.success("Logged in successfully!");
      setLocation("/profile");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary mb-2">Konosuba</CardTitle>
            <CardDescription>
              {step === 1 ? "Enter your phone number to login" : "Enter the 6-digit OTP sent to you"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="e.g. 628123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-background/50 border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: Country code + number without spaces or symbols.
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={requestOtpMutation.isPending}
                >
                  {requestOtpMutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {devOtp && (
                  <Alert className="bg-primary/10 border-primary/30 text-primary">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Dev Mode</AlertTitle>
                    <AlertDescription>
                      Your OTP is: <span className="font-mono font-bold">{devOtp}</span>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-xs"
                  onClick={() => setStep(1)}
                >
                  Change phone number
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
