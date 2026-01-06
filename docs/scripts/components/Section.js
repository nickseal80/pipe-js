import { pipe, pipeDom } from "../../ext/pipe-js.es.js";

export const Section = (title, content, props = {}) => {
	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withAttributes(props),
		pipeDom.withElements(
			pipe(
				pipeDom.createElementFromSelector,
				pipeDom.withTextContent(title),
			)('h2')
		),
		pipeDom.withInnerHTML(content)
	)('section');
}