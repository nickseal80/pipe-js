import { pipe, pipeDom } from "../../ext/pipe-js.es.js";

export const Pages = (store, pages) => {
	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withElements(
			...pages.map(page => {
				return pipe(
					pipeDom.createElementFromSelector,
					pipeDom.withInit(el => {
						const update = () => {
							el.classList.remove('btn-gh');
							if (store.get('url') === page.href) {
								el.classList.add('btn-gh');
							}
						}
						
						store.subscribe(update);
					}),
					pipeDom.withEventHandlers({
						onClick: evt => {
							evt.preventDefault();
							store.set({ ...store.get(), url: page.href });
							
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