import { pipe, pipeDom } from "../../../dist/pipe-js.es.js";

export const Pages = (store, pages) => {
	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withElements(
			...pages.map(page => {
				return pipe(
					pipeDom.createElementFromSelector,
					pipeDom.withInit(el => {
						if (store.get('url') === page.href) {
							el.classList.add('btn-gh');
						}
					}),
					pipeDom.withAttributes({
						href: page.href
					}),
					pipeDom.withTextContent(page.caption)
				)('a.btn');
			})
		)
	)('div.pages');
}