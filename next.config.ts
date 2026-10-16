import type { NextConfig } from "next";

/**
 * Security headers for every page (D-069). The demo loads nothing from other sites (the font is
 * self-hosted by next/font, the illustrations are inline SVG), so everything is limited to this
 * site. Scripts need 'unsafe-inline' because Next.js and the scenario boot script use inline scripts
 * in pages built in advance (a nonce would make every page dynamic); the demo shows no HTML written by
 * anyone, so this is an accepted trade-off. Development adds what hot reloading needs, and Vercel
 * preview deployments allow the Vercel toolbar (vercel.live).
 */
const dev = process.env.NODE_ENV === "development";
const preview = process.env.VERCEL_ENV === "preview";
const toolbar = preview ? " https://vercel.live https://*.vercel.live" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}${toolbar}`,
  `style-src 'self' 'unsafe-inline'${toolbar}`,
  `img-src 'self' data: blob:${toolbar}`,
  `font-src 'self' data:${toolbar}`,
  `connect-src 'self'${dev ? " ws: wss:" : ""}${preview ? " https://vercel.live https://*.vercel.live wss://*.pusher.com" : ""}`,
  `frame-src ${preview ? "https://vercel.live" : "'none'"}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // "Videos" became the exercise "Library"; keep old links working.
  async redirects() {
    return [{ source: "/videos", destination: "/library", permanent: true }];
  },
};

export default nextConfig;
