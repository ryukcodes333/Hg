import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useListCards, useGetMyCards, getGetMyCardsQueryKey, getListCardsQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, ChevronLeft, ChevronRight, Box, Filter } from "lucide-react";

export default function Cards() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const { data: allCardsRes, isLoading: allLoading } = useListCards({
    page,
    name: search || undefined,
    tier: tier === "all" ? undefined : tier,
  }, {
    query: { 
      queryKey: getListCardsQueryKey({
        page,
        name: search || undefined,
        tier: tier === "all" ? undefined : tier,
      }),
      enabled: !showOnlyMine 
    },
  });

  const { data: myCards, isLoading: myLoading } = useGetMyCards({
    query: { 
      queryKey: getGetMyCardsQueryKey(),
      enabled: showOnlyMine && isAuthenticated 
    },
  });

  const cards = showOnlyMine 
    ? myCards?.map(uc => uc.card) 
    : allCardsRes?.cards;
    
  const totalPages = allCardsRes ? Math.ceil(allCardsRes.total / 20) : 1;
  const isLoading = showOnlyMine ? myLoading : allLoading;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CARD COLLECTION</h1>
            <p className="text-muted-foreground">Browse and collect rare cards from the Konosuba universe.</p>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-2 bg-card/40 p-3 rounded-xl border border-border/40">
              <Switch 
                id="mine-mode" 
                checked={showOnlyMine}
                onCheckedChange={setShowOnlyMine}
              />
              <Label htmlFor="mine-mode" className="text-sm font-bold cursor-pointer">MY COLLECTION</Label>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or series..."
              className="pl-9 bg-card/50 border-border/40"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={tier} onValueChange={(val) => { setTier(val); setPage(1); }}>
            <SelectTrigger className="bg-card/50 border-border/40">
              <SelectValue placeholder="Filter by Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="T1">Tier 1 (Common)</SelectItem>
              <SelectItem value="T2">Tier 2 (Uncommon)</SelectItem>
              <SelectItem value="T3">Tier 3 (Rare)</SelectItem>
              <SelectItem value="T4">Tier 4 (Epic)</SelectItem>
              <SelectItem value="T5">Tier 5 (Legendary)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border/40">
            <Filter className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <AnimatePresence mode="popLayout">
                {cards?.map((card: any, i: number) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i % 20) * 0.02 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="bg-card/60 border-border/40 overflow-hidden relative group aspect-[2/3] cursor-pointer">
                      <div className="absolute inset-0 z-0">
                        {card.imageUrl ? (
                          <img 
                            src={card.imageUrl} 
                            alt={card.name} 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Box className="h-12 w-12 text-muted-foreground/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                      </div>
                      
                      <CardContent className="p-4 relative z-10 h-full flex flex-col justify-end">
                        <Badge className={`mb-2 w-fit ${
                          card.tier === 'T5' ? 'bg-accent text-accent-foreground' : 
                          card.tier === 'T4' ? 'bg-purple-600' : 
                          'bg-primary/50'
                        }`}>
                          {card.tier}
                        </Badge>
                        <h3 className="font-black text-lg text-white leading-tight uppercase truncate">{card.name}</h3>
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-2">
                          {card.series || 'Original Series'}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-accent font-black text-sm">${card.price.toLocaleString()}</span>
                        </div>
                      </CardContent>
                      
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {cards?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Box className="h-16 w-16 mx-auto mb-4 opacity-10" />
                <p>No cards found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {!showOnlyMine && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-black text-muted-foreground">
                  PAGE {page} OF {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
