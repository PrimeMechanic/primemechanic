import { z } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function ensure(
  condition: unknown,
  status: number,
  message: string,
): asserts condition {
  if (!condition) throw new HttpError(status, message);
}
export const id = z.coerce.number().int().positive().max(2147483647);
export const email = z.string().trim().toLowerCase().email().max(255);
export const password = z
  .string()
  .min(12)
  .max(72)
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72);
export const signup = z
  .object({
    email,
    password,
    name: z.string().trim().min(1).max(255),
    phone: z.string().max(20).nullable().optional(),
    role: z.enum(["customer", "mechanic"]).default("customer"),
  })
  .strict();
export function publicUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}
export function cents(value: string): number {
  ensure(/^\d{1,7}(\.\d{1,2})?$/.test(value), 400, "Invalid price");
  const [whole, fraction = ""] = value.split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  ensure(
    Number.isSafeInteger(result) && result >= 50,
    400,
    "Price must be at least $0.50",
  );
  return result;
}
export function money(value: number) {
  return (value / 100).toFixed(2);
}
export function transition(
  from: string,
  to: string,
  actor: "customer" | "mechanic",
  paid: boolean,
) {
  if (from === to) return false;
  const allowed =
    actor === "customer"
      ? {
          pending: ["cancelled"],
          accepted: ["cancelled"],
          upcoming: ["cancelled"],
        }
      : {
          pending: ["accepted", "declined"],
          accepted: ["in_progress"],
          upcoming: ["in_progress"],
          in_progress: ["completed"],
        };
  ensure(
    ((allowed as Record<string, string[]>)[from] || []).includes(to),
    409,
    "Invalid booking transition",
  );
  ensure(
    !(actor === "customer" && paid),
    409,
    "Paid bookings require a support refund before cancellation",
  );
  return true;
}
export function publicOrigin() {
  const configured =
    process.env.PUBLIC_APP_URL ||
    (process.env.EXPO_PUBLIC_DOMAIN
      ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
      : undefined);
  ensure(configured, 503, "PUBLIC_APP_URL is not configured");
  const url = new URL(configured);
  ensure(
    url.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && url.hostname === "localhost"),
    503,
    "HTTPS origin required",
  );
  return url.origin;
}
