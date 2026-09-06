import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { attendanceMarkSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, requireAnyUser, STAFF_ROLES } from "@/lib/rbac";

// GET: fetch attendance for a given batch/date (and optionally subject) to
// pre-fill the marking form, or a student's full history via studentId.
export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyUser();
    const batchId = req.nextUrl.searchParams.get("batchId");
    const date = req.nextUrl.searchParams.get("date");
    const studentId = req.nextUrl.searchParams.get("studentId");

    if (studentId) {
      // Students may only ever fetch their own attendance; enforced below
      // once student self-service routes attach the profile id (see
      // /api/me/attendance for the safe self-service variant).
      if (user.role === "STUDENT") {
        return jsonOk({ error: "Use /api/me/attendance to view your own attendance." }, 403);
      }
      const records = await prisma.attendanceRecord.findMany({
        where: { studentId },
        include: { session: true },
        orderBy: { session: { date: "desc" } }
      });
      return jsonOk(records);
    }

    if (batchId && date) {
      if (user.role === "STUDENT") {
        return jsonOk({ error: "Forbidden" }, 403);
      }
      const session = await prisma.attendanceSession.findFirst({
        where: { batchId, date: new Date(date) },
        include: { records: { include: { student: { include: { user: true } } } } }
      });
      return jsonOk(session);
    }

    return jsonOk({ error: "Provide batchId+date or studentId." }, 400);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: create or overwrite a day's attendance for a batch in one call.
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(STAFF_ROLES);
    const body = await req.json();
    const data = attendanceMarkSchema.parse(body);

    const teacherProfile =
      user.role === "TEACHER"
        ? await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
        : null;

    const session = await prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceSession.findFirst({
        where: { batchId: data.batchId, date: new Date(data.date), subjectId: data.subjectId ?? null }
      });

      const sessionRecord = existing
        ? existing
        : await tx.attendanceSession.create({
            data: {
              date: new Date(data.date),
              courseId: data.courseId,
              batchId: data.batchId,
              subjectId: data.subjectId,
              markedById: teacherProfile?.id
            }
          });

      // Replace all records for this session (simplest correct approach for
      // a "mark today's attendance" form that may be re-submitted/edited).
      await tx.attendanceRecord.deleteMany({ where: { sessionId: sessionRecord.id } });
      await tx.attendanceRecord.createMany({
        data: data.records.map((r) => ({
          sessionId: sessionRecord.id,
          studentId: r.studentId,
          status: r.status
        }))
      });

      return sessionRecord;
    });

    return jsonOk(session, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
