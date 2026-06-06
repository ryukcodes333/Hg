import { useAuth } from "@/contexts/AuthContext";
import { useGetProfile, useGetMyCards, useGetInventory, useGetUserPokemon, getGetProfileQueryKey, getGetMyCardsQueryKey, getGetInventoryQueryKey, getGetUserPokemonQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Building2, Star, Zap, Sparkles, Box, Grid, Smartphone } from "lucide-react";

export default function Profile() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = useGetProfile({
    query: { 
      queryKey: getGetProfileQueryKey(),
      enabled: isAuthenticated 
    },
  });

  const { data: cards, isLoading: cardsLoading } = useGetMyCards({
    query: { 
      queryKey: getGetMyCardsQueryKey(),
      enabled: isAuthenticated 
    },
  });

  const { data: inventory, isLoading: inventoryLoading } = useGetInventory({
    query: { 
      queryKey: getGetInventoryQueryKey(),
      enabled: isAuthenticated 
    },
  });

  const { data: pokemon, isLoading: pokemonLoading } = useGetUserPokemon({
    query: { 
      queryKey: getGetUserPokemonQueryKey(),
      enabled: isAuthenticated 
    },
  });

  if (!authLoading && !isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const formatMoney = (n: number = 0) => {
    return (n >= 1000) ? (n / 1000).toFixed(2) + 'K' : n.toString();
  };

  const formatXP = (n: number = 0) => {
    return n.toLocaleString();
  };

  if (profileLoading || authLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8 pt-24">
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <div className="flex flex-col items-center -mt-16 space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      {/* Cover Header */}
      <div className="h-[180px] w-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 relative border-b border-border/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Avatar Section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center -mt-[50px] relative z-10">
          <div className="relative">
            <div className="p-1 rounded-full bg-gradient-to-tr from-primary via-purple-500 to-primary-foreground animate-glow">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={profile.profilePp || undefined} />
                <AvatarFallback className="bg-primary text-2xl font-bold">
                  {profile.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border-primary/50 text-xs px-2 py-0.5 shadow-lg">
              Lvl {profile.level}
            </Badge>
          </div>

          <div className="mt-6 text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              {profile.name}
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </h1>
            <p className="text-muted-foreground italic text-sm">
              {profile.bio || "No bio yet..."}
            </p>
            <p className="text-muted-foreground/60 text-xs flex items-center justify-center gap-1">
              <Smartphone className="h-3 w-3" />
              {profile.phone}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" className="h-8 rounded-full border-border/50 bg-card/30 backdrop-blur hover:bg-primary/20 hover:border-primary/50 text-xs">
              Edit Avatar
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-full border-border/50 bg-card/30 backdrop-blur hover:bg-primary/20 hover:border-primary/50 text-xs">
              Edit Cover
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-full border-border/50 bg-card/30 backdrop-blur hover:bg-primary/20 hover:border-primary/50 text-xs">
              Edit Frame
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
          {[
            { label: "Wallet", value: `$${formatMoney(profile.wallet)}`, icon: Wallet, color: "text-green-400" },
            { label: "Bank", value: `$${formatMoney(profile.bank)}`, icon: Building2, color: "text-blue-400" },
            { label: "Level", value: profile.level, icon: Star, color: "text-accent" },
            { label: "XP", value: formatXP(profile.xp), icon: Zap, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/40 border-border/40 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <div className="text-xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="mt-12 max-w-5xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border/40 rounded-none h-12 p-0 gap-8">
              {["Overview", "Deck", "Inventory", "Pokemon"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-2 font-semibold transition-all h-full"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="pt-8">
              <TabsContent value="overview">
                <Card className="bg-card/20 border-dashed border-border/40">
                  <CardContent className="p-12 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Achievements</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Complete quests and challenges to earn exclusive rewards and badges. Coming soon!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deck">
                {cardsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
                    ))}
                  </div>
                ) : cards && cards.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {cards.map((uc) => (
                      <motion.div
                        key={uc.id}
                        whileHover={{ y: -5 }}
                        className="aspect-[2/3] rounded-xl bg-card border border-border/40 overflow-hidden relative group"
                      >
                        {uc.card.imageUrl ? (
                          <img src={uc.card.imageUrl} alt={uc.card.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Box className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <p className="text-white text-xs font-bold truncate">{uc.card.name}</p>
                          <p className="text-primary text-[10px]">{uc.card.tier}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Grid className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No cards in your collection yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inventory">
                {inventoryLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : inventory && inventory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item, idx) => (
                      <Card key={idx} className="bg-card/30 border-border/30">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                            {item.emoji}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.item}</h4>
                            <p className="text-muted-foreground text-xs">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-primary font-bold">
                            x{item.quantity}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Box className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Your inventory is empty.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pokemon">
                {pokemonLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                ) : pokemon && pokemon.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pokemon.map((p) => (
                      <motion.div
                        key={p.id}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-xl bg-card border border-border/40 p-4 flex flex-col items-center justify-center text-center group"
                      >
                        {p.sprite && <img src={p.sprite} alt={p.name} className="h-20 w-20 object-contain drop-shadow-glow" />}
                        <h4 className="mt-2 text-sm font-bold capitalize truncate w-full">{p.name}</h4>
                        <div className="flex gap-1 mt-1">
                          {p.types.map((type) => (
                            <span key={type} className="text-[8px] uppercase font-bold px-1 rounded bg-muted">
                              {type}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No Pokemon caught yet.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.8); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
        }
      `}} />
    </div>
  );
}
