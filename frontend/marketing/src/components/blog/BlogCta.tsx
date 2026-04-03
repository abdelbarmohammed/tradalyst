"use client";

interface Props {
  heading: string;
  buttonText: string;
  href: string;
  wordCount?: number;
}

export default function BlogCta({ heading, buttonText, href, wordCount }: Props) {
  if (wordCount !== undefined && wordCount <= 1000) return null;

  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.tradalyst.com";
  const fullHref = href.startsWith("http") ? href : `${appBase}${href}`;

  return (
    <div
      style={{
        backgroundColor: "rgba(47, 172, 102, 0.08)",
        border: "1px solid rgba(47, 172, 102, 0.2)",
      }}
      className="my-10 p-8 text-center"
    >
      <p className="font-sans text-[16px] font-semibold text-text leading-snug mb-5">{heading}</p>
      <a
        href={fullHref}
        className="inline-block font-sans text-[14px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-[10px] transition-colors duration-150"
      >
        {buttonText}
      </a>
    </div>
  );
}
