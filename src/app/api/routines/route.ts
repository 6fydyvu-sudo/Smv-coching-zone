import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { routineSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES, STAFF_ROLES } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireRole(STAFF_ROLES);
    const batchId = req.nextUrl.searchParams.get("batchId");
    const teacherId = req.nextUrl.searchParams.get("teacherId");

    const routines = await prisma.routine.findMany({
      where: { ...(batchId ? { batchId } : {}), ...(teacherId ? { teacherId } : {}) },
      include: { course: true, subject: true, teacher: { include: { user: true } }, batch: true },
      orderBy: { startTime: "asc" }
    });
    return jsonOk(routines);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = routineSchema.parse(body);
    const routine = await prisma.routine.create({ data });
    return jsonOk(routine, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
