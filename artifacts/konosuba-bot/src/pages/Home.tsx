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
      icon: <Sword className="h-6 w-6 text-[#4effff]" />,
      color: "bg-[rgba(78,255,255,0.08)] border-[rgba(78,255,255,0.15)]",
    },
    {
      name: "Card Collection",
      description: "Collect hundreds of unique cards with different rarities and tiers.",
      icon: <Grid className="h-6 w-6 text-[#4effff]" />,
      color: "bg-[rgba(78,255,255,0.08)] border-[rgba(78,255,255,0.15)]",
    },
    {
      name: "Pokémon",
      description: "Catch, train, and battle with your favourite Pokémon directly on WhatsApp.",
      icon: <Smartphone className="h-6 w-6 text-[#4effff]" />,
      color: "bg-[rgba(78,255,255,0.08)] border-[rgba(78,255,255,0.15)]",
    },
    {
      name: "Economy",
      description: "A robust economy system with jobs, shops, and a global leaderboard.",
      icon: <Zap className="h-6 w-6 text-[#4effff]" />,
      color: "bg-[rgba(78,255,255,0.08)] border-[rgba(78,255,255,0.15)]",
    },
  ];

  const formatNumber = (n: number = 0) => n.toLocaleString();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0d12]">

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay — left heavier so text pops, right lighter to see video */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,13,18,0.97)] via-[rgba(11,13,18,0.75)] to-[rgba(11,13,18,0.25)]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0b0d12] to-transparent" />

        <div className="container mx-auto px-8 relative z-10 max-w-6xl flex items-center justify-between gap-12">

          {/* Left — text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full
                bg-[rgba(78,255,255,0.1)] border border-[#4effff]/30 text-[#4effff] text-xs font-bold tracking-widest uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4effff] animate-pulse shadow-[0_0_6px_#4effff]" />
              WhatsApp RPG Bot
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-5 leading-none">
              KONO<span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#4effff] to-blue-400"
                style={{ textShadow: "none", filter: "drop-shadow(0 0 30px rgba(78,255,255,0.5))" }}
              >SUBA</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed mb-10 max-w-lg">
              The Ultimate WhatsApp RPG Bot. Epic battles, legendary cards, and wild adventures await. <strong className="text-[#4effff]/80 font-semibold">Join the world of Konosuba.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button asChild size="lg"
                className="h-13 px-8 rounded-full text-sm font-black tracking-wide group
                  bg-[rgba(78,255,255,0.15)] border border-[#4effff]/40 text-[#4effff]
                  hover:bg-[#4effff] hover:text-black hover:border-[#4effff]
                  shadow-[0_0_20px_rgba(78,255,255,0.2)] hover:shadow-[0_0_30px_rgba(78,255,255,0.5)]
                  transition-all duration-300"
              >
                <Link href="/signup">
                  PLAY NOW
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg"
                className="h-13 px-8 rounded-full text-sm font-black tracking-wide
                  border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white
                  backdrop-blur transition-all duration-300"
              >
                <Link href="/leaderboard">LEADERBOARD</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right spacer (video shows through) */}
          <div className="hidden lg:block flex-1 max-w-md" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce z-10">
          <span className="text-[9px] font-black tracking-[0.3em]">SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/[0.06] bg-[#0d0f16]/80 backdrop-blur-md py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { label: "Active Users",     value: stats?.userCount    || 0, icon: <Users className="w-5 h-5 text-[#4effff]" /> },
              { label: "Legendary Cards",  value: stats?.cardCount    || 0, icon: <Package className="w-5 h-5 text-[#4effff]" /> },
              { label: "Guild Groups",     value: stats?.groupCount   || 0, icon: <Shield className="w-5 h-5 text-[#4effff]" /> },
              { label: "Caught Pokémon",   value: stats?.pokemonCount || 0, icon: <Smartphone className="w-5 h-5 text-[#4effff]" /> },
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
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                  {stat.icon}
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">MASTER THE WORLD</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#4effff] to-blue-400 mx-auto rounded-full shadow-[0_0_12px_rgba(78,255,255,0.5)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative border p-8 rounded-[2rem] transition-all duration-300
                  ${feature.color}
                  hover:border-[#4effff]/40 hover:bg-[rgba(78,255,255,0.12)]
                  hover:shadow-[0_8px_30px_rgba(78,255,255,0.1)]`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[rgba(78,255,255,0.1)] border border-[#4effff]/20
                  flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(78,255,255,0.3)] transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase">{feature.name}</h3>
                <p className="text-white/50 leading-relaxed text-sm font-medium">{feature.description}</p>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy className="h-20 w-20 text-[#4effff]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto py-10 border-t border-white/[0.06] bg-[#0d0f16]/60">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl font-black tracking-tighter">
            KONO<span className="text-[#4effff]">SUBA</span>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="text-xs font-bold text-white/40 hover:text-[#4effff] transition-colors">HOME</Link>
            <Link href="/shop" className="text-xs font-bold text-white/40 hover:text-[#4effff] transition-colors">SHOP</Link>
            <Link href="/leaderboard" className="text-xs font-bold text-white/40 hover:text-[#4effff] transition-colors">LEADERBOARD</Link>
          </div>
          <div className="text-xs font-bold text-white/20">KONOSUBA BOT © 2026</div>
        </div>
      </footer>
    </div>
  );
}
