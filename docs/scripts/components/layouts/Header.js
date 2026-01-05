import { pipe, pipeDom } from "../../../../dist/pipe-js.es.js";
import { Badges } from "../Badges.js";

const { createElementFromSelector, withElements, withTextContent } = pipeDom;

export const Header = () => {
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
				{ text: 'TypeScript готов' },
			]),
			
		)
	)('header');
}

// <div>
// 	<a href="https://github.com/nickseal80/pipe-js" className="btn btn-gh">GitHub</a>
// 	<a href="#demo" className="btn">Попробовать</a>
// 	<a href="#install" className="btn">Установка</a>
// </div>