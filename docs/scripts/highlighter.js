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

export const patterns = [
	// Сначала строки - они могут содержать что угодно
	{
		pattern: /`(?:\\[\s\S]|[^`\\])*`/g,
		type: 'string'
	},
	{
		pattern: /"(?:\\[\s\S]|[^"\\])*"/g,
		type: 'string'
	},
	{
		pattern: /'(?:\\[\s\S]|[^'\\])*'/g,
		type: 'string'
	},
	
	// Комментарии (только вне строк)
	{
		pattern: /\/\/[^\n]*/g,
		type: 'comment'
	},
	{
		pattern: /\/\*[\s\S]*?\*\//g,
		type: 'comment'
	},
	
	// Keywords
	{
		pattern: /\b(function|if|else|for|while|switch|case|break|continue|return|var|let|const|new|this|class|extends|export|import|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|do|yield|void|delete)\b/g,
		type: 'keyword'
	},
	
	// Values
	{
		pattern: /\b(true|false|null|undefined)\b/g,
		type: 'value'
	},
	{
		pattern: /\b\d+(\.\d+)?\b/g,
		type: 'number'
	},
	
	// Functions (исключая ключевые слова)
	{
		pattern: /\b(?!(?:function|if|else|for|while|switch|case|break|continue|return|var|let|const|new|this|class|extends|export|import|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|do|yield|void|delete)\b)\w+(?=\s*\()/g,
		type: 'function'
	},
];

