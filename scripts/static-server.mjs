#!/usr/bin/env node
/**
 * Minimal static file server for dist/, used by the Playwright E2E suite
 * (see playwright.config.ts) to serve an already-built site. Not a
 * production server — offline, local-only, no external dependency.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.STATIC_SERVER_PORT ?? 4510);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let fsPath = join(DIST, path);

    try {
      const s = await stat(fsPath);
      if (s.isDirectory()) fsPath = join(fsPath, "index.html");
    } catch {
      // Astro's "directory" build format: /about -> /about/index.html ...
      const asDirIndex = join(DIST, path, "index.html");
      // ... except a handful of routes (404.astro) build to a flat
      // <path>.html file at the same level instead of a subdirectory.
      const asFlatFile = `${join(DIST, path)}.html`;
      fsPath = existsSync(asDirIndex) ? asDirIndex : asFlatFile;
    }

    const body = await readFile(fsPath);
    res.writeHead(200, { "Content-Type": MIME[extname(fsPath)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    // Serve the built 404 page's content with a real 404 status where
    // available, so "page not found" tests exercise the real page.
    try {
      const notFound = await readFile(join(DIST, "404.html"));
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(notFound);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }
});

server.listen(PORT, () => {
  console.log(`static-server: serving ${DIST} on http://localhost:${PORT}`);
});
