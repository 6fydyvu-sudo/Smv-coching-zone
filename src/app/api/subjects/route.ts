import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subjectSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { nameEn: "asc" } });
    return jsonOk(subjects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = subjectSchema.parse(body);
    const subject = await prisma.subject.create({ data });
    return jsonOk(subject, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
