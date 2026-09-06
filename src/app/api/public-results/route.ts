import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/settings";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const content = await getSiteContent();
    if (!content.publicResultSearchEnabled) {
      return NextResponse.json(
        { error: "Public result search is currently disabled by the institute." },
        { status: 403 }
      );
    }

    const studentCode = req.nextUrl.searchParams.get("studentCode")?.trim();
    if (!studentCode) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { studentCode },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: "No student found with this ID." }, { status: 404 });
    }

    const entries = await prisma.resultEntry.findMany({
      where: { studentId: student.id, exam: { published: true } },
      include: { exam: { include: { subject: true } } },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      studentName: student.user.name,
      results: entries.map((e) => ({
        examTitle: e.exam.titleEn,
        subject: e.exam.subject.nameEn,
        fullMarks: e.exam.fullMarks.toString(),
        marksObtained: e.marksObtained?.toString() ?? null,
        isAbsent: e.isAbsent,
        grade: e.grade
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
