import rateLimit from "express-rate-limit";

export const generateSummaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: { error: "Too many requests. Please wait before generating another summary." },
  standardHeaders: true,
  legacyHeaders: false,
});
