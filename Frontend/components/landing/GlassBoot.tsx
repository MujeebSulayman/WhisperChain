"use client";

import { useEffect, useRef } from "react";
import { startGlass } from "@/lib/glass";

/** SVG filter for the refracting nav lens (Chromium). Its map is drawn by buildNavLens. */
function LensDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <filter id="lgnav" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage id="lgmap" x="0" y="0" width="100" height="100" preserveAspectRatio="none" result="map" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="src" />
        <feDisplacementMap in="src" in2="map" scale="46" xChannelSelector="R" yChannelSelector="G" result="dr" />
        <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r" />
        <feDisplacementMap in="src" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G" result="dg" />
        <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g" />
        <feDisplacementMap in="src" in2="map" scale="34" xChannelSelector="R" yChannelSelector="G" result="db" />
        <feColorMatrix in="db" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b" />
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  );
}

/** The liquid-glass backdrop and the spring loop behind it. Mount once, in the root layout. */
export function GlassBoot() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => (canvas.current ? startGlass(canvas.current) : undefined), []);
  return (
    <>
      <canvas id="lg" ref={canvas} aria-hidden />
      <LensDefs />
      <div className="bg-fallback" aria-hidden />
    </>
  );
}
