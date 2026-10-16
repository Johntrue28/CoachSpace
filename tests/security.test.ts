// Security basics for a public demo link (D-069): response headers, links that can never run
// script, and no secrets or external hosts in the client code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import nextConfig from "../next.config";
import { isWebUrl, videoLinkKind } from "@/data/exercises";

test("every page is served with the security headers", async () => {
  assert.equal(nextConfig.poweredByHeader, false, "no X-Powered-By header");
  const rules = await nextConfig.headers!();
  assert.equal(rules.length, 1);
  assert.equal(rules[0].source, "/:path*", "applies to every path");
  const headers = Object.fromEntries(rules[0].headers.map((h) => [h.key, h.value]));
  const csp = headers["Content-Security-Policy"];
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "connect-src 'self'"]) {
    assert.ok(csp.split("; ").some((d) => d.startsWith(directive)), `CSP has ${directive}`);
  }
  assert.ok(!/unsafe-eval/.test(csp), "no eval outside development");
  assert.ok(!/https?:\/\//.test(csp), "no other site is allowed outside preview deployments");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Permissions-Policy"], /camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  assert.match(headers["Strict-Transport-Security"], /max-age=\d{7,}/);
});

test("only http and https addresses become links", () => {
  for (const ok of ["https://www.youtube.com/watch?v=abcdefgh", "https://vimeo.com/123456", "http://example.com/x"]) assert.equal(isWebUrl(ok), true, ok);
  for (const bad of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", " javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:x", "", "not a url", "//evil.example"]) {
    assert.equal(isWebUrl(bad), false, bad);
  }
  assert.equal(videoLinkKind("javascript:alert(1)"), "other", "and is never treated as a video");
});

test("the client code holds no secrets and loads nothing from other sites", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(ts|tsx|css)$/.test(name)) files.push(path);
    }
  };
  walk("src");
  const secret = /(api[_-]?key|secret|password|token|bearer)\s*[:=]\s*["'`][^"'`]{8,}/i;
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    assert.doesNotMatch(text, secret, `${f} has no hard-coded secret`);
    assert.doesNotMatch(text, /process\.env\.(?!NODE_ENV)/, `${f} reads no environment variable`);
    assert.doesNotMatch(text, /<script[^>]+src=|@import\s+url\(\s*["']?https?:|<link[^>]+href=["']https?:/i, `${f} loads no external script, style or font`);
  }
});
