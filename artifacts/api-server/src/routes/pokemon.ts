import { Router } from "express";
import { UserPokemon } from "../lib/mongodb";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { GetPokemonDexQueryParams } from "@workspace/api-zod";

const router = Router();

const POKEMON_SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// GET /api/pokemon — current user's pokemon
router.get("/pokemon", requireAuth, async (req: AuthRequest, res) => {
  try {
    const pokemon = await UserPokemon.find({ phone: req.user!.phone })
      .sort({ in_party: -1, slot: 1 })
      .lean() as Record<string, unknown>[];

    const result = pokemon.map((p) => ({
      id: String(p._id),
      pokemonId: p.pokemon_id || 0,
      name: p.name || "Unknown",
      level: p.level || 1,
      xp: p.xp || 0,
      hp: p.hp || 20,
      maxHp: p.max_hp || 20,
      inParty: p.in_party ?? true,
      isShiny: p.is_shiny ?? false,
      types: p.types || [],
      sprite: POKEMON_SPRITE(Number(p.pokemon_id) || 1),
      ball: p.ball || "pokeball",
      slot: p.slot || 1,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "get-user-pokemon error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/pokemon/dex — browse PokeAPI
router.get("/pokemon/dex", async (req, res) => {
  try {
    const parsed = GetPokemonDexQueryParams.safeParse(req.query);
    const page = parsed.success ? (parsed.data.page ?? 1) : 1;
    const search = parsed.success ? (parsed.data.search ?? "") : "";

    if (search) {
      // Search single pokemon
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`
        );
        if (!response.ok) {
          res.json({ results: [], total: 0, page: 1 });
          return;
        }
        const data = (await response.json()) as {
          id: number;
          name: string;
          sprites: { front_default: string };
          types: { type: { name: string } }[];
        };
        res.json({
          results: [
            {
              id: data.id,
              name: data.name,
              sprite: data.sprites.front_default,
              types: data.types.map((t) => t.type.name),
            },
          ],
          total: 1,
          page: 1,
        });
        return;
      } catch {
        res.json({ results: [], total: 0, page: 1 });
        return;
      }
    }

    // List with pagination (48 per page)
    const limit = 48;
    const offset = (Number(page) - 1) * limit;

    const listRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    const listData = (await listRes.json()) as {
      count: number;
      results: { name: string; url: string }[];
    };

    // Get IDs from URLs
    const results = listData.results.map((p) => {
      const id = parseInt(p.url.split("/").filter(Boolean).pop() || "0");
      return {
        id,
        name: p.name,
        sprite: POKEMON_SPRITE(id),
        types: [] as string[],
      };
    });

    res.json({ results, total: listData.count, page: Number(page) });
  } catch (err) {
    req.log.error({ err }, "pokemon-dex error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
