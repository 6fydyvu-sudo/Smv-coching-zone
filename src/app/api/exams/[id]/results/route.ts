import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resultBulkSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";
import { calculateGrade } from "@/lib/grading";

// Bulk marks entry for one exam — teachers/admin submit the whole class's
// marks in a single request. Grade/GPA are computed server-side so client
// forms never need to duplicate (and can't tamper with) grading logic.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    const body = await req.json();
    const data = resultBulkSchema.parse({ ...body, examId: params.id });

    const exam = await prisma.exam.findUnique({ where: { id: params.id } });
    if (!exam) return jsonOk({ error: "Exam not found." }, 404);

    const fullMarks = Number(exam.fullMarks);

    for (const entry of data.entries) {
      if (!entry.isAbsent && entry.marksObtained != null && entry.marksObtained > fullMarks) {
        return jsonOk(
          { error: `Marks for a student exceed the exam's full marks (${fullMarks}).` },
          422
        );
      }
    }

    const results = await prisma.$transaction(
      data.entries.map((entry) => {
        const { grade, gpa } =
          !entry.isAbsent && entry.marksObtained != null
            ? calculateGrade(entry.marksObtained, fullMarks)
            : { grade: null, gpa: null };

        return prisma.resultEntry.upsert({
          where: { examId_studentId: { examId: params.id, studentId: entry.studentId } },
          create: {
            examId: params.id,
            studentId: entry.studentId,
            marksObtained: entry.isAbsent ? null : entry.marksObtained,
            isAbsent: entry.isAbsent,
            grade,
            gpa
          },
          update: {
            marksObtained: entry.isAbsent ? null : entry.marksObtained,
            isAbsent: entry.isAbsent,
            grade,
            gpa
          }
        });
      })
    );

    return jsonOk(results, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
