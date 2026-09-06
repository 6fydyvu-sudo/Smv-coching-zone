import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireAnyUser } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAnyUser();
    const notification = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!notification || notification.userId !== user.id) {
      return jsonOk({ error: "Not found" }, 404);
    }
    const body = await req.json();
    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: body.isRead ?? true }
    });
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
