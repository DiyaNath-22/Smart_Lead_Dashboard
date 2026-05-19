import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { NotFoundError } from "./utils/appError.js";

const app = express();

// Set HTTP headers for security
app.use(helmet());

// Enable CORS with support for credentials headers
app.use(
  cors({
    origin: "*", // Adjust in production to specific frontend domains
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));

// Rate limiting middleware
app.use("/api", globalLimiter);

// Bind API routing subtrees
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

// Catch-all route to trigger 404 error
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Requested resource '${req.originalUrl}' not found.`));
});

// Centralized error treatment middleware
app.use(errorHandler);

export default app;
export { app };
