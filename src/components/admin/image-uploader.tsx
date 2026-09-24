"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const BUCKET = "location-images";

async function uploadFiles(files: File[]): Promise<string[]> {
  const supabase = createClient();
  return Promise.all(
    files.map(async (file) => {
      const blob = await compressImage(file);
      const path = `${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }),
  );
}

function useUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (files: File[]) => {
    setBusy(true);
    setError(null);
    try {
      return await uploadFiles(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      return [];
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, run };
}

export function CoverUploader({
  initialUrl,
  initialFocal,
}: {
  initialUrl?: string;
  initialFocal?: { x: number; y: number };
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [focal, setFocal] = useState(initialFocal ?? { x: 50, y: 50 });
  const inputRef = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useUpload();

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    const [uploaded] = await run([files[0]]);
    if (uploaded) {
      setUrl(uploaded);
      setFocal({ x: 50, y: 50 });
    }
  };

  const onFocalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFocal({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>صورة الغلاف / Cover image</Label>
      <input type="hidden" name="cover_image_url" value={url} />
      <input type="hidden" name="cover_focal_x" value={focal.x} />
      <input type="hidden" name="cover_focal_y" value={focal.y} />

      {url && (
        <div className="flex flex-col gap-2">
          <div
            className="relative aspect-video w-full max-w-md cursor-crosshair overflow-hidden rounded-xl bg-muted"
            onClick={onFocalClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-contain" draggable={false} />
            <span
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/60 shadow-md"
              style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            اضغط على الجزء المهم في الصورة ليبقى ظاهراً عند القص / Click the important part so it stays visible when cropped
          </p>
          <div className="flex gap-3">
            <div
              className="h-20 w-32 overflow-hidden rounded-lg bg-muted"
              title="Card preview"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: `${focal.x}% ${focal.y}%`,
              }}
            />
            <div
              className="h-20 w-20 overflow-hidden rounded-lg bg-muted"
              title="Square preview"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: `${focal.x}% ${focal.y}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {url ? "استبدال الصورة" : "رفع صورة"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />
        <Input
          type="url"
          dir="ltr"
          placeholder="…أو الصق رابط الصورة https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="min-w-0 flex-1"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function GalleryUploader({ initialUrls }: { initialUrls?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initialUrls ?? []);
  const inputRef = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useUpload();

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    const uploaded = await run(Array.from(files));
    if (uploaded.length) setUrls((prev) => [...prev, ...uploaded]);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>معرض الصور / Gallery</Label>
      <input type="hidden" name="gallery_urls" value={urls.join("\n")} />

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((u, i) => (
            <div key={u + i} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setUrls((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          إضافة صور
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
