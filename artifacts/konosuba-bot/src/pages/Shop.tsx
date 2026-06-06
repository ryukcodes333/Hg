import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetShop, useBuyItem, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, Box, ShoppingCart, Info, TrendingUp, Shield, Zap, Package } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: ShoppingCart },
  { id: "weapons", label: "Weapons", icon: Shield },
  { id: "armor", label: "Armor", icon: Shield },
  { id: "consumable", label: "Consumable", icon: Zap },
  { id: "tools", label: "Tools", icon: Package },
  { id: "accessories", label: "Accessories", icon: Package },
  { id: "banking", label: "Banking", icon: Wallet },
];

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState("all");
  
  const { data: profile } = useGetProfile({
    query: { 
      queryKey: getGetProfileQueryKey(),
      enabled: isAuthenticated 
    },
  });

  const { data: items, isLoading } = useGetShop({
    type: category === "all" ? undefined : category,
  });

  const buyItemMutation = useBuyItem();

  const handleBuy = async (itemKey: string, name: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to buy items");
      return;
    }

    try {
      await buyItemMutation.mutateAsync({
        data: { itemKey },
      });
      toast.success(`Successfully purchased ${name}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase item");
    }
  };

  const formatMoney = (n: number = 0) => {
    return (n >= 1000) ? (n / 1000).toFixed(2) + 'K' : n.toString();
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">MYSTICAL SHOP</h1>
            <p className="text-muted-foreground">Premium gear and consumables for your RPG journey.</p>
          </div>

          {isAuthenticated && profile && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20"
            >
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-primary tracking-widest">Available Balance</p>
                <p className="text-xl font-black text-accent">${formatMoney(profile.wallet)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
            </motion.div>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full mb-12" onValueChange={setCategory}>
          <div className="flex overflow-x-auto pb-4 no-scrollbar">
            <TabsList className="bg-card/50 border border-border/40 p-1 h-auto flex-nowrap inline-flex">
              {CATEGORIES.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="px-6 py-2.5 data-[state=active]:bg-primary h-auto flex items-center gap-2 whitespace-nowrap"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {items?.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card/40 border-border/40 hover:border-primary/30 transition-all flex flex-col h-full overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Box className="h-6 w-6 text-primary" />
                        </div>
                        <Badge className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest">
                          {item.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {item.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.description || "A mysterious item with hidden powers."}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-accent font-black text-xl">${item.price.toLocaleString()}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full h-11 font-bold group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                        onClick={() => handleBuy(item.key, item.name)}
                        disabled={buyItemMutation.isPending}
                      >
                        {buyItemMutation.isPending ? "Purchasing..." : "BUY NOW"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {items?.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <p>This section of the shop is currently empty.</p>
          </div>
        ) }
      </div>
    </div>
  );
}
