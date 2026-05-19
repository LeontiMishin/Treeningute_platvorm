import cors from "cors";
import express from "express";
import { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import apiRoutes from "./routes";

const app = express();

const allowedOrigins =
  env.corsOrigin === "*"
    ? true
    : env.corsOrigin.split(",").map((origin) => origin.trim());

app.use(
  helmet({
    // Swagger UI uses inline assets that are blocked by Helmet's default CSP.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Treeningute Platvorm backend is running.",
    endpoints: {
      health: "/health",
      swagger: "/api/docs",
      apiBase: "/api",
    },
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/openapi.json", (_req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use(
  "/api/docs",
  (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === "/api/docs") {
      return res.redirect(301, "/api/docs/");
    }

    return next();
  },
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/api/openapi.json",
    },
    customSiteTitle: "Treeningute Platvorm Swagger",
  }),
);
app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
