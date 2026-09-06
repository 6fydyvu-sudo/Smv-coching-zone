import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactMessageSchema.parse(body);
    const message = await prisma.contactMessage.create({ data: { ...data, email: data.email || null } });
    return jsonOk({ id: message.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    await requireRole(ADMIN_ROLES);
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return jsonOk(messages);
  } catch (error) {
    return handleApiError(error);
  }
}
