import { pipe, pipeDom } from "../../ext/pipe-js.es.js";

export const demo = () => {
	const template = pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withElements(
			pipe(
				pipeDom.createElementFromSelector,
				pipeDom.withTextContent('demo'),
			)('div')
		)
	)('template');
	
	const render = () => {
		return template.content.cloneNode(true);
	}
	
	return { render };
}