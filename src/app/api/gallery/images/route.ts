import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { z } from "zod";

const schema = z.object({
  albumId: z.string().min(1),
  imageUrl: z.string().min(1),
  caption: z.string().optional().nullable()
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = schema.parse(body);
    const image = await prisma.galleryImage.create({ data });
    return jsonOk(image, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
