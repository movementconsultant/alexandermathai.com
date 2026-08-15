import { test } from "node:test";
import assert from "node:assert/strict";
import { scanContent } from "../scripts/postbuild-guard.mjs";

test("flags literal TBD", () => {
  const violations = scanContent("<p>TBD</p>", { ext: ".html", isPreview: false, label: "f" });
  assert.equal(violations.length, 1);
  assert.match(violations[0], /TBD/);
});

test("flags mailto: links", () => {
  const violations = scanContent('<a href="mailto:someone@example.com">Email</a>', {
    ext: ".html",
    isPreview: false,
    label: "f",
  });
  assert.equal(violations.length, 1);
  assert.match(violations[0], /mailto/);
});

test("flags <form> elements", () => {
  const violations = scanContent('<form action="/submit"></form>', {
    ext: ".html",
    isPreview: false,
    label: "f",
  });
  assert.equal(violations.length, 1);
  assert.match(violations[0], /<form>/);
});

test("flags known social domains", () => {
  const violations = scanContent('<a href="https://instagram.com/x">IG</a>', {
    ext: ".html",
    isPreview: false,
    label: "f",
  });
  assert.equal(violations.length, 1);
  assert.match(violations[0], /instagram\.com/);
});

test("flags missing noindex on preview HTML", () => {
  const violations = scanContent("<html><head></head></html>", {
    ext: ".html",
    isPreview: true,
    label: "f",
  });
  assert.equal(violations.length, 1);
  assert.match(violations[0], /noindex/);
});

test("passes when noindex present on preview HTML", () => {
  const violations = scanContent(
    '<html><head><meta name="robots" content="noindex, nofollow"></head></html>',
    { ext: ".html", isPreview: true, label: "f" },
  );
  assert.equal(violations.length, 0);
});

test("does not require noindex on non-preview HTML", () => {
  const violations = scanContent("<html><head></head></html>", {
    ext: ".html",
    isPreview: false,
    label: "f",
  });
  assert.equal(violations.length, 0);
});

test("clean content produces no violations", () => {
  const violations = scanContent(
    '<html><head><meta name="robots" content="noindex, nofollow"></head><body>Hello</body></html>',
    { ext: ".html", isPreview: true, label: "f" },
  );
  assert.deepEqual(violations, []);
});
