import { pipe, pipeDom } from "../../ext/pipe-js.es.js";

export const main = () => {
	const template = pipe(
		pipeDom.createElementFromSelector,
		pipeDom.withInnerHTML(content)
	)('template');
	
	const render = () => {
		return template.content.cloneNode(true);
	}
	
	return { render };
}

const content = `<section id="about">
        <h2>🎯 Что такое Pipe.js?</h2>
        <p><strong>Pipe.js</strong> — это не библиотека, а мета-инструмент. Вместо того чтобы устанавливать десятки специализированных библиотек (для дат, валют, текста), вы создаёте свои микро-библиотеки и соединяете их в пайплайны.</p>

        <div class="example">
            <p><strong>Пример проблемы:</strong></p>
            <pre><code>// Раньше: куча зависимостей
import { format } from 'date-fns';      // 67KB
import { round } from 'lodash';         // 24KB
import currencyFormatter from '...';    // 18KB
// Итого: ~100KB+ ненужного кода</code></pre>

            <p><strong>С Pipe.js:</strong></p>
            <pre><code>// Теперь: 0 зависимостей, ваш код
const dateLib = createLibrary('date', {
    format(input) { /* 5 строк кода */ }
});

const currencyLib = createLibrary('currency', {
    format(input) { /* 3 строки кода */ }
});

// Используем
const process = pipe(dateLib.format(), currencyLib.format());</code></pre>
        </div>
    </section>

    <section id="install">
        <h2>📦 Установка</h2>
        <pre><code>npm install pipe-js
# или
yarn add pipe-js
# или просто скопируйте код из GitHub</code></pre>
    </section>

    <section id="demo">
        <h2>⚡ Быстрый старт</h2>
        <pre><code>import { pipe, createLibrary } from 'pipe-js';

// 1. Создаём свою библиотеку
const textLib = createLibrary('text', {
    uppercase: (input) => input.toUpperCase(),
    trim: (input) => input.trim()
});

// 2. Собираем пайплайн
const processText = pipe(
    textLib.trim(),
    textLib.uppercase(),
    (text) => \`Результат: \${text}\`
);

// 3. Используем
console.log(processText('  привет мир  '));
// "Результат: ПРИВЕТ МИР"</code></pre>
    </section>

    <section id="features">
        <h2>✨ Возможности</h2>
        <ul>
            <li>✅ <strong>Создание своих библиотек</strong> за минуту</li>
            <li>✅ <strong>Цепочки операций</strong> — синхронных и асинхронных</li>
            <li>✅ <strong>Хуки</strong> — выполняйте код до/после/при ошибке</li>
            <li>✅ <strong>Статические вызовы</strong> — когда пайп не нужен</li>
            <li>✅ <strong>Легковесность</strong> — 0 зависимостей, ~2KB</li>
            <li>✅ <strong>TypeScript поддержка</strong> — из коробки</li>
        </ul>
    </section>

    <section id="real-example">
        <h2>💰 Реальный пример: обработка счета</h2>
        <pre><code>// Библиотека дат (ваша реализация)
const dateLib = createLibrary('date', {
    format: (date, format) => { /* ... */ },
    isWeekend: (date) => { /* ... */ }
});

// Библиотека валют
const currencyLib = createLibrary('currency', {
    format: (amount, currency) => { /* ... */ }
});

// Пайплайн обработки счета
const processInvoice = pipe(
    dateLib.format('DD/MM/YYYY'),
    (date) => ({
        date,
        dueDate: dateLib.isWeekend(date)
            ? dateLib.addDays(date, 2)
            : date
    }),
    (data) => ({
        ...data,
        amount: currencyLib.format(1000.50, 'USD'),
        localAmount: currencyLib.format(75037.50, 'RUB')
    })
);

processInvoice('2024-01-06');
// { date: '06/01/2024', dueDate: '08/01/2024', ... }</code></pre>
    </section>

    <section id="why">
        <h2>🤔 Зачем это нужно?</h2>
        <p>Если ваша задача решается 10-15 строками JavaScript, зачем устанавливать библиотеку на 50KB?</p>
        <p>Pipe.js даёт:</p>
        <ul>
            <li>🚀 <strong>Контроль</strong> — это ваш код, вы меняете его как хотите</li>
            <li>📦 <strong>Минимум зависимостей</strong> — bundle остаётся маленьким</li>
            <li>🎯 <strong>Единый стиль</strong> — один API для любых задач</li>
            <li>⚡ <strong>Гибкость</strong> — создавайте именно то, что нужно</li>
        </ul>
    </section>

    <section id="links">
        <h2>🔗 Ссылки</h2>
        <p>
            <a href="https://github.com/ваш-логин/pipe-js" class="btn btn-gh">GitHub репозиторий</a>
            <a href="https://www.npmjs.com/package/pipe-js" class="btn">npm пакет</a>
        </p>
        <p>Ищите примеры использования, документацию и исходный код в репозитории.</p>
    </section>`;