# BodyForge Checkpoint Update

When invoked, do the following in order:

1. Audit the actual current project state from the filesystem and codebase.
2. Update or generate a concise checkpoint summary for the current session.
3. Focus only on facts that matter for continuing development in a future chat.
4. Do not change application code unless explicitly asked.
5. If a checkpoint file already exists, update it instead of creating duplicate versions.

## What the checkpoint must include

* what is currently working
* what route or screen is currently being used for testing
* which avatar assets are currently active
* which files were changed in this session
* what the next safest step should be
* any known warnings, risks, or temporary shortcuts
* whether the current state has been committed/pushed if that can be verified

## Rules for this skill

* Follow `.cursor/rules.md`
* Be concise and accurate
* Do not guess
* Verify file names and active paths before mentioning them
* Prefer short bullets over long explanations
* Distinguish clearly between:

  * confirmed working
  * temporary workaround
  * known unresolved issue

## Output format

Return exactly these sections:

### Current Working State

Short bullet list.

### Files Changed This Session

Exact file paths only.

### Active Test Path

The current screen / route being used to verify progress.

### Active Assets

Exact asset file names currently in use.

### Known Risks or Temporary Shortcuts

Short bullet list.

### Recommended Next Step

One sentence.

### Cursor Prompt

A copy-paste-ready prompt to update the checkpoint file on disk.

## Checkpoint file target

Use this file as the single source of truth:

`docs/current-state.md`
