import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { noticeSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, STAFF_ROLES } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    const body = await req.json();

    // Full-form submit vs quick toggle (published/pinned from the list view)
    if (body.titleEn !== undefined) {
      const data = noticeSchema.parse(body);
      const notice = await prisma.notice.update({
        where: { id: params.id },
        data: { ...data, publishDate: data.publishDate ? new Date(data.publishDate) : undefined }
      });
      return jsonOk(notice);
    }

    const notice = await prisma.notice.update({ where: { id: params.id }, data: body });
    return jsonOk(notice);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    await prisma.notice.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
