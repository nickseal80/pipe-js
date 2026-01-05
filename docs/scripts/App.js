import { pipe, pipeDom } from "../../dist/pipe-js.es.js";
import { Header } from "./components/layouts/Header.js";

const render = () => {
	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withComponents(
			Header
		),
		pipeDom.render('body')
	)('div.app');
};

export const App = { render };