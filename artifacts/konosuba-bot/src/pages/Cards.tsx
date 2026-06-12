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
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, ChevronLeft, ChevronRight, Box, Heart, Users, X } from "lucide-react";

interface CardDetail {
  id: string;
  name: string;
  tier: string;
  series: string;
  imageUrl: string | null;
  rarity: string;
  ownerCount: number;
  wishlistCount: number;
  wishlisted: boolean;
}

const TIER_COLORS: Record<string, string> = {
  T5:  "bg-yellow-500/80 text-black",
  T4:  "bg-purple-600",
  T3:  "bg-blue-500",
  T2:  "bg-green-600",
  T1:  "bg-zinc-600",
  TS:  "bg-amber-400 text-black",
  C:   "bg-zinc-500",
  R:   "bg-blue-500",
  SR:  "bg-purple-600",
  SSR: "bg-yellow-500/80 text-black",
  UR:  "bg-red-500",
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

  const cards = showOnlyMine ? myCards?.map((uc: any) => uc.card) : allCardsRes?.cards;
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
      // ignore
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
    <div className="min-h-screen bg-[#0b0d12] pt-24 pb-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CARD COLLECTION</h1>
            <p className="text-white/40">Browse and collect rare cards from the Konosuba universe.</p>
          </div>
          {isAuthenticated && (
            <div className="flex items-center space-x-2 bg-white/[0.04] p-3 rounded-xl border border-white/10">
              <Switch id="mine-mode" checked={showOnlyMine} onCheckedChange={setShowOnlyMine} />
              <Label htmlFor="mine-mode" className="text-sm font-bold cursor-pointer text-white/70">MY COLLECTION</Label>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search by name or series..."
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30
                focus-visible:ring-[#4effff]/30 focus-visible:border-[#4effff]/40"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={tier} onValueChange={(val) => { setTier(val); setPage(1); }}>
            <SelectTrigger className="bg-white/[0.04] border-white/10 text-white/70">
              <SelectValue placeholder="Filter by Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="T1">T1 (Common)</SelectItem>
              <SelectItem value="T2">T2 (Uncommon)</SelectItem>
              <SelectItem value="T3">T3 (Rare)</SelectItem>
              <SelectItem value="T4">T4 (Epic)</SelectItem>
              <SelectItem value="T5">T5 (Legendary)</SelectItem>
              <SelectItem value="TS">TS (Special)</SelectItem>
              <SelectItem value="C">C (Mazoku)</SelectItem>
              <SelectItem value="R">R (Mazoku)</SelectItem>
              <SelectItem value="SR">SR (Mazoku)</SelectItem>
              <SelectItem value="SSR">SSR (Mazoku)</SelectItem>
              <SelectItem value="UR">UR (Mazoku)</SelectItem>
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
                    <Card className="bg-white/[0.04] border-white/[0.06] overflow-hidden relative group aspect-[2/3]
                      hover:border-[#4effff]/20 hover:shadow-[0_8px_25px_rgba(78,255,255,0.08)] transition-all">
                      <div className="absolute inset-0 z-0">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                            <Box className="h-10 w-10 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-75" />
                      </div>

                      <CardContent className="p-2.5 relative z-10 h-full flex flex-col justify-end">
                        <Badge className={`mb-1 w-fit text-[9px] px-1.5 py-0 ${TIER_COLORS[card.tier] || "bg-[#4effff]/20"}`}>
                          {card.tier}
                        </Badge>
                        <h3 className="font-bold text-[11px] text-white leading-tight truncate">{card.name}</h3>
                        <p className="text-white/50 text-[9px] font-medium tracking-wider uppercase truncate">
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
              <div className="text-center py-20 text-white/30">
                <Box className="h-16 w-16 mx-auto mb-4 opacity-10" />
                <p>No cards found matching your criteria.</p>
              </div>
            )}

            {!showOnlyMine && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <Button
                  variant="outline" size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/10 hover:border-[#4effff]/30 hover:text-[#4effff]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-black text-white/40">
                  PAGE {page} OF {totalPages}
                </span>
                <Button
                  variant="outline" size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-white/10 hover:border-[#4effff]/30 hover:text-[#4effff]"
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
        <SheetContent
          side="bottom"
          className="h-[92vh] rounded-t-3xl bg-[#0d0f16] border-t border-white/[0.08] p-0 overflow-hidden flex flex-col
            [&>button:first-of-type]:left-4 [&>button:first-of-type]:right-auto"
        >
          {detailLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 rounded-full border-2 border-[#4effff] border-t-transparent animate-spin" />
            </div>
          ) : selectedCard ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Full card image */}
              <div className="w-full bg-black shrink-0 flex items-center justify-center relative">
                {/* X button — top LEFT */}
                <SheetClose className="absolute left-4 top-4 z-20 w-8 h-8 rounded-full flex items-center justify-center
                  bg-black/60 border border-white/10 text-white/60 hover:text-white hover:bg-black/80 transition-all">
                  <X className="h-4 w-4" />
                </SheetClose>

                {selectedCard.imageUrl ? (
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.name}
                    className="w-full max-h-[58vh] object-contain block"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-white/[0.02]">
                    <Box className="h-16 w-16 text-white/20" />
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="flex-1 px-5 pt-4 pb-8 space-y-4 bg-[#0d0f16]">
                <Badge className={`text-xs px-2.5 py-0.5 ${TIER_COLORS[selectedCard.tier] || "bg-[#4effff]/20"}`}>
                  {selectedCard.tier}
                </Badge>

                <SheetHeader className="text-left p-0">
                  <SheetTitle className="text-xl font-black text-white leading-tight">
                    {selectedCard.name}
                  </SheetTitle>
                  <p className="text-white/40 text-xs font-bold tracking-widest uppercase mt-0.5">
                    {selectedCard.series || "Original Series"}
                  </p>
                </SheetHeader>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: "Owners",     value: selectedCard.ownerCount },
                    { icon: Heart, label: "Wishlisted", value: selectedCard.wishlistCount },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white/[0.03] rounded-2xl p-3 text-center border border-white/[0.06]">
                      <Icon className="h-4 w-4 mx-auto mb-1 text-[#4effff]" />
                      <div className="text-sm font-black text-white">{value}</div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Rarity:</span>
                  <Badge variant="outline" className="text-xs border-white/10 text-white/60">{selectedCard.rarity}</Badge>
                </div>

                {isAuthenticated && (
                  <Button
                    className={`w-full h-12 rounded-2xl font-black tracking-wide text-sm transition-all ${
                      selectedCard.wishlisted
                        ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                        : "bg-[rgba(78,255,255,0.1)] border border-[#4effff]/30 text-[#4effff] hover:bg-[rgba(78,255,255,0.2)]"
                    }`}
                    variant="ghost"
                    disabled={wishlistLoading}
                    onClick={toggleWishlist}
                  >
                    <Heart className={`h-4 w-4 mr-2 transition-all ${selectedCard.wishlisted ? "fill-red-400 text-red-400" : ""}`} />
                    {wishlistLoading
                      ? "..."
                      : selectedCard.wishlisted
                      ? "REMOVE FROM WISHLIST"
                      : "ADD TO WISHLIST"}
                  </Button>
                )}

                {!isAuthenticated && (
                  <p className="text-center text-white/30 text-xs">
                    <a href="/login" className="text-[#4effff] underline">Login</a> to wishlist this card.
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
