# BodyForge Next-Step Audit

When invoked, do the following in order:

1. Audit the current project state from the actual filesystem and current codebase.
2. Identify the single smallest safe next step that moves the project forward.
3. Prefer minimal, surgical progress over broad cleanup.
4. Do not change code yet.
5. Return:

   * what is currently working
   * what the next step should be
   * which exact file(s) should be touched
   * the smallest possible Cursor-ready prompt to execute that step

## Rules for this skill

* Follow BodyForge project rules in `.cursor/rules.md`
* Prefer one file at a time
* Do not propose refactors unless strictly required
* Do not guess asset names or paths
* Verify file existence before referencing anything
* If there is risk of breaking working code, say so clearly
* If multiple options exist, recommend the safest one

## Output format

Return exactly these sections:

### Current Working State

Short summary of what is working now.

### Recommended Next Step

One sentence.

### Files To Touch

List the exact file path(s).

### Cursor Prompt

A copy-paste-ready prompt for Cursor agent to execute.

### Risk Check

One short paragraph on what could break, if anything.
