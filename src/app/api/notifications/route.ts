import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireAnyUser, requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireAnyUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return jsonOk(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

const createSchema = z.object({
  userIds: z.array(z.string()).min(1),
  type: z.string().min(1),
  titleBn: z.string().min(1),
  titleEn: z.string().min(1),
  bodyBn: z.string().optional().nullable(),
  bodyEn: z.string().optional().nullable(),
  link: z.string().optional().nullable()
});

// Admin-created announcements fanned out to a list of user ids. This is
// in-app only; wiring this up to push notifications requires VAPID/FCM
// credentials (see README "External services required").
export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = createSchema.parse(body);

    await prisma.notification.createMany({
      data: data.userIds.map((userId) => ({
        userId,
        type: data.type,
        titleBn: data.titleBn,
        titleEn: data.titleEn,
        bodyBn: data.bodyBn,
        bodyEn: data.bodyEn,
        link: data.link
      }))
    });

    return jsonOk({ success: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
