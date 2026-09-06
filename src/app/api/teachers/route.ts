import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(ADMIN_ROLES);
    const teachers = await prisma.teacherProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, coursesTeaching: true, batchesTeaching: true }
    });
    return jsonOk(teachers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = teacherSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return jsonOk({ error: "A user with this email already exists." }, 409);
    }
    if (!data.temporaryPassword) {
      return jsonOk({ error: "A temporary password is required for a new teacher account." }, 422);
    }

    const passwordHash = await bcrypt.hash(data.temporaryPassword, 10);

    const teacher = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: "TEACHER",
        teacherProfile: {
          create: {
            nameBn: data.nameBn,
            photoUrl: data.photoUrl,
            qualification: data.qualification,
            experienceYears: data.experienceYears,
            subjectSpecialization: data.subjectSpecialization,
            bio: data.bio,
            isActive: data.isActive
          }
        }
      },
      include: { teacherProfile: true }
    });

    return jsonOk(teacher, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
