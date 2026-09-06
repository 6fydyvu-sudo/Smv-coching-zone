import type { Metadata } from "next";
import type { Prisma, GalleryImage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Gallery" };
// Rendered per-request: gallery albums/images are edited live from
// Admin, and static generation would need a reachable DATABASE_URL at
// build time.
export const dynamic = "force-dynamic";

type AlbumWithImages = Prisma.GalleryAlbumGetPayload<{ include: { images: true } }>;

export default async function GalleryPage() {
  const { locale, dict } = getServerDictionary();
  const albums: AlbumWithImages[] = await prisma.galleryAlbum.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { images: true }
  });

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.gallery}</h1>
      {albums.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={dict.common.noData} />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {albums.map((album: AlbumWithImages) => (
            <div key={album.id}>
              <h2 className="text-lg font-semibold text-slate-900">
                {locale === "bn" ? album.titleBn : album.titleEn}{" "}
                <span className="text-sm font-normal text-slate-400">({album.category})</span>
              </h2>
              {album.images.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No images in this album yet.</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {album.images.map((img: GalleryImage) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={img.caption ?? ""}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
