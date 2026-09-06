import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdmissionReviewPanel } from "@/components/dashboard/AdmissionReviewPanel";
import { formatDate } from "@/lib/utils";

export default async function AdmissionDetailPage({ params }: { params: { id: string } }) {
  const admission = await prisma.admission.findUnique({
    where: { id: params.id },
    include: { course: true, batchPreference: true }
  });
  if (!admission) notFound();

  const batches = admission.courseId
    ? await prisma.batch.findMany({ where: { courseId: admission.courseId, status: "ACTIVE" } })
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{admission.applicantNameEn}</h1>
          <Badge tone={admission.status === "APPROVED" ? "green" : admission.status === "REJECTED" ? "red" : "amber"}>
            {admission.status}
          </Badge>
        </div>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Info label="Name (বাংলা)" value={admission.applicantNameBn} />
          <Info label="Father's Name" value={admission.fatherName} />
          <Info label="Mother's Name" value={admission.motherName} />
          <Info label="Date of Birth" value={formatDate(admission.dob)} />
          <Info label="Gender" value={admission.gender} />
          <Info label="Phone" value={admission.phone} />
          <Info label="Email" value={admission.email} />
          <Info label="Address" value={admission.address} />
          <Info label="School/Madrasa" value={admission.institution} />
          <Info label="Target Class" value={admission.targetClass} />
          <Info label="Course" value={admission.course?.nameEn} />
          <Info label="Preferred Batch" value={admission.batchPreference?.name} />
          <Info label="Applied On" value={formatDate(admission.createdAt)} />
        </dl>
        {admission.additionalInfo && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-slate-400">Additional Info</p>
            <p className="mt-1 text-sm text-slate-700">{admission.additionalInfo}</p>
          </div>
        )}
        {admission.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={admission.photoUrl} alt={admission.applicantNameEn} className="mt-4 h-32 w-32 rounded-xl object-cover" />
        )}
      </Card>

      <AdmissionReviewPanel
        admissionId={admission.id}
        currentStatus={admission.status}
        reviewNote={admission.reviewNote}
        courseId={admission.courseId}
        batches={batches}
        alreadyConverted={!!admission.convertedStudentId}
      />
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
