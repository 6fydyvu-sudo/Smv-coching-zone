import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { admissionSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";

// POST is intentionally public — anyone can submit an admission application.
export async function POST(req: NextRequest) {
  try {
    const content = await getSiteContent();
    if (!content.admissionOpen) {
      return jsonOk({ error: "Admission is currently closed." }, 403);
    }

    const body = await req.json();
    const data = admissionSchema.parse(body);

    const admission = await prisma.admission.create({
      data: {
        ...data,
        dob: new Date(data.dob),
        email: data.email || null
      }
    });

    return jsonOk({ id: admission.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET is staff-only: list/search/filter admission applications.
export async function GET(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);

    const status = req.nextUrl.searchParams.get("status");
    const q = req.nextUrl.searchParams.get("q")?.trim();

    const admissions = await prisma.admission.findMany({
      where: {
        ...(status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
        ...(q
          ? {
              OR: [
                { applicantNameEn: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: { course: true, batchPreference: true }
    });

    return jsonOk(admissions);
  } catch (error) {
    return handleApiError(error);
  }
}
