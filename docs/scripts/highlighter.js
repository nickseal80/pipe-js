import {pipe} from "../../dist/pipe-js.es.js";
import {pipeDom} from "../../src/pipe-dom/pipe-dom.js";
import {codeHighlighter} from "../../src/pipe-code-highlighter/code-highlighter.js";
import { createErrorWithCause } from "../../src/pipe-dom/polyfills.js";

// const HTML_NS = 'http://www.w3.org/1999/xhtml';
//
// const parseCssSelector = (selector) => {
// 	if (typeof selector !== 'string') {
// 		throw new TypeError(
// 			`[parseCssSelector] Expected string, got: ${typeof selector}`
// 		);
// 	}
//
// 	const trimmed = selector.trim();
// 	if (trimmed.length === 0) {
// 		throw new Error('[parseCssSelector] Empty string passed');
// 	}
//
// 	try {
// 		const tagMatch = trimmed.match(/^[a-zA-Z][\w-]*/);
// 		const idMatch = trimmed.match(/#([\w-]+)/);
// 		const classMatches = [...trimmed.matchAll(/\.([\w-]+)/g)];
// 		const attrMatches = [...trimmed.matchAll(/\[([\w-]+)(?:=(["']?)(.*?)\2)?]/g)];
//
// 		const tag = tagMatch?.[0] ?? null;
// 		const id = idMatch?.[1] ?? null;
// 		const classes = classMatches.map(m => m[1]);
// 		const attributes = attrMatches.map(m => ({
// 			name: m[1],
// 			value: m[3] ?? null
// 		}));
//
// 		return { tag, id, classes, attributes };
// 	} catch (error) {
// 		throw createErrorWithCause(
// 			`[parseCssSelector] Error parsing selector "${selector}": ${error.message}`,
// 			error
// 		);
// 	}
// };
//
// const createElementFromSelectorData = (data) => {
// 	if (!data || typeof data !== 'object') {
// 		throw new TypeError(
// 			`[createElementFromData] Expected object of type Selector, got: ${typeof data}`
// 		);
// 	}
//
// 	const { tag, id, classes = [], attributes = [] } = data;
//
// 	if (!tag || typeof tag !== 'string') {
// 		throw new Error(
// 			`[createElementFromData] Invalid tag: ${tag}`
// 		);
// 	}
//
// 	try {
// 		const el = document.createElementNS(HTML_NS, tag);
//
// 		if (id) {
// 			if (typeof id !== 'string') {
// 				console.warn(`[createElementFromData] ID must be a string, got: ${typeof id}`);
// 			} else {
// 				el.id = id;
// 			}
// 		}
//
// 		if (Array.isArray(classes)) {
// 			classes.forEach(cls => {
// 				if (typeof cls === 'string') {
// 					el.classList.add(cls);
// 				} else {
// 					console.warn(`[createElementFromData] Skipped invalid class: ${cls}`);
// 				}
// 			});
// 		}
//
// 		if (Array.isArray(attributes)) {
// 			attributes.forEach(({ name, value }) => {
// 				if (name && typeof name === 'string') {
// 					try {
// 						el.setAttribute(name, value || '');
// 					} catch (attrError) {
// 						console.warn(`[createElementFromData] Error setting attribute ${name}:`, attrError);
// 					}
// 				}
// 			});
// 		}
//
// 		return el;
// 	} catch (error) {
// 		throw createErrorWithCause(
// 			`[createElementFromData] Error creating element <${tag}>: ${error.message}`,
// 			error
// 		);
// 	}
// };
//
// const createElementFromSelector = pipe(parseCssSelector, createElementFromSelectorData);

const el = await pipe(
	pipeDom.createElementFromSelector
)('div.hi');

console.log(el);

