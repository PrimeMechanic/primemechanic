import { randomBytes, createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db } from "./db";
import { sessions, users } from "../shared/schema";
import { ensure, publicUser } from "./policy";

export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function bearer(req: Request) {
  return /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || "")?.[1];
}
export async function issueSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    tokenHash: tokenHash(token),
    userId,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  return token;
}
export async function sessionUser(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return undefined;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    );
  return row?.user;
}
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await sessionUser(bearer(req));
    ensure(user, 401, "Please sign in");
    res.locals.user = publicUser(user);
    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    next(error);
  }
}
// Per-process guard complements the required deployment ingress rate limit.
const attempts = new Map<string, { count: number; until: number }>();
export function limitAuth(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.until < now) attempts.delete(key);
  const address = req.ip || req.socket.remoteAddress || "unknown";
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase().slice(0, 255)
      : "";
  const key = tokenHash(`${address}:${email}`);
  if (!attempts.has(key) && attempts.size >= 10000) {
    res.status(503).json({ error: "Please try again later" });
    return;
  }
  const value = attempts.get(key) || { count: 0, until: now + 15 * 60000 };
  if (++value.count > 30) {
    res.set("Retry-After", String(Math.ceil((value.until - now) / 1000)));
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }
  attempts.set(key, value);
  next();
}
