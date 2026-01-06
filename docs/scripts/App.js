import { pipe, pipeDom } from "../ext/pipe-js.es.js";
import { Header } from "./components/layouts/Header.js";
import { Main } from "./components/layouts/Main.js";
import { createState } from "../ext/state/state.es.js";

const render = () => {
	const store = createState({
		url: 'main',
		lang: 'ru',
	});

	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withComponents(
			Header,
			Main
		),
		pipeDom.render('body')
	)('div.app', store);
};

export const App = { render };