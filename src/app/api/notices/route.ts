import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { noticeSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(STAFF_ROLES);
    const notices = await prisma.notice.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { createdBy: true }
    });
    return jsonOk(notices);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(STAFF_ROLES);
    const body = await req.json();
    const data = noticeSchema.parse(body);

    const notice = await prisma.notice.create({
      data: {
        ...data,
        publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
        createdById: user.id
      }
    });

    return jsonOk(notice, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
