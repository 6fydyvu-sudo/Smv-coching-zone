import { getCurrentStudentProfile } from "@/lib/current-profile";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default async function StudentProfilePage() {
  const student = await getCurrentStudentProfile();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      <Card className="mt-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100">
            {student.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photoUrl} alt={student.user.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{student.user.name}</p>
            <p className="font-mono text-sm text-slate-400">{student.studentCode}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Email" value={student.user.email} />
          <Info label="Phone" value={student.user.phone} />
          <Info label="Father's Name" value={student.fatherName} />
          <Info label="Mother's Name" value={student.motherName} />
          <Info label="Date of Birth" value={formatDate(student.dob)} />
          <Info label="Gender" value={student.gender} />
          <Info label="Address" value={student.address} />
          <Info label="Institution" value={student.institution} />
          <Info label="Course" value={student.course?.nameEn} />
          <Info label="Batch" value={student.batch?.name} />
          <Info label="Admission Date" value={formatDate(student.admissionDate)} />
          <Info label="Status" value={student.status} />
        </dl>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-400">{label}</dt>
      <dd className="text-slate-800">{value || "—"}</dd>
    </div>
  );
}
