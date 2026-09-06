import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryAlbumSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(ADMIN_ROLES);
    const albums = await prisma.galleryAlbum.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" }
    });
    return jsonOk(albums);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = galleryAlbumSchema.parse(body);
    const album = await prisma.galleryAlbum.create({ data });
    return jsonOk(album, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
