interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

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

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
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
