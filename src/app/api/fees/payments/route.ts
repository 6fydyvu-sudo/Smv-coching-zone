import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

/**
 * Records a payment against an invoice (cash collected at the desk, or a
 * bKash/Nagad transaction the student completed out-of-band and reported
 * a reference number for). This does NOT call any live payment gateway —
 * see README for what a real bKash/Nagad integration would additionally
 * require (merchant credentials + a webhook/callback route).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = paymentSchema.parse(body);

    const invoice = await prisma.feeInvoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) return jsonOk({ error: "Invoice not found." }, 404);

    const currentDue = Number(invoice.dueAmount);
    if (data.amount > currentDue) {
      return jsonOk({ error: `Payment amount exceeds the outstanding due of ${currentDue}.` }, 422);
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          referenceNo: data.referenceNo,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
          recordedById: user.id
        }
      });

      const newPaid = Number(invoice.paidAmount) + data.amount;
      const newDue = Number(invoice.amount) - newPaid;

      await tx.feeInvoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaid,
          dueAmount: newDue,
          status: newDue <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "DUE"
        }
      });

      return payment;
    });

    return jsonOk(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
