---
title: "Building this site in the open"
description: "A short build log on why alexandermathai.com was rebuilt as a founder control tower, and what the content model is designed to do."
type: "build-log"
tags: ["web-infrastructure", "founder-operations"]
publishDate: 2026-08-16
featured: false
draft: false
relatedWorkSlug: "tmi-digital-ecosystem"
---

This site was rebuilt from a bootstrap-only starting point into the structure it has now: typed content collections for work, notes, and ecosystem divisions; a single data layer for navigation, social links, and site metadata; and a content-governance rule that keeps unverified claims and placeholder copy out of anything that ships to production.

A few decisions worth naming directly, since they shape what you're reading:

- Every ecosystem division is labeled by its real, current stage — building, in development, or select engagements — rather than presented as a fully operating business. Several of TMI's subdomains (consulting, media, HERO, performance, social) are still pre-launch as of this rebuild.
- No portrait or action photography is used in the hero yet. Rather than fabricate a placeholder image, the visual direction leans on a typographic and diagrammatic system — grid lines, a load-path line, engineering annotation — until real, rights-cleared photography exists.
- The contact form is fully built — fields, validation, accessible errors, honeypot, success and failure states — but it has no email-delivery backend connected yet. That integration point is documented for a follow-up, not faked.

The rest of the site follows the same rule: where a fact was given directly (founding year, view counts, client counts, product counts), it's used as stated. Where specific narrative detail wasn't available — individual case studies, testimonials, some longer essays — the entry exists as a marked draft, excluded from the production build, rather than invented.
