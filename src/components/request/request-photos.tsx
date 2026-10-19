"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Star, UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { REQUEST_IMAGES_BUCKET, REQUEST_MAX_PHOTOS } from "@/lib/location-requests";
import { useLocale } from "@/lib/i18n/locale-context";

interface Photo {
  id: string;
  preview: string;
  url: string | null;
  failed: boolean;
}

async function uploadPhoto(file: File) {
  const supabase = createClient();
  const blob = await compressImage(file);
  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(REQUEST_IMAGES_BUCKET)
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from(REQUEST_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function RequestPhotos({ onChange }: { onChange: (urls: string[], busy: boolean) => void }) {
  const { t } = useLocale();
  const f = t.request.fields;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = photos.flatMap((p) => (p.url ? [p.url] : []));
  const busy = photos.some((p) => !p.url && !p.failed);

  useEffect(() => {
    onChange(urls, busy);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- urls is derived from photos
  }, [photos]);

  const addFiles = (files: FileList | File[]) => {
    const room = REQUEST_MAX_PHOTOS - photos.length;
    const picked = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, room));
    if (!picked.length) return;
    setError(false);

    const added = picked.map((file) => ({
      file,
      photo: { id: crypto.randomUUID(), preview: URL.createObjectURL(file), url: null, failed: false } as Photo,
    }));
    setPhotos((prev) => [...prev, ...added.map((a) => a.photo)]);

    added.forEach(({ file, photo }) => {
      uploadPhoto(file)
        .then((url) => setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, url } : p))))
        .catch(() => {
          setError(true);
          setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        });
    });
  };

  const remove = (id: string) =>
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });

  const full = photos.length >= REQUEST_MAX_PHOTOS;

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="image_urls" value={JSON.stringify(urls)} />

      {!full && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"
          }`}
        >
          <motion.span
            animate={dragging ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15"
          >
            <UploadCloud className="h-7 w-7" />
          </motion.span>
          <span className="font-semibold">{f.photosDrop}</span>
          <span className="text-xs text-muted-foreground">
            {f.photosHint} · {f.photosFormats}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          <AnimatePresence initial={false}>
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                className="relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                {!photo.url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {i === 0 && photo.url && (
                  <span className="absolute start-1.5 bottom-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    <Star className="h-3 w-3" />
                    {f.cover}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(photo.id)}
                  aria-label={f.remove}
                  className="absolute end-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {!full && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label={f.photos}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              <ImagePlus className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{busy ? f.uploading : `${urls.length} / ${REQUEST_MAX_PHOTOS}`}</span>
      </div>
      {error && <p className="text-sm text-destructive">{t.request.errors.upload}</p>}
    </div>
  );
}
