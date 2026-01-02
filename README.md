# Pipe.js (Dev draft)

[![Documentation](https://img.shields.io/badge/docs-live-green)](https://nickseal80.github.io/pipe-js/)
[![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/nickseal80/pipe-js)

**Универсальный пайплайн для JavaScript** — создавайте свои библиотеки без зависимостей.

## Быстрый старт

```bash
npm install pipe-js
```

## Документация

📚 **[Живая документация и демо](https://nickseal80.github.io/pipe-js/)**

## Пример

```javascript
import { pipe, createLibrary } from 'pipe-js';

const textLib = createLibrary('text', {
    uppercase: (input) => input.toUpperCase()
});

const result = pipe(textLib.uppercase())('hello');
console.log(result); // "HELLO"
```

// ... остальная документация ...