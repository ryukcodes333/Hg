import { useState, useCallback } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, ChevronLeft, ChevronRight, Box, Heart, Users, Star } from "lucide-react";

interface CardDetail {
  id: string;
  name: string;
  tier: string;
  series: string;
  price: number;
  imageUrl: string | null;
  rarity: string;
  ownerCount: number;
  wishlistCount: number;
  wishlisted: boolean;
}

const TIER_COLORS: Record<string, string> = {
  T5: "bg-yellow-500/80 text-black",
  T4: "bg-purple-600",
  T3: "bg-blue-500",
  T2: "bg-green-600",
  T1: "bg-zinc-600",
};

export default function Cards() {
  const { isAuthenticated, token } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const [selectedCard, setSelectedCard] = useState<CardDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { data: allCardsRes, isLoading: allLoading } = useListCards(
    { page, name: search || undefined, tier: tier === "all" ? undefined : tier },
    {
      query: {
        queryKey: getListCardsQueryKey({ page, name: search || undefined, tier: tier === "all" ? undefined : tier }),
        enabled: !showOnlyMine,
      },
    }
  );

  const { data: myCards, isLoading: myLoading } = useGetMyCards({
    query: { queryKey: getGetMyCardsQueryKey(), enabled: showOnlyMine && isAuthenticated },
  });

  const cards = showOnlyMine ? myCards?.map((uc) => uc.card) : allCardsRes?.cards;
  const totalPages = allCardsRes ? Math.ceil(allCardsRes.total / 48) : 1;
  const isLoading = showOnlyMine ? myLoading : allLoading;

  const openCard = useCallback(async (card: { id: string }) => {
    setDetailLoading(true);
    setSelectedCard(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/cards/${card.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSelectedCard(data);
      }
    } catch {
      // ignore — sheet won't open
    } finally {
      setDetailLoading(false);
    }
  }, [token]);

  const toggleWishlist = useCallback(async () => {
    if (!selectedCard || !isAuthenticated) return;
    setWishlistLoading(true);
    try {
      const res = await fetch(`/api/cards/${selectedCard.id}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCard((prev) =>
          prev ? { ...prev, wishlisted: data.wishlisted, wishlistCount: data.wishlistCount } : prev
        );
      }
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  }, [selectedCard, isAuthenticated, token]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CARD COLLECTION</h1>
            <p className="text-muted-foreground">Browse and collect rare cards from the Konosuba universe.</p>
          </div>
          {isAuthenticated && (
            <div className="flex items-center space-x-2 bg-card/40 p-3 rounded-xl border border-border/40">
              <Switch id="mine-mode" checked={showOnlyMine} onCheckedChange={setShowOnlyMine} />
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
          <div />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {cards?.map((card: any, i: number) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i % 24) * 0.02 }}
                    whileHover={{ y: -8 }}
                    className="cursor-pointer"
                    onClick={() => openCard(card)}
                  >
                    <Card className="bg-card/60 border-border/40 overflow-hidden relative group aspect-[2/3]">
                      <div className="absolute inset-0 z-0">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Box className="h-10 w-10 text-muted-foreground/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-75" />
                      </div>

                      <CardContent className="p-2.5 relative z-10 h-full flex flex-col justify-end">
                        <Badge className={`mb-1 w-fit text-[9px] px-1.5 py-0 ${TIER_COLORS[card.tier] || "bg-primary/50"}`}>
                          {card.tier}
                        </Badge>
                        <h3 className="font-bold text-[11px] text-white leading-tight truncate">{card.name}</h3>
                        <p className="text-muted-foreground/80 text-[9px] font-medium tracking-wider uppercase truncate">
                          {card.series || "Original"}
                        </p>
                      </CardContent>

                      {/* Shine */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
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
                  variant="outline" size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-black text-muted-foreground">
                  PAGE {page} OF {totalPages}
                </span>
                <Button
                  variant="outline" size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Detail Sheet */}
      <Sheet open={!!selectedCard || detailLoading} onOpenChange={(open) => { if (!open) setSelectedCard(null); }}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-card border-t border-border/40 p-0 overflow-hidden">
          {detailLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : selectedCard ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Card image hero */}
              <div className="relative w-full h-[45%] shrink-0">
                {selectedCard.imageUrl ? (
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Box className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <Badge className={`text-xs px-2 py-0.5 ${TIER_COLORS[selectedCard.tier] || "bg-primary/50"}`}>
                    {selectedCard.tier}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 px-5 pt-4 pb-8 space-y-5">
                <SheetHeader className="text-left p-0">
                  <SheetTitle className="text-xl font-black text-white leading-tight">
                    {selectedCard.name}
                  </SheetTitle>
                  <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase mt-0.5">
                    {selectedCard.series || "Original Series"}
                  </p>
                </SheetHeader>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Users, label: "Owners", value: selectedCard.ownerCount },
                    { icon: Heart, label: "Wishlisted", value: selectedCard.wishlistCount },
                    { icon: Star, label: "Price", value: `$${selectedCard.price.toLocaleString()}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-background/50 rounded-2xl p-3 text-center border border-border/30">
                      <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <div className="text-sm font-black text-white">{value}</div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Rarity tag */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Rarity:</span>
                  <Badge variant="outline" className="text-xs border-border/40">{selectedCard.rarity}</Badge>
                </div>

                {/* Wishlist button */}
                {isAuthenticated && (
                  <Button
                    className={`w-full h-12 rounded-2xl font-black tracking-wide text-sm transition-all ${
                      selectedCard.wishlisted
                        ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                        : "bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
                    }`}
                    variant="ghost"
                    disabled={wishlistLoading}
                    onClick={toggleWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 transition-all ${selectedCard.wishlisted ? "fill-red-400 text-red-400" : ""}`}
                    />
                    {wishlistLoading
                      ? "..."
                      : selectedCard.wishlisted
                      ? "REMOVE FROM WISHLIST"
                      : "ADD TO WISHLIST"}
                  </Button>
                )}

                {!isAuthenticated && (
                  <p className="text-center text-muted-foreground text-xs">
                    <a href="/login" className="text-primary underline">Login</a> to wishlist this card.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
