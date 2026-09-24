import { headers } from 'next/headers';

const buckets = new Map<string, number[]>();

export async function checkRateLimit(keyPrefix: string, limit: number, windowMs: number): Promise<{ limited: boolean; key: string }> {
  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || headerStore.get('x-real-ip')?.trim() || 'anon';
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return { limited: true, key };
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) {
    for (const [k, times] of buckets) {
      if (times.every((at) => now - at >= windowMs)) buckets.delete(k);
    }
  }
  return { limited: false, key };
}

export function checkRateLimitSync(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return true;
  }
  recent.push(now);
  buckets.set(key, recent);
  return false;
}
