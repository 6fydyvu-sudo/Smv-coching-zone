import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * One-time, phone/browser-friendly bootstrap endpoint.
 *
 * Purpose: create the very first Super Admin account without needing a
 * terminal, a database SQL editor, or `npm run seed` — just visiting a URL
 * in a browser. This exists specifically because this project's schema has
 * no other way to create the first account (students come from Admission
 * approval, teachers are created by an existing Admin — but nothing creates
 * the first Admin).
 *
 * Safety, by design:
 *  - Requires a secret (SETUP_SECRET env var, set once in Vercel's
 *    dashboard) matching a query parameter — without it, this endpoint
 *    always refuses.
 *  - Works ONLY when the `User` table is completely empty. The moment one
 *    user exists (which it will, right after you use this once), this
 *    endpoint permanently refuses to create another — it can never be used
 *    to create a second account, even by someone who has the secret.
 *
 * After you've used this once, you can (and should) delete the
 * SETUP_SECRET environment variable in Vercel — the endpoint is harmless
 * either way since it self-disables once a user exists, but removing the
 * secret is an easy extra layer of safety.
 */

const paramsSchema = z.object({
  secret: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

async function handleSetup(req: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      {
        error:
          "SETUP_SECRET is not configured. Add a SETUP_SECRET environment variable in Vercel (any password-like text you choose), redeploy, then try this URL again."
      },
      { status: 500 }
    );
  }

  const url = req.nextUrl;
  const parsed = paramsSchema.safeParse({
    secret: url.searchParams.get("secret") ?? "",
    name: url.searchParams.get("name") ?? "",
    email: url.searchParams.get("email") ?? "",
    password: url.searchParams.get("password") ?? ""
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid parameters. Visit this URL with all four: ?secret=...&name=...&email=...&password=... (password must be at least 6 characters).",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  if (parsed.data.secret !== setupSecret) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 403 });
  }

  let existingUserCount: number;
  try {
    existingUserCount = await prisma.user.count();
  } catch (error) {
    console.error("[SETUP_DB_ERROR]", error);
    return NextResponse.json(
      {
        error:
          "Could not reach the database. This usually means DATABASE_URL isn't set correctly yet, or the database/tables haven't finished being created by the latest deploy. Check Vercel → your project → Deployments → the latest deploy's build log for errors, then try this URL again."
      },
      { status: 500 }
    );
  }

  if (existingUserCount > 0) {
    return NextResponse.json(
      {
        error:
          "Setup already completed — this site already has at least one account. This endpoint only ever works once, on a completely empty database, and will not create additional accounts. Log in at /login instead."
      },
      { status: 409 }
    );
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingEmail) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "SUPER_ADMIN"
      }
    });
  } catch (error) {
    console.error("[SETUP_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Super Admin account created. Go to /login and sign in with the email and password you just used. For extra safety, you can now remove the SETUP_SECRET environment variable in Vercel.",
    email: user.email
  });
}

export async function GET(req: NextRequest) {
  return handleSetup(req);
}

export async function POST(req: NextRequest) {
  return handleSetup(req);
      }
