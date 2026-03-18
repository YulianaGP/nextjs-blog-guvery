import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Cliente Upstash Redis.
 * Requiere UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en .env
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter para vistas de artículos.
 * Permite 1 incremento por IP+slug cada 1 hora.
 * Esto evita que un usuario infle las vistas recargando la página.
 */
export const viewRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 h"),
  analytics: false,
  prefix: "blog:views",
});
