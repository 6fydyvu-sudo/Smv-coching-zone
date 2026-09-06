import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

// :id here is the TeacherProfile id.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    });
    if (!teacher) return jsonOk({ error: "Not found" }, 404);
    return jsonOk(teacher);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = teacherSchema.partial().parse(body);

    const teacher = await prisma.teacherProfile.findUnique({ where: { id: params.id } });
    if (!teacher) return jsonOk({ error: "Not found" }, 404);

    const updated = await prisma.$transaction(async (tx) => {
      if (data.name || data.phone) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { name: data.name, phone: data.phone ?? undefined }
        });
      }
      return tx.teacherProfile.update({
        where: { id: params.id },
        data: {
          nameBn: data.nameBn,
          photoUrl: data.photoUrl,
          qualification: data.qualification,
          experienceYears: data.experienceYears,
          subjectSpecialization: data.subjectSpecialization,
          bio: data.bio,
          isActive: data.isActive
        }
      });
    });

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// Deactivate rather than hard-delete by default, to preserve historical
// links (routines, results, attendance already recorded by this teacher).
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    await prisma.teacherProfile.update({ where: { id: params.id }, data: { isActive: false } });
    return jsonOk({ success: true, note: "Teacher deactivated (historical records preserved)." });
  } catch (error) {
    return handleApiError(error);
  }
}
