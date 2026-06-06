import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetBotStats } from "@workspace/api-client-react";
import { Users, Grid, Zap, Smartphone, ChevronRight, Sword, Shield, Package, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: stats, isLoading } = useGetBotStats();

  const features = [
    {
      name: "RPG Combat",
      description: "Engage in epic battles, level up your character, and conquer the Konosuba world.",
      icon: <Sword className="h-6 w-6 text-primary" />,
      color: "bg-primary/10",
    },
    {
      name: "Card Collection",
      description: "Collect hundreds of unique cards with different rarities and tiers.",
      icon: <Grid className="h-6 w-6 text-blue-400" />,
      color: "bg-blue-500/10",
    },
    {
      name: "Pokemon",
      description: "Catch, train, and battle with your favorite Pokemon directly on WhatsApp.",
      icon: <Smartphone className="h-6 w-6 text-blue-400" />,
      color: "bg-blue-500/10",
    },
    {
      name: "Economy",
      description: "A robust economy system with jobs, shops, and a global leaderboard.",
      icon: <Zap className="h-6 w-6 text-accent" />,
      color: "bg-accent/10",
    },
  ];

  const formatNumber = (n: number = 0) => {
    return n.toLocaleString();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" 
        />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
              KONO<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">SUBA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              The Ultimate WhatsApp RPG Bot. Epic battles, legendary cards, and wild adventures await.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-black group shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
                <Link href="/signup">
                  PLAY NOW
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full text-lg font-black border-border/50 bg-card/30 backdrop-blur hover:bg-card/50">
                <Link href="/leaderboard">LEADERBOARD</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating elements for RPG feel */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30 animate-bounce">
          <span className="text-[10px] font-black tracking-[0.2em]">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-card/20 backdrop-blur-md py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { label: "Active Users", value: stats?.userCount || 0, icon: <Users className="w-5 h-5 text-primary" /> },
              { label: "Legendary Cards", value: stats?.cardCount || 0, icon: <Package className="w-5 h-5 text-blue-400" /> },
              { label: "Guild Groups", value: stats?.groupCount || 0, icon: <Shield className="w-5 h-5 text-blue-400" /> },
              { label: "Captured Pokemon", value: stats?.pokemonCount || 0, icon: <Smartphone className="w-5 h-5 text-accent" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center text-center space-y-1"
              >
                <div className="text-3xl md:text-4xl font-black text-white">
                  {isLoading ? "..." : formatNumber(stat.value)}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  {stat.icon}
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">MASTER THE GARDEN</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card/40 border border-border/40 p-8 rounded-[2rem] hover:border-primary/50 transition-all hover:bg-card/60"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase">{feature.name}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {feature.description}
                </p>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy className="h-24 w-24" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-border/40 bg-card/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-2xl font-black text-primary tracking-tighter">SHADOW GARDEN</div>
          
          <div className="flex gap-8">
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">HOME</Link>
            <Link href="/shop" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">SHOP</Link>
            <Link href="/leaderboard" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">LEADERBOARD</Link>
          </div>
          
          <div className="text-sm font-bold text-muted-foreground/60">
            SHADOW GARDEN BOT © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
