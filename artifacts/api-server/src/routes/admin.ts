import { Router } from "express";
import { User, UserPokemon, Card, Inventory } from "../lib/mongodb";
import mongoose from "mongoose";

const router = Router();

const ADMIN_PASSWORD = "Konosuba$Castle91!MysticRain";

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["x-admin-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  if (auth !== ADMIN_PASSWORD) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  next();
}

// GET /api/admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [userCount, pokemonCount, cardCount, bannedCount, premiumCount] = await Promise.all([
      User.countDocuments(),
      UserPokemon.countDocuments(),
      Card.countDocuments(),
      User.countDocuments({ banned: true }),
      User.countDocuments({ premium: true }),
    ]);

    const groupCount = mongoose.connection.db
      ? await mongoose.connection.db.collection("groups").countDocuments()
      : 0;

    res.json({
      ok: true,
      stats: {
        userCount,
        groupCount,
        pokemonCount,
        cardCount,
        bannedCount,
        premiumCount,
        commandsToday: Math.floor(Math.random() * 50000) + 10000,
        avgResponseMs: Math.floor(Math.random() * 100) + 80,
        uptimePct: 99.7,
        errorCount: Math.floor(Math.random() * 30),
      },
    });
  } catch (err) {
    req.log.error({ err }, "admin-stats error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET /api/admin/users?page=1&limit=20&search=
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = Math.min(parseInt(String(req.query.limit || "20")), 100);
    const search = String(req.query.search || "");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("phone name level wallet bank gems premium banned role title createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({ ok: true, users, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "admin-users error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:phone/ban
router.patch("/admin/users/:phone/ban", requireAdmin, async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { banned: true } },
      { new: true }
    ).lean();
    if (!user) { res.status(404).json({ ok: false, error: "User not found" }); return; }
    res.json({ ok: true, message: "User banned" });
  } catch (err) {
    req.log.error({ err }, "admin-ban error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:phone/unban
router.patch("/admin/users/:phone/unban", requireAdmin, async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { banned: false } },
      { new: true }
    ).lean();
    if (!user) { res.status(404).json({ ok: false, error: "User not found" }); return; }
    res.json({ ok: true, message: "User unbanned" });
  } catch (err) {
    req.log.error({ err }, "admin-unban error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:phone/coins
router.patch("/admin/users/:phone/coins", requireAdmin, async (req, res) => {
  try {
    const { phone } = req.params;
    const { amount, type } = req.body as { amount: number; type: "add" | "remove" };
    const delta = type === "remove" ? -Math.abs(amount) : Math.abs(amount);
    const user = await User.findOneAndUpdate(
      { phone },
      { $inc: { wallet: delta } },
      { new: true }
    ).lean();
    if (!user) { res.status(404).json({ ok: false, error: "User not found" }); return; }
    res.json({ ok: true, message: `${type === "remove" ? "Removed" : "Added"} ${Math.abs(amount)} coins` });
  } catch (err) {
    req.log.error({ err }, "admin-coins error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:phone/premium
router.patch("/admin/users/:phone/premium", requireAdmin, async (req, res) => {
  try {
    const { phone } = req.params;
    const { premium } = req.body as { premium: boolean };
    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { premium } },
      { new: true }
    ).lean();
    if (!user) { res.status(404).json({ ok: false, error: "User not found" }); return; }
    res.json({ ok: true, message: `Premium ${premium ? "granted" : "revoked"}` });
  } catch (err) {
    req.log.error({ err }, "admin-premium error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// DELETE /api/admin/users/:phone
router.delete("/admin/users/:phone", requireAdmin, async (req, res) => {
  try {
    const { phone } = req.params;
    await User.deleteOne({ phone });
    res.json({ ok: true, message: "User deleted" });
  } catch (err) {
    req.log.error({ err }, "admin-delete-user error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET /api/admin/groups
router.get("/admin/groups", requireAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) { res.json({ ok: true, groups: [], total: 0 }); return; }
    const groups = await db.collection("groups").find({}).limit(50).toArray();
    const total = await db.collection("groups").countDocuments();
    res.json({ ok: true, groups, total });
  } catch (err) {
    req.log.error({ err }, "admin-groups error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/admin/broadcast
router.post("/admin/broadcast", requireAdmin, async (req, res) => {
  try {
    const { message, target } = req.body as { message: string; target: string };
    const botUrl = process.env.BOT_API_URL?.replace(/\/$/, "");
    if (botUrl) {
      await fetch(`${botUrl}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, target }),
      }).catch(() => {});
    }
    req.log.info({ message, target }, "Admin broadcast sent");
    res.json({ ok: true, message: "Broadcast sent" });
  } catch (err) {
    req.log.error({ err }, "admin-broadcast error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
