import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    await prisma.galleryImage.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
