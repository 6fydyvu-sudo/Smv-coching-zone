import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { routineSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    if (body.day !== undefined) {
      const data = routineSchema.parse(body);
      const routine = await prisma.routine.update({ where: { id: params.id }, data });
      return jsonOk(routine);
    }
    const routine = await prisma.routine.update({ where: { id: params.id }, data: body });
    return jsonOk(routine);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    await prisma.routine.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
