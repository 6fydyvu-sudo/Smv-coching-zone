import { prisma } from "@/lib/prisma";
import { AttendanceMarker } from "@/components/dashboard/AttendanceMarker";

export default async function AdminAttendancePage() {
  const courses = await prisma.course.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
      <p className="mt-1 text-sm text-slate-500">Mark daily attendance for a batch.</p>
      <div className="mt-6">
        <AttendanceMarker courses={courses} />
      </div>
    </div>
  );
}
