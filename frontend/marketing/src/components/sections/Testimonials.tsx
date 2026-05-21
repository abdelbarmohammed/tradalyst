"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const TOTAL = 6;
const DESKTOP_PAGES = 2;
const SLIDE_GAP = 16;

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [desktopPage, setDesktopPage] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);

  const items = Array.from({ length: TOTAL }, (_, i) => ({
    name: t(`t${i + 1}.name`),
    role: t(`t${i + 1}.role`),
    quote: t(`t${i + 1}.quote`),
    img: `/images/people/testimonial-0${i + 1}.webp`,
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSlideWidth(el.offsetWidth);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setDesktopPage((p) => (p + 1) % DESKTOP_PAGES),
      5000
    );
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const id = setInterval(
      () => setMobileIndex((i) => (i + 1) % TOTAL),
      4000
    );
    return () => clearInterval(id);
  }, []);

  const desktopShift = desktopPage * (slideWidth + SLIDE_GAP);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      setMobileIndex((i) =>
        delta < 0 ? (i + 1) % TOTAL : (i - 1 + TOTAL) % TOTAL
      );
    }
    touchStartX.current = null;
  };

  return (
    <section className="bg-surface py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em] text-center mb-12">
          {t("heading")}
        </h2>

        {/* Desktop carousel — hidden on mobile */}
        <div
          className="hidden md:block"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setDesktopPage((p) => (p - 1 + DESKTOP_PAGES) % DESKTOP_PAGES)
              }
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ background: "rgba(255,255,255,0.08)" }}
              aria-label="Previous slide"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 2L4 7L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div ref={containerRef} className="flex-1 min-w-0 overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${desktopShift}px)` }}
              >
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-white p-7"
                    style={{
                      width: "calc((100% - 32px) / 3)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="font-sans text-[13px] font-semibold text-text leading-none">
                          {item.name}
                        </p>
                        <p className="font-mono text-[9px] text-text-muted mt-[3px]">
                          {item.role}
                        </p>
                      </div>
                    </div>
                    <p className="font-sans text-[13px] text-text-secondary leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setDesktopPage((p) => (p + 1) % DESKTOP_PAGES)}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ background: "rgba(255,255,255,0.08)" }}
              aria-label="Next slide"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M6 2L11 7L6 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center gap-[6px] mt-6">
            {Array.from({ length: DESKTOP_PAGES }, (_, i) => (
              <button
                key={i}
                onClick={() => setDesktopPage(i)}
                className="h-[6px] rounded-full transition-all duration-300"
                style={{
                  width: desktopPage === i ? 20 : 6,
                  background:
                    desktopPage === i ? "#2fac66" : "rgba(255,255,255,0.2)",
                }}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile carousel — shown on mobile only */}
        <div
          className="md:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-full bg-white p-7"
                  style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <Image
                      src={item.img}
                      alt={item.name}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-sans text-[13px] font-semibold text-text leading-none">
                        {item.name}
                      </p>
                      <p className="font-mono text-[9px] text-text-muted mt-[3px]">
                        {item.role}
                      </p>
                    </div>
                  </div>
                  <p className="font-sans text-[13px] text-text-secondary leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-[6px] mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setMobileIndex(i)}
                className="h-[6px] rounded-full transition-all duration-300"
                style={{
                  width: mobileIndex === i ? 20 : 6,
                  background:
                    mobileIndex === i ? "#2fac66" : "rgba(255,255,255,0.2)",
                }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
