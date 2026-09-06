import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { batchSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES, ADMIN_ROLES } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireRole(STAFF_ROLES);
    const courseId = req.nextUrl.searchParams.get("courseId");
    const batches = await prisma.batch.findMany({
      where: courseId ? { courseId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { course: true, teacher: { include: { user: true } }, _count: { select: { students: true } } }
    });
    return jsonOk(batches);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = batchSchema.parse(body);
    const batch = await prisma.batch.create({ data });
    return jsonOk(batch, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
