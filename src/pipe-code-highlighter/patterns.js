export const patterns = [
	// Comments
	{ pattern: /\/\/.*$/gm, type: 'comment' },
	{ pattern: /\/\*[\s\S]*?\*\//g, type: 'comment' },
	
	// Strings
	{ pattern: /"(?:\\.|[^"\\])*"/g, type: 'string' },
	{ pattern: /'(?:\\.|[^'\\])*'/g, type: 'string' },
	{ pattern: /`(?:\\.|[^`\\])*`/g, type: 'string' },
	
	// Keywords
	{
		pattern: /\b(function|if|else|for|while|switch|case|break|continue|return|var|let|const|new|this|class|extends|export|import|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|do|yield|void|delete)\b/g,
		type: 'keyword'
	},
	
	// Values
	{ pattern: /\b(true|false|null|undefined)\b/g, type: 'value' },
	{ pattern: /\b\d+(\.\d+)?\b/g, type: 'number' },
	
	// Functions
	{ pattern: /\b\w+(?=\s*\()/g, type: 'function' },
];