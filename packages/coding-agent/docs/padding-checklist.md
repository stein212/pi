# Padding adjustment feature checklist

Status legend: `[x]` implemented or audited; `[ ]` still required.

## User input editor

- [x] `packages/tui/src/components/editor.ts` — preserve zero left padding and handle narrow widths without reducing content below one cell.
- [x] `packages/coding-agent/src/modes/interactive/interactive-mode.ts` — create `defaultEditor`, reapply `editorPaddingX`, and update the active editor when settings change.
- [x] `packages/coding-agent/src/core/settings-manager.ts` — persist `editorPaddingX` with a zero default.
- [x] `packages/coding-agent/src/modes/interactive/components/custom-editor.ts` — audited wrapper around the editor used for app-level input handling; no independent padding override needed.
- [x] `packages/coding-agent/src/modes/interactive/components/extension-editor.ts` — audited modal editor wrapper; no independent padding override needed.

## Chat and output boxes

- [x] `packages/tui/src/components/box.ts` — clamp margins at narrow widths and keep content flush-left when both sides cannot fit.
- [x] `packages/tui/src/components/text.ts` — clamp horizontal padding and preserve width-1 rendering.
- [x] `packages/tui/src/components/markdown.ts` — apply effective horizontal padding consistently during wrapping and rendering.
- [x] `packages/tui/src/components/truncated-text.ts` — apply effective horizontal padding consistently during truncation and rendering.
- [x] `packages/coding-agent/src/modes/interactive/components/user-message.ts` — apply configurable `outputPad` to user messages.
- [x] `packages/coding-agent/src/modes/interactive/components/assistant-message.ts` — apply configurable `outputPad` to assistant messages and thinking blocks.
- [x] `packages/coding-agent/src/modes/interactive/components/custom-message.ts` — audited custom message box padding.
- [x] `packages/coding-agent/src/modes/interactive/components/custom-entry.ts` — audited custom entry box padding; no independent override needed.
- [x] `packages/coding-agent/src/modes/interactive/components/tool-execution.ts` — audited tool execution box padding and narrow-width behavior.
- [x] `packages/coding-agent/src/core/settings-manager.ts` — persist `outputPad` with a zero default while retaining `1` as an explicit option.

## Regression coverage

- [x] TUI text width-1 and narrow-width rendering tests.
- [x] TUI box narrow-width rendering tests.
- [x] TUI editor narrow-width rendering tests.
- [x] Coding-agent settings persistence/default tests.
- [x] Coding-agent user-message selector width tests.
- [x] Coding-agent message padding tests.
- [x] Footer width and terminal rendering tests.

## v0.81.1 integration and packaging

- [x] Fetch `origin/main` and the `v0.81.1` tag.
- [ ] Preserve this checklist and all padding behavior while rebasing onto `origin/main` (`v0.81.1` plus the next-cycle commit).
- [ ] Resolve rebase conflicts and verify the resulting branch diff.
- [ ] Run affected tests and `npm run check`.
- [ ] Clean stale package artifacts and rebuild `packages/tui` and `packages/coding-agent`.
- [ ] Pack fresh v0.81.1-compatible `.tgz` artifacts and verify their version and bundled `dist` output.

## Behavior notes

- `editorPaddingX` affects the bottom input editor.
- `outputPad` affects rendered user, assistant, and thinking output, not the input editor.
- At very narrow widths, padding is reduced before content width; left padding is removed first so content remains visible and flush-left.
