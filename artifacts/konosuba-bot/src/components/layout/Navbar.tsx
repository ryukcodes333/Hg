import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "LEADERBOARD", href: "/leaderboard" },
    { name: "POKEMON", href: "/pokemon" },
    { name: "CARDS", href: "/cards" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2.5 rounded-2xl text-primary group-hover:bg-primary/30 transition-all group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white group-hover:text-primary transition-colors">KB</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-xs font-black tracking-[0.2em] transition-all hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 bg-card/40 p-1.5 pl-4 rounded-full border border-border/40">
              <Link href="/profile" className="flex items-center gap-3 group">
                <span className="text-xs font-black text-white group-hover:text-primary transition-colors">{user?.name?.toUpperCase()}</span>
                <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                  <AvatarImage src={user?.profilePp || undefined} />
                  <AvatarFallback className="bg-primary text-xs">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="w-px h-6 bg-border/40 mx-2" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="text-xs font-black tracking-widest hover:text-primary">
                <Link href="/login">LOGIN</Link>
              </Button>
              <Button asChild className="rounded-full px-8 text-xs font-black tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Link href="/signup">SIGN UP</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="lg:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="hover:bg-primary/10">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-card border-b border-border/40"
          >
            <div className="flex flex-col px-4 py-8 gap-6 text-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`text-sm font-black tracking-[0.2em] ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-border/40 w-full" />
              
              {isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <Link 
                    href="/profile" 
                    className="flex items-center justify-center gap-3 bg-primary/10 p-4 rounded-2xl"
                    onClick={() => setIsOpen(false)}
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user?.profilePp || undefined} />
                      <AvatarFallback className="bg-primary">{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-black text-white">{user?.name?.toUpperCase()}</span>
                  </Link>
                  <Button onClick={() => { logout(); setIsOpen(false); }} variant="destructive" className="rounded-2xl h-14 font-black tracking-widest">
                    LOGOUT
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-14 rounded-2xl font-black tracking-widest">
                    <Link href="/login" onClick={() => setIsOpen(false)}>LOGIN</Link>
                  </Button>
                  <Button asChild className="h-14 rounded-2xl font-black tracking-widest">
                    <Link href="/signup" onClick={() => setIsOpen(false)}>SIGN UP</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
