import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    const body = await req.json();
    const material = await prisma.studyMaterial.update({ where: { id: params.id }, data: body });
    return jsonOk(material);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    await prisma.studyMaterial.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
