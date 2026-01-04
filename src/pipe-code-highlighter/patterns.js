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