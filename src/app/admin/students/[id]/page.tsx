import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StudentEditForm } from "@/components/dashboard/StudentEditForm";
import { formatDate } from "@/lib/utils";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, courses, batches] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: params.id },
      include: { user: true, course: true, batch: true }
    }),
    prisma.course.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.batch.findMany()
  ]);

  if (!student) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <div className="text-center">
          <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full bg-slate-100">
            {student.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photoUrl} alt={student.user.name} className="h-full w-full object-cover" />
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900">{student.user.name}</h1>
          <p className="font-mono text-xs text-slate-400">{student.studentCode}</p>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-400">Email</dt><dd>{student.user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Phone</dt><dd>{student.user.phone ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">DOB</dt><dd>{formatDate(student.dob)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Gender</dt><dd>{student.gender}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Admitted</dt><dd>{formatDate(student.admissionDate)}</dd></div>
        </dl>
      </Card>

      <div className="lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit Profile</h2>
        <StudentEditForm
          student={{
            id: student.id,
            fatherName: student.fatherName,
            motherName: student.motherName,
            address: student.address,
            institution: student.institution,
            courseId: student.courseId,
            batchId: student.batchId,
            status: student.status
          }}
          courses={courses}
          batches={batches}
        />
      </div>
    </div>
  );
}
