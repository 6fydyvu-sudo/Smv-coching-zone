import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireAnyUser } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAnyUser();
    const body = await req.json();
    const data = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user) return jsonOk({ error: "User not found." }, 404);

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return jsonOk({ error: "Current password is incorrect." }, 422);
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
