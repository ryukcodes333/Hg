import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import leaderboardRouter from "./leaderboard";
import pokemonRouter from "./pokemon";
import cardsRouter from "./cards";
import shopRouter from "./shop";
import statsRouter from "./stats";
import adminRouter from "./admin";
import guildRouter from "./guild";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(leaderboardRouter);
router.use(pokemonRouter);
router.use(cardsRouter);
router.use(shopRouter);
router.use(statsRouter);
router.use(adminRouter);
router.use(guildRouter);

export default router;
