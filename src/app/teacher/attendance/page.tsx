import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { AttendanceMarker } from "@/components/dashboard/AttendanceMarker";

export default async function TeacherAttendancePage() {
  const teacher = await getCurrentTeacherProfile();
  const batches = await prisma.batch.findMany({ where: { teacherId: teacher.id }, include: { course: true } });
  const courseMap = new Map(batches.map((b) => [b.courseId, b.course]));
  const courses = Array.from(courseMap.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
      <p className="mt-1 text-sm text-slate-500">Mark daily attendance for your batches.</p>
      <div className="mt-6">
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400">You have no batches assigned yet.</p>
        ) : (
          <AttendanceMarker courses={courses} />
        )}
      </div>
    </div>
  );
}
