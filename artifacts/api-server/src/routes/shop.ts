import { Router } from "express";
import { User, Inventory } from "../lib/mongodb";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { GetShopQueryParams, BuyItemBody } from "@workspace/api-zod";

const router = Router();

const SHOP_ITEMS: Record<
  string,
  { name: string; price: number; type: string; emoji: string; description: string; currency: string }
> = {
  sword:          { name: "Sword",              price: 500,    type: "weapon",    emoji: "⚔️",  description: "A sharp blade for combat",           currency: "wallet" },
  shield:         { name: "Shield",             price: 400,    type: "weapon",    emoji: "🛡️",  description: "Defensive protection in battle",      currency: "wallet" },
  bow:            { name: "Bow",                price: 350,    type: "weapon",    emoji: "🏹",  description: "Ranged attack weapon",                currency: "wallet" },
  dagger:         { name: "Dagger",             price: 300,    type: "weapon",    emoji: "🗡️",  description: "Fast melee weapon",                  currency: "wallet" },
  axe:            { name: "Battle Axe",         price: 650,    type: "weapon",    emoji: "🪓",  description: "Heavy hitting two-handed weapon",     currency: "wallet" },
  staff_wep:      { name: "Magic Staff",        price: 700,    type: "weapon",    emoji: "🪄",  description: "Amplifies magical abilities",         currency: "wallet" },
  spear:          { name: "Spear",              price: 550,    type: "weapon",    emoji: "🔱",  description: "Long range melee weapon",             currency: "wallet" },
  armor:          { name: "Iron Armor",         price: 800,    type: "armor",     emoji: "🥋",  description: "Heavy protection for the body",       currency: "wallet" },
  helmet:         { name: "Steel Helmet",       price: 450,    type: "armor",     emoji: "⛑️",  description: "Protects your head in battle",        currency: "wallet" },
  boots:          { name: "Shadow Boots",       price: 380,    type: "armor",     emoji: "👟",  description: "Increases movement speed",            currency: "wallet" },
  potion:         { name: "Health Potion",      price: 100,    type: "consumable",emoji: "🧪",  description: "Restores HP in battle",               currency: "wallet" },
  elixir:         { name: "Mana Elixir",        price: 120,    type: "consumable",emoji: "💙",  description: "Restores MP for special skills",      currency: "wallet" },
  energy:         { name: "Energy Drink",       price: 80,     type: "consumable",emoji: "⚡",  description: "Temporarily boosts stats",            currency: "wallet" },
  antidote:       { name: "Antidote",           price: 90,     type: "consumable",emoji: "💊",  description: "Cures poison status effects",         currency: "wallet" },
  bomb:           { name: "Shadow Bomb",        price: 200,    type: "consumable",emoji: "💣",  description: "Deals area damage in battle",         currency: "wallet" },
  ticket:         { name: "Luck Ticket",        price: 150,    type: "tool",      emoji: "🎟️",  description: "Increases loot drop chance",          currency: "wallet" },
  pickaxe:        { name: "Pickaxe",            price: 280,    type: "tool",      emoji: "⛏️",  description: "Used for mining resources",           currency: "wallet" },
  fishingrod:     { name: "Fishing Rod",        price: 220,    type: "tool",      emoji: "🎣",  description: "For fishing activities",              currency: "wallet" },
  map:            { name: "Treasure Map",       price: 500,    type: "tool",      emoji: "🗺️",  description: "Reveals hidden treasure locations",   currency: "wallet" },
  lantern:        { name: "Shadow Lantern",     price: 180,    type: "tool",      emoji: "🏮",  description: "Lights the way in dark dungeons",     currency: "wallet" },
  ring:           { name: "Power Ring",         price: 950,    type: "accessory", emoji: "💍",  description: "Boosts overall power stats",          currency: "wallet" },
  amulet:         { name: "Mana Amulet",        price: 850,    type: "accessory", emoji: "📿",  description: "Enhances magical abilities",          currency: "wallet" },
  cloak:          { name: "Shadow Cloak",       price: 1200,   type: "accessory", emoji: "🧣",  description: "Increases stealth and evasion",       currency: "wallet" },
  bank_note:      { name: "Bank Note",          price: 10000,  type: "banking",   emoji: "💵",  description: "Increases bank limit by 10,000",      currency: "wallet" },
  bank_note_100k: { name: "Bank Note (100K)",   price: 50000,  type: "banking",   emoji: "💴",  description: "Increases bank limit by 100,000",     currency: "wallet" },
  bank_note_500k: { name: "Bank Note (500K)",   price: 100000, type: "banking",   emoji: "💶",  description: "Increases bank limit by 500,000",     currency: "wallet" },
  bank_note_1m:   { name: "Bank Note (1M)",     price: 500000, type: "banking",   emoji: "💷",  description: "Increases bank limit by 1,000,000",   currency: "wallet" },
};

// GET /api/shop
router.get("/shop", (req, res) => {
  try {
    const parsed = GetShopQueryParams.safeParse(req.query);
    const type = parsed.success ? parsed.data.type : undefined;

    const items = Object.entries(SHOP_ITEMS)
      .filter(([, v]) => !type || v.type === type)
      .map(([key, v]) => ({
        key,
        name: v.name,
        price: v.price,
        type: v.type,
        description: v.description,
        currency: v.currency,
      }));

    res.json(items);
  } catch (err) {
    req.log.error({ err }, "get-shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/shop/buy
router.post("/shop/buy", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = BuyItemBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ ok: false, message: "Invalid request", newBalance: 0 }); return; }

    const itemKey = parsed.data.itemKey.toLowerCase();
    const shopItem = SHOP_ITEMS[itemKey];
    if (!shopItem) { res.status(400).json({ ok: false, message: "Item not found in shop", newBalance: 0 }); return; }

    const user = await User.findOne({ phone: req.user!.phone }).lean() as Record<string, unknown> | null;
    if (!user) { res.status(404).json({ ok: false, message: "User not found", newBalance: 0 }); return; }

    const balance = Number(user.wallet) || 0;
    if (balance < shopItem.price) {
      res.json({ ok: false, message: `Insufficient funds. Need $${shopItem.price.toLocaleString()}, you have $${balance.toLocaleString()}`, newBalance: balance });
      return;
    }

    const newBalance = balance - shopItem.price;
    await User.findOneAndUpdate({ phone: req.user!.phone }, { $set: { wallet: newBalance } });
    await Inventory.findOneAndUpdate(
      { phone: req.user!.phone, item: shopItem.name },
      { $inc: { quantity: 1 } },
      { upsert: true }
    );

    res.json({ ok: true, message: `Purchased ${shopItem.name} for $${shopItem.price.toLocaleString()}!`, newBalance });
  } catch (err) {
    req.log.error({ err }, "buy-item error");
    res.status(500).json({ ok: false, message: "Internal server error", newBalance: 0 });
  }
});

// GET /api/inventory
router.get("/inventory", requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await Inventory.find({ phone: req.user!.phone }).lean() as Record<string, unknown>[];

    const shopItemsByName = Object.fromEntries(
      Object.values(SHOP_ITEMS).map((v) => [v.name.toLowerCase(), v])
    );

    const result = items.map((item) => {
      const shopData = shopItemsByName[String(item.item).toLowerCase()];
      return {
        item: item.item,
        quantity: item.quantity,
        emoji: shopData?.emoji || "📦",
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "get-inventory error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
