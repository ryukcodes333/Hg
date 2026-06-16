import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, ShoppingBag, Trophy, Sword, Grid, User, LogOut, Sparkles, Shield } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const navLinks = [
    { name: "Home",        href: "/",           icon: Home },
    { name: "Shop",        href: "/shop",        icon: ShoppingBag },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Pokémon",     href: "/pokemon",     icon: Sword },
    { name: "Cards",       href: "/cards",       icon: Grid },
    { name: "Guilds",      href: "/guild",       icon: Shield },
  ];

  return (
    <>
      {/* Floating circle toggle — top left */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="fixed top-5 left-5 z-[999] w-12 h-12 rounded-full flex items-center justify-center
          bg-[rgba(11,13,18,0.92)] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.6)]
          backdrop-blur-md text-white transition-all duration-300
          hover:border-[#4effff]/50 hover:shadow-[0_0_18px_rgba(78,255,255,0.25)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Menu className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Slide-in nav panel from left */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="nav-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 left-0 z-[999] h-full w-72 flex flex-col
              bg-[#0b0d12] border-r border-white/[0.08] shadow-[4px_0_40px_rgba(0,0,0,0.6)]"
          >
            {/* Logo area */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-2xl bg-[rgba(78,255,255,0.15)] flex items-center justify-center border border-[#4effff]/30">
                <Sparkles className="h-5 w-5 text-[#4effff]" />
              </div>
              <span className="font-black text-xl tracking-tighter text-white">
                KONO<span className="text-[#4effff]">SUBA</span>
              </span>
            </div>

            {/* Nav links */}
            <div className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const active = location === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all group
                        ${active
                          ? "bg-[rgba(78,255,255,0.12)] text-[#4effff] border border-[#4effff]/25 shadow-[0_0_12px_rgba(78,255,255,0.1)]"
                          : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                        }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${active ? "text-[#4effff]" : "text-white/40 group-hover:text-white/70"}`} />
                      {link.name}
                      {active && (
                        <motion.div layoutId="nav-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4effff] shadow-[0_0_6px_#4effff]" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Auth section */}
            <div className="px-3 pb-6 pt-4 border-t border-white/[0.06] space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                  >
                    <Avatar className="h-8 w-8 border border-[#4effff]/30">
                      <AvatarImage src={user?.profilePp || undefined} />
                      <AvatarFallback className="bg-[#4effff]/20 text-[#4effff] text-xs font-black">{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">{user?.name?.toUpperCase()}</p>
                      <p className="text-[10px] text-white/40 font-medium">View Profile</p>
                    </div>
                    <User className="h-4 w-4 text-white/30 flex-shrink-0" />
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-white/10 text-xs font-black text-white/70 hover:text-white hover:border-white/20 transition-all"
                  >
                    LOGIN
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-black bg-[rgba(78,255,255,0.15)] border border-[#4effff]/30 text-[#4effff] hover:bg-[rgba(78,255,255,0.25)] transition-all shadow-[0_0_12px_rgba(78,255,255,0.1)]"
                  >
                    SIGN UP
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
