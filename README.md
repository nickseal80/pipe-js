# Pipe.js (Dev draft)

[![Documentation](https://img.shields.io/badge/docs-live-green)](https://nickseal80.github.io/pipe-js/)
[![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/nickseal80/pipe-js)

**Universal pipeline for JavaScript**

**Pipe.js** is not a library — it's a meta-tool for creating your own micro-libraries and composing them into powerful 
pipelines. Forget about dozens of dependencies—create exactly what you need.

## 🎯 Why Pipe.js? ##

### The Problem ###
```javascript
// Before: tons of dependencies in every project
import { format } from 'date-fns';      // 67KB
import { round } from 'lodash';         // 24KB  
import currencyFormatter from '...';    // 18KB
// Total: ~100KB+ of unnecessary code
```

### The Solution ###
```javascript
// With Pipe.js: 0 dependencies, only your code
const dateLib = createLibrary('date', {
    format(date) { /* 5 lines of your code */ },
    isWeekend(date) { /* 3 lines */ }
});

const currencyLib = createLibrary('currency', {
    format(amount) { /* 3 lines */ }
});

// Use consistently everywhere
const process = pipe(dateLib.format(), currencyLib.format());
```

## ✨ Features ##
- 🚀 Zero Dependencies — only pure JavaScript
- 📦 ~2KB — minimal size, maximum utility
- 🎯 Universal — create libraries for any task
- ⚡ Hooks & Middleware — extend pipeline behavior
- 🔗 Sync & Async Operations — unified interface
- 🛡️ TypeScript Support — out of the box

### 📦 Installation (in development) ###
```bash
npm install pipe-js
# or
yarn add pipe-js
# or
pnpm add pipe-js
```

### CDN (for browser): ###
```html
<script src="https://unpkg.com/pipe-js/dist/pipe.min.js"></script>
```

## 🚀 Quick Start ##
### 1. Create Your First Library ###
```javascript
import { createLibrary, pipe } from 'pipe-js';

// Text manipulation library
const textLib = createLibrary('text', {
    // Simple functions
    uppercase: (input) => input.toUpperCase(),
    trim: (input) => input.trim(),
    
    // Functions with parameters
    prefix: (input, prefix) => `${prefix}${input}`,
    suffix: (input, suffix) => `${input}${suffix}`,
    
    // Async functions work too
    async fetchAndProcess(url) {
        const response = await fetch(url);
        return response.text();
    }
});

// Math operations library
const mathLib = createLibrary('math', {
    add: (input, num) => input + num,
    multiply: (input, num) => input * num,
    round: (input, decimals = 2) => Math.round(input * 10**decimals) / 10**decimals
});
```

### 2. Build a Pipeline ###
```javascript
// Simple text processing pipeline
const processText = pipe(
    textLib.trim(),
    textLib.uppercase(),
    textLib.prefix('Hello: '),
    textLib.suffix('!')
);

console.log(processText('  world  ')); 
// "Hello: WORLD!"

// Complex pipeline with library switching
const calculatePrice = pipe(
    mathLib.add(100),           // +100
    mathLib.multiply(1.2),      // ×1.2 (VAT)
    mathLib.round(2),           // rounding
    textLib.prefix('Price: $')  // formatting
);

console.log(calculatePrice(50)); 
// "Price: $180.00"
```

### 3. Use Static Calls ###
```javascript
// When you don't need a full pipeline
const result = textLib.uppercase.static('hello');
console.log(result); // "HELLO"

// Or curried version
const toUpper = textLib.uppercase();
console.log(toUpper('hello')); // "HELLO"
```

## 💡 Real-World Examples ##
### Example 1: User Data Processing ###
```javascript
const userLib = createLibrary('user', {
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    normalizeName(name) {
        return name.trim().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },
    
    async checkAvailability(username) {
        const response = await fetch(`/api/user/check/${username}`);
        return response.json();
    }
});

const processUserRegistration = pipe(
    userLib.normalizeName(),
    (name) => ({ name, email: '', username: '' }),
    
    // Email validation
    (data) => {
        if (!userLib.validateEmail.static(data.email)) {
            throw new Error('Invalid email');
        }
        return data;
    },
    
    // Username availability check
    async (data) => {
        const available = await userLib.checkAvailability.static(data.username);
        return { ...data, usernameAvailable: available };
    }
).error((error) => {
    console.error('Registration error:', error);
    return { error: true, message: error.message };
});

// Usage
const userData = await processUserRegistration({
    name: 'john doe',
    email: 'john@example.com',
    username: 'johndoe'
});
```

### Example 2: Financial Calculations ###
```javascript
const financeLib = createLibrary('finance', {
	formatCurrency(amount, currency = 'USD') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(amount);
	},
	
	calculateTax(amount, rate = 0.2) {
		return amount * rate;
	},
	
	applyDiscount(amount, discountPercent) {
		return amount * (1 - discountPercent / 100);
	}
});

const processInvoice = pipe(
	financeLib.applyDiscount(15),    // 15% discount
	(amount) => ({
		subtotal: amount,
		tax: financeLib.calculateTax.static(amount, 0.2),
		total: amount + financeLib.calculateTax.static(amount, 0.2)
	}),
	(invoice) => ({
		...invoice,
		formatted: {
			subtotal: financeLib.formatCurrency.static(invoice.subtotal, 'USD'),
			tax: financeLib.formatCurrency.static(invoice.tax, 'USD'),
			total: financeLib.formatCurrency.static(invoice.total, 'USD')
		}
	})
);

console.log(processInvoice(1000));
// {
//   subtotal: 850,
//   tax: 170,
//   total: 1020,
//   formatted: {
//     subtotal: '$850.00',
//     tax: '$170.00',
//     total: '$1,020.00'
//   }
// }
```

## 🎛️ Hooks & Middleware ##
```javascript
const trackedPipeline = pipe(
    fetchUserData,
    processData,
    saveToDatabase
)
// "Before execution" hook
.before((data, { fn, index }) => {
    console.log(`🚀 Step ${index}: starting ${fn.name}`);
    console.time(`step-${index}`);
    return data;
})
// "After execution" hook
.after((data, { fn, index }) => {
    console.timeEnd(`step-${index}`);
    console.log(`Step ${index} completed`);
    return data;
})
// Error handler
.error((error, { fn, index }) => {
    console.error(`Error in step ${index} (${fn.name}):`, error);
    // Can return default value
    return { error: true, step: index, message: error.message };
})
// Loading state hook (e.g., for UI)
.loading((data, { isLoading }) => {
    if (isLoading) {
        showSpinner();
    } else {
        hideSpinner();
    }
    return data;
});

// Use as usual
const result = await trackedPipeline(userId);
```

## 🔧 Advanced Features ##
### Creating Library Chains ###
```javascript
// Date manipulation library
const dateLib = createLibrary('date', {
    format(date, format = 'DD.MM.YYYY') {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', d.getFullYear());
    },
    
    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }
});

// Complex date pipeline
const processDates = pipe(
    dateLib.format('YYYY-MM-DD'),
    (dateStr) => new Date(dateStr),
    (date) => dateLib.addDays(date, 7),
    dateLib.format('DD.MM.YYYY'),
    textLib.prefix('New date: ')
);

console.log(processDates('2024-01-01')); 
// "New date: 08.01.2024"
```

### Pipeline Composition ###
```javascript
// Small reusable pipelines
const sanitizeInput = pipe(
    textLib.trim(),
    textLib.suffix('[sanitized]')
);

const formatOutput = pipe(
    textLib.prefix('📦 '),
    textLib.suffix(' ✅')
);

// Compose them into a larger pipeline
const fullPipeline = pipe(
    sanitizeInput,
    mathLib.add(42),
    formatOutput
);

console.log(fullPipeline('  test  ')); 
// "📦 test[sanitized]42 ✅"
```

## 📚 API Reference ##

`createLibrary(name, functions)`
Creates a new library with specified functions.
```javascript
const lib = createLibrary('example', {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b
});

// Usage
lib.add(2, 3); // 5
lib.add.static(2, 3); // 5 (static call)
```

`pipe(...functions)` Creates a pipeline from functions.
```javascript
const p = pipe(
    (x) => x * 2,
    (x) => x + 1
);

p(5); // 11
```

### Pipeline methods: ###
- `.before(fn)` - hook executed before each function
- `.after(fn)` - hook executed after each function
- `.error(fn)` - error handler
- `.loading(fn)` - loading state hook

*** 

(in development)
## 📄 License ##
MIT © Nick Seal. See LICENSE file for details.

## 🔗 Links ##
- 📖 Documentation
- 🐛 Bug Reports
- 💬 Discussion
- ⭐ Star on GitHub