import { useState } from "react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Crown } from "lucide-react";

export default function Leaderboard() {
  const [type, setType] = useState<"xp" | "rich">("xp");
  const { data: entries, isLoading } = useGetLeaderboard({
    type,
  });

  const top3 = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight flex items-center justify-center gap-3">
            <Trophy className="text-accent h-8 w-8" />
            LEADERBOARD
          </h1>
          <p className="text-muted-foreground">The strongest and wealthiest in the Konosuba.</p>
        </div>

        <Tabs defaultValue="xp" className="w-full mb-12" onValueChange={(val) => setType(val as any)}>
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-border/40 max-w-md mx-auto">
            <TabsTrigger value="xp" className="data-[state=active]:bg-primary">XP Ranking</TabsTrigger>
            <TabsTrigger value="rich" className="data-[state=active]:bg-primary">Rich List</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <AnimatePresence mode="wait">
                {top3.map((entry, i) => {
                  const isFirst = i === 0;
                  const order = isFirst ? "md:order-2" : i === 1 ? "md:order-1" : "md:order-3";
                  const scale = isFirst ? "scale-110" : "scale-100";
                  const glow = isFirst ? "border-accent shadow-[0_0_30px_rgba(245,158,11,0.2)]" : "border-border/40";
                  
                  return (
                    <motion.div
                      key={`${type}-${entry.phone}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${order} ${scale} flex flex-col items-center`}
                    >
                      <div className="mb-4">
                        {i === 0 && <Crown className="h-8 w-8 text-accent animate-bounce mb-1" />}
                        {i === 1 && <Medal className="h-8 w-8 text-slate-300 mb-1" />}
                        {i === 2 && <Medal className="h-8 w-8 text-amber-600 mb-1" />}
                      </div>
                      <Card className={`w-full bg-card/60 backdrop-blur border-2 ${glow} relative overflow-hidden`}>
                        <CardContent className="p-6 text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-primary/20">
                            <AvatarImage src={entry.profilePp || undefined} />
                            <AvatarFallback className="bg-primary">{entry.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-lg truncate">{entry.name}</h3>
                          <p className="text-primary font-bold text-xl mt-2">
                            {type === "xp" ? `${entry.xp.toLocaleString()} XP` : `$${(entry.bank / 1000).toFixed(2)}K`}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">Level {entry.level}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Rest of the List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {rest.map((entry, i) => (
                  <motion.div
                    key={`${type}-${entry.phone}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-card/40 border-border/40 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-8 font-black text-muted-foreground text-xl">
                          #{i + 4}
                        </div>
                        <Avatar className="h-12 w-12 border border-border/40">
                          <AvatarImage src={entry.profilePp || undefined} />
                          <AvatarFallback className="bg-muted">{entry.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{entry.name}</h4>
                          <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold">
                            {type === "xp" ? `${entry.xp.toLocaleString()} XP` : `$${(entry.bank / 1000).toFixed(2)}K`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
