/**
 * Collapsed preview for built-in tool error output.
 *
 * A logical-line cap cannot bound a card's height: one error line can carry a long absolute path
 * that wraps to many screen rows, so a long error looked expanded while collapsed. This component
 * folds by wrapped rows and leaves the full text untouched for the expanded view.
 */

import { type Component, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { keyHint } from "../../../modes/interactive/components/keybinding-hints.ts";
import type { Theme } from "../../../modes/interactive/theme/theme.ts";

/** Wrapped rows shown before the expand hint while an error is collapsed. */
const ERROR_PREVIEW_VISUAL_LINES = 10;

export class ErrorPreviewText implements Component {
	private text: string;
	private readonly theme: Theme;
	private readonly paddingX: number;
	private expanded: boolean;

	constructor(text: string, theme: Theme, expanded: boolean, options: { paddingX?: number } = {}) {
		this.text = text;
		this.theme = theme;
		this.expanded = expanded;
		this.paddingX = options.paddingX ?? 0;
	}

	invalidate(): void {}

	render(width: number): string[] {
		const paddingX = Math.min(this.paddingX, Math.max(0, Math.floor((width - 1) / 2)));
		const contentWidth = Math.max(1, width - paddingX * 2);
		const lines = wrapTextWithAnsi(this.text.replace(/\t/g, "   "), contentWidth);
		const folded = !this.expanded && lines.length > ERROR_PREVIEW_VISUAL_LINES;
		const visibleLines = folded ? lines.slice(0, ERROR_PREVIEW_VISUAL_LINES) : lines;

		if (folded) {
			const remaining = lines.length - ERROR_PREVIEW_VISUAL_LINES;
			const hint = `${this.theme.fg("muted", `... (${remaining} more lines,`)} ${keyHint("app.tools.expand", "to expand")}${this.theme.fg("muted", ")")}`;
			visibleLines.push(...wrapTextWithAnsi(hint, contentWidth));
		}

		const leftMargin = " ".repeat(paddingX);
		const rightMargin = " ".repeat(paddingX);
		return visibleLines.map((line) => leftMargin + line + rightMargin);
	}
}
