import Image from "next/image";

const OPTIMIZED_HOST = "arkyssvsnumajlmzliyr.supabase.co";

function isOptimizable(src: string) {
  try {
    return new URL(src).hostname === OPTIMIZED_HOST;
  } catch {
    return false;
  }
}

export function SiteImage({
  src,
  alt,
  sizes,
  className,
  position = "50% 50%",
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  position?: string;
  priority?: boolean;
}) {
  const style = { objectPosition: position };

  if (isOptimizable(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={`absolute inset-0 h-full w-full ${className ?? ""}`}
      style={style}
    />
  );
}
