import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In production: serve the built React frontend as static files
if (process.env.NODE_ENV === "production") {
  // Relative to dist/index.mjs → go up to repo root → artifacts/konosuba-bot/dist/public
  const clientDist = join(__dirname, "..", "..", "..", "konosuba-bot", "dist", "public");
  app.use(express.static(clientDist));
  // SPA fallback — all non-API routes return index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

export default app;
