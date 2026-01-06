import { pipe, pipeDom } from "https://nickseal80.github.io/pipe-js/ext/pipe-js.es.js";
// import { Header } from "./components/layouts/Header.js";
// import { createState } from "../../ext/state/state.es.js";

const render = () => {
	// const store = createState({
	// 	url: '/',
	// 	lang: 'ru',
	// });

	return pipe(
		pipeDom.createElementFromSelector,
		// pipeDom.withComponents(
		// 	Header
		// ),
		// pipeDom.render('body')
	)('div.app');
};

export const App = { render };