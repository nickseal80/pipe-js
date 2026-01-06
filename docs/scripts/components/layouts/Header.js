import { pipe, pipeDom } from "../../../ext/pipe-js.es.js";
import { Badges } from "../Badges.js";
import { Pages } from "../Pages.js";

const { createElementFromSelector, withElements, withTextContent } = pipeDom;

export const Header = (store) => {
	return pipe(
		createElementFromSelector,
		withElements(
			pipe(
				createElementFromSelector,
			)('div.logo'),
			pipe(
				createElementFromSelector,
				withTextContent('Универсальный пайплайн для JavaScript — создавайте свои библиотеки без зависимостей'),
			)('p.subtitle'),
			Badges([
				{ text: '0 зависимостей' },
				{ text: '~2KB' },
				{ text: 'Node.js & Browser' },
				{ text: '@Types' },
			]),
			Pages(
				store,
				[
					{ href: "main", caption: 'Главная'},
					{ href: "install", caption: 'Установка' },
					{ href: "docs", caption: 'Документация' },
					{ href: "demo", caption: 'Попробовать' },
				])
		)
	)('header');
}