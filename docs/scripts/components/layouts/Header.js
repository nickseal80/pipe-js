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
					{ href: "/", caption: 'Главная'},
					{ href: "/install", caption: 'Установка' },
					{ href: "/docs", caption: 'Документация' },
					{ href: "/demo", caption: 'Попробовать' },
					{ href: "https://github.com/nickseal80/pipe-js", caption: 'GitHub' },
				])
		)
	)('header');
}

// <div>
// 	<a href="https://github.com/nickseal80/pipe-js" className="btn btn-gh">GitHub</a>
// 	<a href="#demo" className="btn">Попробовать</a>
// 	<a href="#install" className="btn">Установка</a>
// </div>