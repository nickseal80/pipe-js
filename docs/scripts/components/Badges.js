import { pipe, pipeDom } from "../../../dist/pipe-js.es.js";

export const Badges = (badges) => {
	return pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withComponents(
			...badges.map(badge => {
				return pipe(
					pipeDom.createElementFromSelector,
					pipeDom.withTextContent(badge.text)
				)('span.badge');
			})
		)
	)('div.badges');
}