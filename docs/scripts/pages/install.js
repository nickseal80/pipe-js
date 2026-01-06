import { pipe, pipeDom } from "../../ext/pipe-js.es.js";

export const install = () => {
	const template = pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withElements(
			pipe(
				pipeDom.createElementFromSelector,
				pipeDom.withTextContent('install'),
			)('div')
		)
	)('template');
	
	const render = () => {
		return template.content.cloneNode(true);
	}
	
	return { render };
}