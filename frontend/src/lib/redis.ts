import Redis from "ioredis";

const MONTHLY_LIMIT = 3_000;
const DAILY_LIMIT = 100;
const MONTHLY_WARN_AT = 2_700; // 90%
const DAILY_WARN_AT = 85;      // 85%

export type LimitWarning = {
  type: "monthly" | "daily";
  count: number;
  limit: number;
};

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? "redis://redis:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }
  return client;
}

export async function trackEmailSent(): Promise<LimitWarning | null> {
  try {
    const redis = getRedisClient();
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const ymd = now.toISOString().slice(0, 10);

    const monthKey     = `resend:monthly:${ym}`;
    const dayKey       = `resend:daily:${ymd}`;
    const monthWarnKey = `resend:warned:monthly:${ym}`;
    const dayWarnKey   = `resend:warned:daily:${ymd}`;

    const [monthCount, dayCount] = await Promise.all([
      redis.incr(monthKey),
      redis.incr(dayKey),
    ]);
    if (monthCount === 1) await redis.expire(monthKey, 60 * 60 * 24 * 35);
    if (dayCount === 1)   await redis.expire(dayKey,   60 * 60 * 48);

    // 日次を優先チェック（より緊急）
    if (dayCount >= DAILY_WARN_AT) {
      const warned = await redis.exists(dayWarnKey);
      if (!warned) {
        await redis.set(dayWarnKey, "1", "EX", 60 * 60 * 48);
        return { type: "daily", count: dayCount, limit: DAILY_LIMIT };
      }
    }

    if (monthCount >= MONTHLY_WARN_AT) {
      const warned = await redis.exists(monthWarnKey);
      if (!warned) {
        await redis.set(monthWarnKey, "1", "EX", 60 * 60 * 24 * 35);
        return { type: "monthly", count: monthCount, limit: MONTHLY_LIMIT };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  ip: string,
  limit = 5,
  windowSec = 600
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const key = `contact:ratelimit:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    return count <= limit;
  } catch {
    // Redisが使えない場合はブロックしない
    return true;
  }
}
