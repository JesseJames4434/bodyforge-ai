# BodyForge AI — Cursor Rules

## Core Development Principles

* Default to the smallest possible change set
* Prefer one file at a time
* Only modify multiple files if the task clearly requires it
* Do NOT refactor unrelated code
* Do NOT rename files or restructure folders unless explicitly asked

---

## How Code Changes Must Be Delivered

* Always provide changes as a **Cursor prompt**, not raw code
* Prompts must:

  * Specify exact file paths
  * Be copy-paste ready
  * Be minimal and surgical
* Do not include explanations after prompts unless asked

---

## Avatar System Rules (CRITICAL)

* Avatar is built using layered image assets (NOT SVG systems)
* Use:

  * `base-body.png` as the base
  * muscle overlays (e.g. `chest.png`) on top
* Always use `require()` for images (React Native requirement)
* Do NOT introduce new rendering systems without approval

---

## Routing & Navigation

* Uses Expo Router
* Do NOT modify routing structure unless explicitly asked
* Do NOT change `_layout.tsx` behavior unless task is specifically about navigation

---

## Asset Handling Rules

* Asset paths must be exact (no assumptions)
* Always verify file exists before referencing
* Never guess filenames
* Do not introduce new assets unless explicitly requested

---

## Debugging Rules

* Fix the root cause only
* Do NOT apply broad fixes or “just in case” changes
* Do NOT change multiple systems at once

---

## Git Safety Rules

* Never delete files unless explicitly instructed
* Never overwrite large files without warning
* Changes should always be reversible

---

## Communication Style

* Be concise
* Be precise
* No unnecessary explanations
* Focus on execution

---

## BodyForge Product Direction (DO NOT VIOLATE)

* Visual-first fitness system
* Avatar-driven experience
* Premium coaching feel
* NOT a generic fitness tracker
