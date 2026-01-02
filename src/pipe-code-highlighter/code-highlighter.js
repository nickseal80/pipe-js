import { createLibrary } from "../createLib.js";
import {patterns} from "./patterns.js";

export const codeHighlighter = createLibrary('CodeHighlighter', {
	highlightJS: (code) => {
		if (typeof code !== 'string') {
			throw new TypeError(`[highlightJS] Expected string, got: ${typeof code}`);
		}
		
		let highlighted = code;
		patterns.forEach(({ pattern, type }) => {
			highlighted = highlighted.replace(pattern, match => `<span class="js-${type}">${match}</span>`);
		});
		
		return highlighted;
	}
});