import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStudentFromAdmissionSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { generateStudentCode } from "@/lib/ids";

/**
 * Converts an APPROVED admission application into a real Student user
 * account + StudentProfile, auto-generating a unique Student ID.
 * Wrapped in a transaction so partial failures never leave an orphaned
 * User without a StudentProfile, or vice versa.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = createStudentFromAdmissionSchema.parse({ ...body, admissionId: params.id });

    const admission = await prisma.admission.findUnique({ where: { id: params.id } });
    if (!admission) return jsonOk({ error: "Admission not found." }, 404);
    if (admission.status !== "APPROVED") {
      return jsonOk({ error: "Only approved admissions can be converted to a student account." }, 400);
    }
    if (admission.convertedStudentId) {
      return jsonOk({ error: "This admission has already been converted." }, 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return jsonOk({ error: "A user with this email already exists." }, 409);
    }

    const studentCode = await generateStudentCode();
    const passwordHash = await bcrypt.hash(data.temporaryPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: admission.applicantNameEn,
          email: data.email,
          phone: admission.phone,
          passwordHash,
          role: "STUDENT"
        }
      });

      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          studentCode,
          nameBn: admission.applicantNameBn,
          fatherName: admission.fatherName,
          motherName: admission.motherName,
          dob: admission.dob,
          gender: admission.gender,
          address: admission.address,
          institution: admission.institution,
          photoUrl: admission.photoUrl,
          courseId: data.courseId,
          batchId: data.batchId
        }
      });

      await tx.enrollment.create({
        data: {
          studentId: studentProfile.id,
          courseId: data.courseId,
          batchId: data.batchId
        }
      });

      await tx.admission.update({
        where: { id: admission.id },
        data: { convertedStudentId: studentProfile.id }
      });

      return { user, studentProfile };
    });

    return jsonOk({
      studentCode: result.studentProfile.studentCode,
      email: result.user.email
    });
  } catch (error) {
    return handleApiError(error);
  }
}
