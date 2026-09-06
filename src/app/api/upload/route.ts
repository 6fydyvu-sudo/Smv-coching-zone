import { NextRequest, NextResponse } from "next/server";
import {
  saveUploadedFile,
  UploadValidationError,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  type UploadCategory
} from "@/lib/storage";
import { getCurrentUser } from "@/lib/rbac";

// Public categories: fields where an anonymous visitor legitimately needs
// to upload a file as part of a public form (admission photo/result).
// Every other category requires an authenticated staff/admin user, checked
// again inside the corresponding entity's own API route where relevant.
const PUBLIC_CATEGORIES: UploadCategory[] = ["admissions"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const category = (formData.get("category") as UploadCategory) ?? "materials";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!PUBLIC_CATEGORIES.includes(category)) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }
    }

    const documentCategories: UploadCategory[] = ["materials", "notices", "admissions"];
    const allowed = documentCategories.includes(category) ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;
    const url = await saveUploadedFile(file, category, allowed);

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
