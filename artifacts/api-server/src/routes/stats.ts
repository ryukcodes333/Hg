import { Router } from "express";
import { User, Card, UserPokemon } from "../lib/mongodb";
import mongoose from "mongoose";

const router = Router();

// GET /api/stats
router.get("/stats", async (req, res) => {
  try {
    const [userCount, cardCount, pokemonCount] = await Promise.all([
      User.countDocuments(),
      Card.countDocuments(),
      UserPokemon.countDocuments(),
    ]);

    const groupCount = mongoose.connection.db
      ? await mongoose.connection.db.collection("groups").countDocuments()
      : 0;

    res.json({ userCount, cardCount, groupCount, pokemonCount });
  } catch (err) {
    req.log.error({ err }, "get-stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
