import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// --- Upstash Redis rate limiter (production) ---

function createUpstashLimiter(): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "grc:ratelimit",
  });
}

let upstashLimiter: Ratelimit | null | undefined;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter === undefined) {
    upstashLimiter = createUpstashLimiter();
  }
  return upstashLimiter;
}

// --- In-memory fallback (development) ---

interface InMemoryRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, InMemoryRecord>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanupMemory(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, record] of memoryStore) {
    if (now > record.resetAt) {
      memoryStore.delete(key);
    }
  }
}

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  cleanupMemory();
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

// --- Public API ---

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter();

  if (upstash) {
    try {
      const result = await upstash.limit(key);
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch {
      // Fall back to in-memory if Redis is unreachable
      return inMemoryRateLimit(key, limit, windowMs);
    }
  }

  return inMemoryRateLimit(key, limit, windowMs);
}
