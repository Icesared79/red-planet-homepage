import Image from "next/image";

type Treatment = "place" | "atmospheric" | "static";

type SectionImageProps = {
  src: string;
  alt: string;
  aspectRatio?: string;
  treatment?: Treatment;
  priority?: boolean;
  rounded?: boolean;
  className?: string;
  sizes?: string;
};

export function SectionImage({
  src,
  alt,
  aspectRatio = "21 / 9",
  treatment = "static",
  priority = false,
  rounded = true,
  className = "",
  sizes = "(min-width: 1280px) 1200px, 100vw",
}: SectionImageProps) {
  const hoverZoom = treatment === "place";
  return (
    <div
      className={`relative w-full overflow-hidden ${
        rounded ? "rounded-[4px]" : ""
      } ${className}`}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${
          hoverZoom
            ? "transition-transform duration-[800ms] ease-out hover:scale-105"
            : ""
        }`}
      />
    </div>
  );
}
