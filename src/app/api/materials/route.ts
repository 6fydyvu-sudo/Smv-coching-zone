import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { studyMaterialSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireRole(STAFF_ROLES);
    const batchId = req.nextUrl.searchParams.get("batchId");
    const materials = await prisma.studyMaterial.findMany({
      where: batchId ? { batchId } : undefined,
      include: { course: true, subject: true, batch: true },
      orderBy: { createdAt: "desc" }
    });
    return jsonOk(materials);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(STAFF_ROLES);
    const body = await req.json();
    const data = studyMaterialSchema.parse(body);
    const material = await prisma.studyMaterial.create({ data: { ...data, uploadedById: user.id } });
    return jsonOk(material, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
