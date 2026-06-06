import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserPokemon, useGetPokemonDex, getGetUserPokemonQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Smartphone, Sword, Shield } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-400 text-black",
  psychic: "bg-pink-500",
  dark: "bg-gray-800",
  ghost: "bg-purple-800",
  dragon: "bg-indigo-600",
  normal: "bg-slate-400",
  poison: "bg-purple-500",
  ground: "bg-amber-700",
  rock: "bg-stone-500",
  ice: "bg-cyan-400 text-black",
  fighting: "bg-orange-600",
  bug: "bg-lime-600",
  steel: "bg-blue-gray-500",
  fairy: "bg-pink-300 text-black",
};

export default function Pokemon() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: myPokemon, isLoading: myLoading } = useGetUserPokemon({
    query: { 
      queryKey: getGetUserPokemonQueryKey(),
      enabled: isAuthenticated 
    },
  });

  const { data: dex, isLoading: dexLoading } = useGetPokemonDex({
    page,
    search: search || undefined,
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* My Party Section */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sword className="text-primary h-6 w-6" />
              MY PARTY
            </h2>
            
            {!isAuthenticated ? (
              <Card className="bg-card/40 border-dashed border-border/40">
                <CardContent className="p-8 text-center space-y-4">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground text-sm">Login to see your caught Pokemon</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href="/login">Login Now</a>
                  </Button>
                </CardContent>
              </Card>
            ) : myLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : myPokemon && myPokemon.length > 0 ? (
              <div className="space-y-4">
                {myPokemon.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-card/60 border-primary/20 hover:border-primary/50 transition-colors overflow-hidden group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {p.sprite && <img src={p.sprite} alt={p.name} className="h-14 w-14 object-contain relative z-10" />}
                          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white capitalize">{p.name}</h4>
                          <div className="flex gap-1 mt-1">
                            {p.types.map((type) => (
                              <Badge key={type} className={`${TYPE_COLORS[type] || "bg-muted"} text-[8px] h-4 uppercase px-1`}>
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-card/40 border-dashed border-border/40">
                <CardContent className="p-8 text-center text-muted-foreground italic text-sm">
                  You haven't caught any Pokemon yet.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pokedex Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Search className="text-primary h-6 w-6" />
                POKEDEX
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Pokemon..."
                  className="pl-9 bg-card/50 border-border/40"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {dexLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {dex?.results.map((p, i) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i % 20) * 0.02 }}
                      >
                        <Card className="bg-card/40 border-border/40 hover:border-primary/30 transition-all group cursor-pointer overflow-hidden">
                          <CardContent className="p-4 flex flex-col items-center text-center">
                            <div className="h-24 w-24 flex items-center justify-center relative">
                              <img src={p.sprite} alt={p.name} className="h-20 w-20 object-contain relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-primary/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                            </div>
                            <h4 className="mt-4 font-bold text-white capitalize truncate w-full">{p.name}</h4>
                            <div className="flex gap-1 mt-2 flex-wrap justify-center">
                              {p.types.map((type) => (
                                <Badge key={type} className={`${TYPE_COLORS[type] || "bg-muted"} text-[8px] h-4 uppercase px-1`}>
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold text-muted-foreground">
                    PAGE {page}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!dex || dex.results.length < 20}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
