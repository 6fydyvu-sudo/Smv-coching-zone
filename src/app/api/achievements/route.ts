import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { achievementSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(ADMIN_ROLES);
    const achievements = await prisma.achievement.findMany({ orderBy: { createdAt: "desc" } });
    return jsonOk(achievements);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = achievementSchema.parse(body);
    const achievement = await prisma.achievement.create({ data });
    return jsonOk(achievement, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
