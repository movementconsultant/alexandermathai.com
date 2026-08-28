# Claude Code / Qwen Code maintenance boundary

A division of labor for ongoing maintenance of the TMI ecosystem across two coding agents, plus
the workflow either one must follow. Written so a human owner can hand off a task to the right
agent without re-explaining the ecosystem's rules each time.

## Why a boundary exists

This ecosystem has explicit, load-bearing safety rules — the status vocabulary, the `verified`
flag pattern, draft-exclusion across five surfaces, the `PUBLIC_PREVIEW` gate, and the
no-fabrication rule for claims (all defined in `docs/ecosystem-governance.md`). Any agent working
on this codebase needs to already respect those rules or be explicitly walked through them. This
document exists so that whichever agent picks up a task, the human owner can point them at it
instead of re-deriving the rules from scratch, and so responsibility for a given class of task is
unambiguous.

## Division of labor

**Claude Code** — default agent for:

- Anything touching content governance or claim safety: adding/editing claims, metrics,
  biography, testimonials, client references, or anything that could misrepresent the business.
- Anything touching the `verified` flag pattern, ecosystem status values, or routing logic
  between divisions — these are the highest-consequence-if-wrong changes in the ecosystem.
- Cross-repo audits, release-readiness reviews, and any task that requires reading and reasoning
  about the governance docs themselves before acting.
- Accessibility work (contrast, ARIA, keyboard nav) and anything requiring a real
  before/after verification pass (running the actual build, running the actual scan) rather than
  a visual-only change.
- Any task explicitly framed as security- or safety-sensitive, or that touches secrets,
  credentials, deployment configuration, or DNS.

**Qwen Code** — suited for:

- Routine, well-scoped content additions that don't touch claims or status: adding a new
  Field Note or System Brief where all frontmatter values are already supplied by the owner and
  no new claim needs verification.
- Mechanical refactors with a clear, narrow scope and existing test/build coverage to catch
  regressions (e.g. renaming a component prop consistently across call sites).
- Small, isolated bug fixes in a single file where the fix doesn't touch shared governance
  primitives (the `verified` flag, status vocabulary, `PUBLIC_PREVIEW` logic, or claim data).
- Day-to-day repo hygiene: dependency bumps, formatting, lint-fix passes — anything where the
  validation gate (typecheck/lint/build) is sufficient to catch a mistake, and no independent
  judgment about truthfulness or governance is required.

**Either agent, with caution**, should escalate to a human rather than proceed independently when:

- A task requires inventing or guessing a fact not present in the repo or supplied by the owner.
- A task would flip a `verified: false` to `verified: true`, mark a division `Live`, or otherwise
  make a stronger public claim than what's currently shipped — these always need explicit
  owner sign-off per the conditions in `docs/ecosystem-governance.md`.
- A task involves deployment, DNS, credentials, or publishing to a production hostname — no
  agent should take these actions without an explicit, in-the-moment human instruction to do so,
  regardless of what an earlier task description said in general terms.
- A task's scope is ambiguous enough that two reasonable readings would produce different visible
  claims or different status labels — resolve the ambiguity with the owner rather than picking
  the more impressive-sounding option.

## Required workflow for either agent

1. **Branch**: never commit directly to `main` or to another agent's active feature branch.
   Create a new branch per task (or continue the designated release branch if one is already
   in progress and the task is a continuation of it), following whatever branch-naming
   convention the repo already uses.
2. **Read before writing**: read the relevant governance doc (`docs/ecosystem-governance.md`) and
   the most recent audit (`docs/mark-2-release-audit.md` or its successor) before making a change
   that touches claims, status, or verified links — don't assume prior context is still accurate.
3. **Commit**: use clear, descriptive commit messages that state what changed and, for anything
   governance-relevant, why (e.g. "fix: gate footer social links behind verified flag" rather
   than "update Footer.astro"). Small, reviewable commits over one large one when the change
   touches multiple concerns.
4. **Build**: run the repo's actual validation gate before considering a task done — typecheck,
   lint/format check, build (in both preview and production-flag modes if `PUBLIC_PREVIEW` is
   relevant to the change), and any accessibility or content-audit script the repo provides.
   Never report a check as passing without having actually run it and seen the output.
5. **Review**: leave the change on its branch/draft PR for human review before it is merged,
   deployed, or connected to any external service. Neither agent merges its own PR, modifies DNS,
   adds credentials, or publishes externally without an explicit, current instruction from the
   site owner authorizing that specific action.
6. **Document**: if the change affects status, a claim, or a governance rule itself, update the
   relevant doc (`docs/ecosystem-governance.md`, `docs/content-needed.md`, or the repo's own
   operations doc) in the same commit/PR — don't let the code and the documentation drift apart.
7. **Report**: end the task with a plain statement of what changed, what was verified (with the
   actual commands/output, not a claim), and what still needs owner input — matching the
   reporting discipline established in `docs/mark-2-release-audit.md`.

## Handoff notes

- If Qwen Code starts a task and discovers it actually needs a claim invented, a status flipped
  to Live, or a deploy/DNS action, it should stop and hand off to a human (or to Claude Code with
  explicit owner authorization) rather than proceeding — per the escalation rules above.
- If Claude Code delegates a mechanical follow-up to Qwen Code, it should point Qwen Code at this
  document and at `docs/ecosystem-governance.md` explicitly, not assume those rules carry over
  automatically.
- Neither agent should treat the other's prior "done" or "verified" claim as sufficient on its
  own for anything governance-relevant — independently re-check claims, verified flags, and
  status values before building further on top of them, the same discipline this repo's own
  Mark 2 audit applied to its predecessor's self-reported completion claims.
