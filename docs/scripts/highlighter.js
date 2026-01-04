import { patterns } from "../../src/pipe-code-highlighter/patterns.js";

export const highlighter = () => {
	const highlight = (code) => {
		// Токенизация: разбиваем код на фрагменты
		const tokens = [];
		let pos = 0;
		
		while (pos < code.length) {
			let matched = false;
			
			// Пробуем каждый паттерн
			for (const { pattern, type } of patterns) {
				pattern.lastIndex = pos;
				const match = pattern.exec(code);
				
				if (match && match.index === pos) {
					tokens.push({
						type: type,
						text: match[0]
					});
					pos += match[0].length;
					matched = true;
					break;
				}
			}
			
			// Если ничего не нашли - обычный текст
			if (!matched) {
				// Находим следующий токен
				let nextPos = pos + 1;
				let foundNext = false;
				
				while (nextPos < code.length && !foundNext) {
					for (const { pattern } of patterns) {
						pattern.lastIndex = nextPos;
						const match = pattern.exec(code);
						if (match && match.index === nextPos) {
							foundNext = true;
							break;
						}
					}
					if (!foundNext) nextPos++;
				}
				
				const text = code.substring(pos, nextPos);
				if (text) {
					tokens.push({
						type: 'text',
						text: text
					});
				}
				pos = nextPos;
			}
		}
		
		// Преобразуем токены в HTML
		return tokens.map(token => {
			if (token.type === 'text') {
				// Экранируем только обычный текст
				return token.text
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&#039;');
			}
			return `<span class="js-${token.type}">${token.text}</span>`;
		}).join('');
	};
	
	document.querySelectorAll('code').forEach(codeEl => {
		codeEl.innerHTML = highlight(codeEl.textContent);
	});
};

