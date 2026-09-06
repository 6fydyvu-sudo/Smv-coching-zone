import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(ADMIN_ROLES);
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" }, include: { course: true } });
    return jsonOk(testimonials);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = testimonialSchema.parse(body);
    const testimonial = await prisma.testimonial.create({ data });
    return jsonOk(testimonial, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
