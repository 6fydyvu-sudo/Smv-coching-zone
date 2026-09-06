import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { examSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireRole(STAFF_ROLES);
    const batchId = req.nextUrl.searchParams.get("batchId");
    const exams = await prisma.exam.findMany({
      where: batchId ? { batchId } : undefined,
      include: { course: true, batch: true, subject: true, _count: { select: { resultEntries: true } } },
      orderBy: { examDate: "desc" }
    });
    return jsonOk(exams);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(STAFF_ROLES);
    const body = await req.json();
    const data = examSchema.parse(body);

    if (data.passMarks > data.fullMarks) {
      return jsonOk({ error: "Pass marks cannot exceed full marks." }, 422);
    }

    const teacherProfile =
      user.role === "TEACHER" ? await prisma.teacherProfile.findUnique({ where: { userId: user.id } }) : null;

    const exam = await prisma.exam.create({
      data: { ...data, examDate: new Date(data.examDate), createdById: teacherProfile?.id }
    });

    return jsonOk(exam, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
