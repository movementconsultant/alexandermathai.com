import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalUrl, SITE_URL, TMI, AREAS_OF_WORK } from "../src/config/site.ts";

test("canonicalUrl builds an absolute URL rooted at SITE_URL", () => {
  assert.equal(canonicalUrl("/"), `${SITE_URL}/`);
  assert.equal(canonicalUrl("/about"), `${SITE_URL}/about`);
});

test("canonicalUrl normalizes a path missing its leading slash", () => {
  assert.equal(canonicalUrl("about"), `${SITE_URL}/about`);
});

test("TMI mention is a plain name + url pair only", () => {
  assert.deepEqual(Object.keys(TMI).sort(), ["name", "url"]);
  assert.equal(TMI.name, "Texas Movement International");
  assert.equal(TMI.url, "https://texasmovement.com");
});

test("areas of work is a non-empty list of title/body pairs", () => {
  assert.ok(AREAS_OF_WORK.length > 0);
  for (const area of AREAS_OF_WORK) {
    assert.ok(area.title.length > 0);
    assert.ok(area.body.length > 0);
  }
});
