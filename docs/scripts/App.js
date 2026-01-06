import { pipe, pipeDom } from "pipe-js.es.js";
import { Header } from "./components/layouts/Header.js";
import { createState } from "../../ext/state/state.es.js";

const render = () => {
	const store = createState({
		url: '/',
		lang: 'ru',
	});

	return pipe(
		pipeDom.createElementFromSelector,
		// pipeDom.withComponents(
		// 	Header
		// ),
		// pipeDom.render('body')
	)('div.app', store);
};

export const App = { render };