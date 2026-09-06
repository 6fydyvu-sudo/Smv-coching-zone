import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { feeInvoiceSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const studentId = req.nextUrl.searchParams.get("studentId");
    const status = req.nextUrl.searchParams.get("status");

    const invoices = await prisma.feeInvoice.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status: status as "PAID" | "PARTIAL" | "DUE" } : {})
      },
      include: { student: { include: { user: true } }, course: true, batch: true, payments: true },
      orderBy: { createdAt: "desc" }
    });

    return jsonOk(invoices);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = feeInvoiceSchema.parse(body);

    const invoice = await prisma.feeInvoice.create({
      data: { ...data, dueAmount: data.amount, paidAmount: 0, status: "DUE" }
    });

    return jsonOk(invoice, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
