import { Router } from "express";
import { Card, UserCard, Wishlist } from "../lib/mongodb";
import { requireAuth, optionalAuth, AuthRequest } from "../middlewares/auth";
import { ListCardsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatCard(c: Record<string, unknown>) {
  return {
    id: String(c._id),
    name: c.name || "Unknown",
    tier: c.tier || "T1",
    series: c.series || "Unknown",
    price: c.price || 35000,
    imageUrl: c.image_url || null,
    rarity: c.rarity || "Common",
    uploadedBy: c.uploaded_by || "system",
    externalId: c.external_id || null,
  };
}

// GET /api/cards/mine — MUST be before /:id
router.get("/cards/mine", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userCards = await UserCard.find({ phone: req.user!.phone })
      .populate("card_id")
      .sort({ in_deck: -1, createdAt: 1 })
      .lean() as Record<string, unknown>[];

    const result = userCards
      .filter((uc) => uc.card_id)
      .map((uc) => ({
        id: String(uc._id),
        inDeck: uc.in_deck ?? false,
        card: formatCard(uc.card_id as Record<string, unknown>),
      }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "my-cards error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/cards
router.get("/cards", async (req, res) => {
  try {
    const parsed = ListCardsQueryParams.safeParse(req.query);
    const { tier, series, name, page } = parsed.success
      ? parsed.data
      : { tier: undefined, series: undefined, name: undefined, page: 1 };

    const query: Record<string, unknown> = {};
    if (tier) query.tier = tier;
    if (series) query.series = { $regex: series, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    const pageNum = Math.max(1, Number(page) || 1);
    const limit = 48;
    const skip = (pageNum - 1) * limit;

    const [cards, total] = await Promise.all([
      Card.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Card.countDocuments(query),
    ]);

    res.json({
      cards: (cards as Record<string, unknown>[]).map(formatCard),
      total,
      page: pageNum,
    });
  } catch (err) {
    req.log.error({ err }, "list-cards error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/cards/:id — single card with ownerCount + wishlistCount
router.get("/cards/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const card = await Card.findById(req.params.id).lean() as Record<string, unknown> | null;
    if (!card) return res.status(404).json({ error: "Card not found" });

    const [ownerCount, wishlistCount] = await Promise.all([
      UserCard.countDocuments({ card_id: card._id }),
      Wishlist.countDocuments({ card_id: card._id }),
    ]);

    let wishlisted = false;
    if (req.user?.phone) {
      const wl = await Wishlist.findOne({ phone: req.user.phone, card_id: card._id });
      wishlisted = !!wl;
    }

    res.json({ ...formatCard(card), ownerCount, wishlistCount, wishlisted });
  } catch (err) {
    req.log.error({ err }, "get-card error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/cards/:id/wishlist — toggle wishlist (auth required)
router.post("/cards/:id/wishlist", requireAuth, async (req: AuthRequest, res) => {
  try {
    const card = await Card.findById(req.params.id).lean();
    if (!card) return res.status(404).json({ error: "Card not found" });

    const phone = req.user!.phone;
    const existing = await Wishlist.findOne({ phone, card_id: card._id });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      const count = await Wishlist.countDocuments({ card_id: card._id });
      return res.json({ wishlisted: false, wishlistCount: count });
    } else {
      await Wishlist.create({ phone, card_id: card._id });
      const count = await Wishlist.countDocuments({ card_id: card._id });
      return res.json({ wishlisted: true, wishlistCount: count });
    }
  } catch (err) {
    req.log.error({ err }, "wishlist-toggle error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
