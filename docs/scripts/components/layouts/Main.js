import { pipe, pipeDom } from "../../../ext/pipe-js.es.js";

export const Main = (store) => {
	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withInit(el => {
			const update = async () => {
				el.innerHTML = '';
				const page = store.get('url');
				const module = await import(`../../pages/${page}.js`);
				const componentFactory = module[page];
				const component = componentFactory();
				el.appendChild(component.render());
			}
			
			store.subscribe(update);
		})
	)('main')
}