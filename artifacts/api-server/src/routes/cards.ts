import { Router } from "express";
import { Card, UserCard } from "../lib/mongodb";
import { requireAuth, AuthRequest } from "../middlewares/auth";
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

// GET /api/cards/mine
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

export default router;
