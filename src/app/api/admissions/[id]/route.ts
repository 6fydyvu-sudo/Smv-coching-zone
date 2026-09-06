import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { admissionReviewSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const admission = await prisma.admission.findUnique({
      where: { id: params.id },
      include: { course: true, batchPreference: true }
    });
    if (!admission) return jsonOk({ error: "Not found" }, 404);
    return jsonOk(admission);
  } catch (error) {
    return handleApiError(error);
  }
}

// Approve/reject + add a review note. Converting to a student account is a
// separate endpoint (/convert) since it has its own side effects.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = admissionReviewSchema.parse(body);

    const admission = await prisma.admission.update({
      where: { id: params.id },
      data: { ...data, reviewedById: user.id }
    });

    return jsonOk(admission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    await prisma.admission.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
