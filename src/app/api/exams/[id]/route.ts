import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { examSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        batch: { include: { students: { include: { user: true } } } },
        subject: true,
        resultEntries: true
      }
    });
    if (!exam) return jsonOk({ error: "Not found" }, 404);
    return jsonOk(exam);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    const body = await req.json();
    if (body.titleEn !== undefined) {
      const data = examSchema.parse(body);
      const exam = await prisma.exam.update({
        where: { id: params.id },
        data: { ...data, examDate: new Date(data.examDate) }
      });
      return jsonOk(exam);
    }
    const exam = await prisma.exam.update({ where: { id: params.id }, data: body });
    return jsonOk(exam);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    await prisma.exam.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
