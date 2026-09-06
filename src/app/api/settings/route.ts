import { NextRequest } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/settings";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    const content = await getSiteContent();
    return jsonOk(content);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const updated = await updateSiteContent(body);
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
