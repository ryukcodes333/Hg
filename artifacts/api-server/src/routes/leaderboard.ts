import { Router } from "express";
import { User } from "../lib/mongodb";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /api/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const parsed = GetLeaderboardQueryParams.safeParse(req.query);
    const type = parsed.success ? (parsed.data.type ?? "xp") : "xp";
    const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;

    const sortField: [string, 1 | -1][] =
      type === "rich" ? [["bank", -1], ["wallet", -1]] : [["xp", -1], ["level", -1]];

    const users = await User.find({ banned: false })
      .sort(sortField)
      .limit(Math.min(Number(limit), 100))
      .lean();

    const result = (users as Record<string, unknown>[]).map((u, i) => ({
      rank: i + 1,
      phone: u.phone,
      name: u.name || "Unknown",
      level: u.level || 1,
      xp: u.xp || 0,
      wallet: u.wallet || 0,
      bank: u.bank || 0,
      role: u.role || "member",
      profilePp: u.profile_pp || null,
      profileFrame: u.profile_frame || 1,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "leaderboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
