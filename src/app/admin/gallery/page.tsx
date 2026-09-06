import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/dashboard/GalleryManager";

export default async function AdminGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Gallery</h1>
      <p className="mt-1 text-sm text-slate-500">Create albums and upload photos.</p>
      <div className="mt-6">
        <GalleryManager albums={albums} />
      </div>
    </div>
  );
}
