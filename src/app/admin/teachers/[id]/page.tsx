import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherForm } from "@/components/dashboard/TeacherForm";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function EditTeacherPage({ params }: { params: { id: string } }) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: params.id },
    include: { user: true }
  });
  if (!teacher) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Edit Teacher</h1>
        <DeleteButton
          endpoint={`/api/teachers/${teacher.id}`}
          confirmText="Deactivate this teacher? Historical records will be preserved."
          label="Deactivate"
        />
      </div>
      <div className="mt-6">
        <TeacherForm
          teacher={{
            id: teacher.id,
            name: teacher.user.name,
            email: teacher.user.email,
            phone: teacher.user.phone,
            nameBn: teacher.nameBn,
            photoUrl: teacher.photoUrl,
            qualification: teacher.qualification,
            experienceYears: teacher.experienceYears,
            subjectSpecialization: teacher.subjectSpecialization,
            bio: teacher.bio,
            isActive: teacher.isActive
          }}
        />
      </div>
    </div>
  );
}
