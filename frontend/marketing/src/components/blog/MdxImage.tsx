import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export default function MdxImage({ src, alt, caption, width = 720, height = 400 }: Props) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto"
      />
      {caption && (
        <figcaption className="font-mono text-[11px] text-text-muted text-center mt-2 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
