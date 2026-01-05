import { createLibrary } from "../createLib.js";
import { createErrorWithCause } from "./polyfills.js";
import { pipe } from "../pipe/pipe.js";

/**
 * HTML-specific constants
 */
const HTML_NS = 'http://www.w3.org/1999/xhtml';

const domUtils = {
    CSS_SELECTOR_STR: 'selector',
    HTML_ELEMENT_STR: 'html',
};

export const pipeDom = createLibrary('DOM', {

    /**
     * Determines the type of string: HTML element or CSS selector
     *
     * @param {string} str - String to analyze
     * @returns {string} String type: domUtils.HTML_ELEMENT_STR or domUtils.CSS_SELECTOR_STR
     * @throws {TypeError} When a non-string argument is passed
     * @throws {Error} When an empty string is passed (after trim)
     *
     * @example
     * // Returns domUtils.HTML_ELEMENT_STR
     * detectStringType('<div class="test">Hello</div>');
     *
     * @example
     * // Returns domUtils.CSS_SELECTOR_STR
     * detectStringType('.my-class');
     * detectStringType('#header');
     * detectStringType('div > p');
     *
     * @example
     * // Generates errors
     * detectStringType(123); // TypeError
     * detectStringType('   '); // Error
     */
    detectStringType: (str) => {
        if (typeof str !== 'string') {
            throw new TypeError(
                `[detectStringType] Expected string, got: ${typeof str}`
            );
        }

        const trimmed = str.trim();

        if (trimmed.length === 0) {
            throw new Error("[detectStringType] Empty string passed");
        }

        if (trimmed.startsWith('<')) {
            try {
                const doc = new DOMParser().parseFromString(trimmed, 'text/html');

                // Check for parsing errors
                const parserErrors = doc.querySelectorAll('parsererror');
                if (parserErrors.length > 0) {
                    console.warn('[detectStringType] HTML parsing error, treating as selector');
                    return domUtils.CSS_SELECTOR_STR;
                }

                const first = doc.body.firstElementChild;

                if (first && first.tagName) {
                    return domUtils.HTML_ELEMENT_STR;
                }
            } catch (error) {
                console.warn('[detectStringType] Error parsing HTML:', error);
                return domUtils.CSS_SELECTOR_STR;
            }
        }

        return domUtils.CSS_SELECTOR_STR;
    },

    /**
     * Parses a CSS selector and extracts its components: tag, id, classes, and attributes
     *
     * @param {string} selector - CSS selector to parse
     * @returns {Selector} Object with parsed selector components
     *
     * @throws {TypeError} When a non-string argument is passed
     * @throws {Error} When an empty string is passed (after trim)
     * @throws {Error} When a parsing error occurs (wrapped in createErrorWithCause)
     *
     * @example
     * // Simple selector
     * parseCssSelector('div');
     * // returns { tag: 'div', id: null, classes: [], attributes: [] }
     *
     * @example
     * // Selector with class and ID
     * parseCssSelector('button#submit.btn.primary');
     * // returns {
     * //   tag: 'button',
     * //   id: 'submit',
     * //   classes: ['btn', 'primary'],
     * //   attributes: []
     * // }
     *
     * @example
     * // Selector with attributes
     * parseCssSelector('input[type="text"][required]');
     * // returns {
     * //   tag: 'input',
     * //   id: null,
     * //   classes: [],
     * //   attributes: [
     * //     { name: 'type', value: 'text' },
     * //     { name: 'required', value: null }
     * //   ]
     * // }
     *
     * @example
     * // Generates errors
     * parseCssSelector(123); // TypeError
     * parseCssSelector('   '); // Error
     */
    parseCssSelector(selector) {
        if (typeof selector !== 'string') {
            throw new TypeError(
                `[parseCssSelector] Expected string, got: ${typeof selector}`
            );
        }

        const trimmed = selector.trim();
        if (trimmed.length === 0) {
            throw new Error('[parseCssSelector] Empty string passed');
        }

        try {
            const tagMatch = trimmed.match(/^[a-zA-Z][\w-]*/);
            const idMatch = trimmed.match(/#([\w-]+)/);
            const classMatches = [...trimmed.matchAll(/\.([\w-]+)/g)];
            const attrMatches = [...trimmed.matchAll(/\[([\w-]+)(?:=(["']?)(.*?)\2)?]/g)];

            const tag = tagMatch?.[0] ?? null;
            const id = idMatch?.[1] ?? null;
            const classes = classMatches.map(m => m[1]);
            const attributes = attrMatches.map(m => ({
                name: m[1],
                value: m[3] ?? null
            }));

            return { tag, id, classes, attributes };
        } catch (error) {
            throw createErrorWithCause(
                `[parseCssSelector] Error parsing selector "${selector}": ${error.message}`,
                error
            );
        }
    },

    /**
     * Creates a DOM element based on selector data
     *
     * @param {Object} data - Data for creating the element
     * @param {string} data.tag - HTML tag name (required parameter)
     * @param {string} [data.id] - Element ID
     * @param {string[]} [data.classes=[]] - Array of CSS classes
     * @param {Array<Object>} [data.attributes=[]] - Array of attribute objects
     * @param {string} data.attributes[].name - Attribute name
     * @param {string} [data.attributes[].value] - Attribute value
     * @returns {HTMLElement} Created DOM element
     *
     * @throws {TypeError} When data is not an object
     * @throws {Error} When tag is missing or not a string
     * @throws {Error} When an element creation error occurs
     *
     * @example
     * // Creating element with tag
     * createElementFromSelectorData({ tag: 'div' });
     * // returns: <div></div>
     *
     * @example
     * // Creating element with ID and classes
     * createElementFromSelectorData({
     *   tag: 'button',
     *   id: 'submit-btn',
     *   classes: ['btn', 'primary']
     * });
     * // returns: <button id="submit-btn" class="btn primary"></button>
     *
     * @example
     * // Creating element with attributes
     * createElementFromSelectorData({
     *   tag: 'input',
     *   attributes: [
     *     { name: 'type', value: 'text' },
     *     { name: 'placeholder', value: 'Enter text' },
     *     { name: 'required', value: '' }
     *   ]
     * });
     * // returns: <input type="text" placeholder="Enter text" required="">
     *
     * @example
     * // Generates errors
     * createElementFromSelectorData(123); // TypeError
     * createElementFromSelectorData({}); // Error - tag missing
     * createElementFromSelectorData({ tag: 123 }); // Error - invalid tag
     */
    createElementFromSelectorData(data) {
        if (!data || typeof data !== 'object') {
            throw new TypeError(
                `[createElementFromData] Expected object of type Selector, got: ${typeof data}`
            );
        }

        const { tag, id, classes = [], attributes = [] } = data;

        if (!tag || typeof tag !== 'string') {
            throw new Error(
                `[createElementFromData] Invalid tag: ${tag}`
            );
        }

        try {
            const el = document.createElementNS(HTML_NS, tag);

            if (id) {
                if (typeof id !== 'string') {
                    console.warn(`[createElementFromData] ID must be a string, got: ${typeof id}`);
                } else {
                    el.id = id;
                }
            }

            if (Array.isArray(classes)) {
                classes.forEach(cls => {
                    if (typeof cls === 'string') {
                        el.classList.add(cls);
                    } else {
                        console.warn(`[createElementFromData] Skipped invalid class: ${cls}`);
                    }
                });
            }

            if (Array.isArray(attributes)) {
                attributes.forEach(({ name, value }) => {
                    if (name && typeof name === 'string') {
                        try {
                            el.setAttribute(name, value || '');
                        } catch (attrError) {
                            console.warn(`[createElementFromData] Error setting attribute ${name}:`, attrError);
                        }
                    }
                });
            }

            return el;
        } catch (error) {
            throw createErrorWithCause(
                `[createElementFromData] Error creating element <${tag}>: ${error.message}`,
                error
            );
        }
    },

    /**
     * Creates a DOM element from a CSS selector.
     * Composition of parseCssSelector and createElementFromSelectorData functions.
     *
     * @param {string} selector - CSS selector to create element from
     * @returns {HTMLElement} Created DOM element
     *
     * @throws {TypeError} When selector is not a string
     * @throws {Error} When selector is an empty string
     * @throws {Error} When selector parsing error occurs
     * @throws {Error} When element creation error occurs
     *
     * @example
     * // Creating simple element
     * createElementFromSelector('div');
     * // returns: <div></div>
     *
     * @example
     * // Creating element with classes
     * createElementFromSelector('button.btn.primary');
     * // returns: <button class="btn primary"></button>
     *
     * @example
     * // Creating element with ID
     * createElementFromSelector('divaweader');
     * // returns: <div id="header"></div>
     *
     * @example
     * // Creating element with attributes
     * createElementFromSelector('input[type="text"][required]');
     * // returns: <input type="text" required="">
     *
     * @example
     * // Creating complex element
     * createElementFromSelector('form#login-form.auth-form[novalidate]');
     * // returns: <form id="login-form" class="auth-form" novalidate=""></form>
     *
     * @see parseCssSelector
     * @see createElementFromSelectorData
     * @see pipe
     */
    createElementFromSelector(selector) {
        if (typeof selector !== 'string') {
            throw new TypeError(
                `[createElementFromSelector] Expected string, got: ${typeof selector}`
            );
        }
    
        try {
            // Создаем элемент и возвращаем его напрямую
            const parsedData = this.parseCssSelector(selector);
            return this.createElementFromSelectorData(parsedData);
        } catch (error) {
            throw createErrorWithCause(
                `[createElementFromSelector] Error creating element from selector "${selector}": ${error.message}`,
                error
            );
        }
    },

    /**
     * Higher-order function that sets text content for a DOM element
     *
     * @param {string | Number} text - Text to set in the element
     * @returns {Function} Function that accepts a DOM element and returns it with text set
     *
     * @throws {TypeError} When text is not a string
     *
     * @example
     * // Usage with element creation
     * const button = createElementFromSelector('button');
     * const buttonWithText = withTextContent('Click me')(button);
     * // button.textContent = 'Click me'
     *
     * @example
     * // Usage in call chain
     * const element = pipe(
     *   createElementFromSelector,
     *   withTextContent('Hello, world!'),
     *   withEventHandlers({
     *     onClick: () => console.log('Click!')
     *   })
     * )('div');
     *
     * @example
     * // Generates error
     * withTextContent(123)(document.createElement('div')); // TypeError
     */
    withTextContent: (text) => (element) => {
        if (typeof text !== 'string') {
            throw new TypeError(
                `[withTextContent] Expected string, got: ${typeof text}`
            );
        }

        element.textContent = text;

        return element;
    },
    
    /**
     * Sets multiple attributes on an element.
     * Converts camelCase attribute names to kebab-case.
     * Skips invalid attributes and provides warnings.
     *
     * @example
     * // Basic usage
     * pipe(createElement('div'), withAttributes({ id: 'myDiv', class: 'container' }));
     *
     * @example
     * // CamelCase to kebab-case conversion
     * pipe(createElement('input'), withAttributes({
     *   dataUserId: '123',      // becomes data-user-id
     *   ariaLabel: 'Search',    // becomes aria-label
     *   customAttr: 'value'     // becomes custom-attr
     * }));
     *
     * @example
     * // Multiple calls
     * pipe(createElement('div'),
     *   withAttributes({ class: 'container' }),
     *   withAttributes({ id: 'main', style: 'color: red;' })
     * );
     *
     * @param {Object} attributes - Object containing attribute key-value pairs
     * @returns {Function} Function that accepts an element and returns it with attributes set
     *
     * @throws {TypeError} When element is not a valid HTMLElement
     *
     * @property {string} displayName - Debug name for the function
     */
    withAttributes: (attributes) => {
        if (attributes === null || attributes === undefined) {
            throw new TypeError('withAttributes: attributes object cannot be null or undefined');
        }
        
        if (typeof attributes !== 'object' || Array.isArray(attributes)) {
            throw new TypeError('withAttributes: attributes must be a plain object');
        }
        
        /**
         * Converts camelCase string to kebab-case
         * @param {string} str - camelCase string
         * @returns {string} kebab-case string
         */
        const camelToKebab = (str) => {
            if (typeof str !== 'string') return str;
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        };
        
        /**
         * Validates if a value can be used as an attribute value
         * @param {*} value - Value to validate
         * @returns {boolean} True if value is valid
         */
        const isValidAttributeValue = (value) => {
            return value !== null && value !== undefined;
        };
        
        const attributeSetter = (element) => {
            if (!element || !(element instanceof HTMLElement)) {
                throw new TypeError(
                    `withAttributes: Expected HTMLElement, got ${element === null ? 'null' : typeof element}`
                );
            }
            
            const attributeKeys = Object.keys(attributes);
            let appliedCount = 0;
            
            attributeKeys.forEach((key) => {
                const value = attributes[key];
                
                // Skip invalid values
                if (!isValidAttributeValue(value)) {
                    console.warn(
                        `withAttributes: Skipping attribute "${key}" with invalid value:`,
                        value
                    );
                    return;
                }
                
                // Convert camelCase to kebab-case for attribute names
                const attributeName = camelToKebab(key);
                
                // Special handling for style attribute (can be object or string)
                if (attributeName === 'style' && typeof value === 'object' && !Array.isArray(value)) {
                    try {
                        Object.keys(value).forEach((styleKey) => {
                            const kebabStyleKey = camelToKebab(styleKey);
                            element.style[kebabStyleKey] = value[styleKey];
                        });
                        appliedCount++;
                    } catch (error) {
                        console.warn(`withAttributes: Error setting style attribute:`, error);
                    }
                    return;
                }
                
                // Special handling for class attribute (can be string or array)
                if (attributeName === 'class') {
                    try {
                        if (Array.isArray(value)) {
                            element.className = value.filter(cls => cls && typeof cls === 'string').join(' ');
                        } else if (typeof value === 'string') {
                            element.className = value;
                        }
                        appliedCount++;
                    } catch (error) {
                        console.warn(`withAttributes: Error setting class attribute:`, error);
                    }
                    return;
                }
                
                // Handle dataset attributes (data-*)
                if (attributeName.startsWith('data-')) {
                    const dataKey = attributeName.replace('data-', '');
                    try {
                        element.dataset[dataKey] = String(value);
                        appliedCount++;
                    } catch (error) {
                        console.warn(`withAttributes: Error setting data attribute ${dataKey}:`, error);
                    }
                    return;
                }
                
                // Handle aria attributes
                if (attributeName.startsWith('aria-')) {
                    try {
                        element.setAttribute(attributeName, String(value));
                        appliedCount++;
                    } catch (error) {
                        console.warn(`withAttributes: Error setting aria attribute ${attributeName}:`, error);
                    }
                    return;
                }
                
                // Standard attributes
                try {
                    element.setAttribute(attributeName, String(value));
                    appliedCount++;
                } catch (error) {
                    console.warn(`withAttributes: Error setting attribute "${attributeName}":`, error);
                }
            });
            
            // Log summary in development
            if (process.env.NODE_ENV !== 'production' && appliedCount !== attributeKeys.length) {
                console.debug(
                    `withAttributes: Applied ${appliedCount} of ${attributeKeys.length} attributes`
                );
            }
            
            return element;
        };
        
        // Add display name for debugging
        attributeSetter.displayName = `withAttributes(${Object.keys(attributes).join(', ')})`;
        
        return attributeSetter;
    },

    /**
     * Higher-order function that adds child elements to a parent element
     *
     * @param {...(HTMLElement|Function)} children - Child elements or functions returning elements
     * @returns {Function} Function that accepts a parent element and returns it with added child elements
     *
     * @throws {TypeError} When parent element is not a Node or function
     * @throws {TypeError} When none of the child elements is a Node
     *
     * @example
     * // Adding ready elements
     * const div = document.createElement('div');
     * const span1 = document.createElement('span');
     * const span2 = document.createElement('span');
     * withElements(span1, span2)(div);
     *
     * @example
     * // Adding elements through functions
     * const createButton = () => document.createElement('button');
     * const createInput = () => document.createElement('input');
     * withElements(createButton, createInput)(div);
     *
     * @example
     * // Usage in call chain
     * const container = pipe(
     *   createElementFromSelector,
     *   withElements(
     *     createElementFromSelector('h1'),
     *     createElementFromSelector('p')
     *   ),
     *   withEventHandlers({
     *     onClick: () => console.log('Container click')
     *   })
     * )('div.container');
     *
     * @example
     * // Mixed usage
     * const existingElement = document.getElementById('existing');
     * withElements(
     *   createElementFromSelector('span'),
     *   existingElement,
     *   () => document.createElement('div')
     * )(document.body);
     */
    withElements: (...children) => (parent) => {
        // Check parent element
        if (!parent || (typeof parent !== 'function' && !(parent instanceof Node))) {
            throw new TypeError(
                `[withElements] Expected Node or function returning HTMLElement, got: ${typeof parent}`
            );
        }

        const parentNode = (typeof parent === 'function') ? parent() : parent;

        // Check function result
        if (!(parentNode instanceof HTMLElement)) {
            throw new TypeError(
                `[withElements] Function must return HTMLElement, got: ${typeof parentNode}`
            );
        }

        let hasValidChildren = false;

        children.forEach((child, index) => {
            try {
                const childNode = (typeof child === 'function') ? child() : child;

                if (childNode && childNode instanceof HTMLElement) {
                    parentNode.appendChild(childNode);
                    hasValidChildren = true;
                } else if (childNode !== null && childNode !== undefined) {
                    console.warn(
                        `[withElements] Skipped invalid child element at index ${index}. Expected Node or function returning HTMLElement, got: ${typeof childNode}`
                    );
                }
            } catch (error) {
                console.warn(
                    `[withElements] Error processing child element at index ${index}:`,
                    error
                );
            }
        });

        if (!hasValidChildren) {
            throw new TypeError(
                '[withElements] None of the child elements is a valid HTMLElement'
            );
        }

        return parent;
    },

    /**
     * Higher-order function that adds child components to a parent element.
     * Supports passing arguments for component creation and composition through arrays.
     *
     * @param {...(Node|Function|Array)} children - Child elements, functions, or arrays for composition
     * @returns {Function} Function that accepts a parent element and arguments, returns parent element with added child elements
     *
     * @throws {TypeError} When parent element is not an HTMLElement
     * @throws {TypeError} When component creation function doesn't return HTMLElement
     *
     * @example
     * // Simple element addition
     * const div = document.createElement('div');
     * const span = document.createElement('span');
     * withComponents(span)(div);
     *
     * @example
     * // Using functions with arguments
     * const createButton = (text) => {
     *   const btn = document.createElement('button');
     *   btn.textContent = text;
     *   return btn;
     * };
     *
     * withComponents(createButton)(div, 'Click me');
     * // Equivalent to: createButton('Click me')
     *
     * @example
     * // Using arrays for composition with arguments
     * withComponents(
     *   [createButton, 'Button text'],
     *   [createElementFromSelector, 'div.container'],
     *   document.createElement('span')
     * )(div, 'additional argument');
     *
     * @example
     * // Complex usage in chain
     * const createUserCard = (user) => pipe(
     *   createElementFromSelector('div.user-card'),
     *   withComponents(
     *     [createElementFromSelector, 'h2.user-name'],
     *     [withTextContent, user.name],
     *     [createElementFromSelector, 'p.user-email'],
     *     [withTextContent, user.email]
     *   )
     * )();
     *
     * @example
     * // Generates errors
     * withComponents()(123); // TypeError - invalid parent element
     * withComponents(() => null)(div); // TypeError - function didn't return Node
     */
    withComponents: (...children) => (parent, ...args) => {
        if (!parent || !(parent instanceof HTMLElement)) {
            throw new TypeError(
                `[withComponents] Expected HTMLElement for parent, got: ${typeof parent}`
            );
        }

        let hasValidChildren = false;

        children.forEach((childDef, index) => {
            try {
                let child;

                if (Array.isArray(childDef)) {
                    const [fn, ...childArgs] = childDef;

                    if (fn === undefined || fn === null) {
                        console.warn(`[withComponents] Skipped empty element in array at index ${index}`);
                        return;
                    }

                    if (typeof fn !== 'function') {
                        // If first array element is not a function, use it as static element
                        child = fn;
                    } else {
                        child = fn(...childArgs, ...args);
                    }
                } else {
                    child = (typeof childDef === 'function') ? childDef(...args) : childDef;
                }

                if (child && child instanceof HTMLElement) {
                    parent.appendChild(child);
                    hasValidChildren = true;
                } else if (child !== null && child !== undefined) {
                    console.warn(
                        `[withComponents] Skipped invalid child element at index ${index}. Expected HTMLElement, got: ${typeof child}`
                    );
                }
            } catch (error) {
                console.warn(
                    `[withComponents] Error creating child element at index ${index}:`,
                    error
                );
            }
        });

        if (!hasValidChildren) {
            console.warn('[withComponents] None of the child elements is a valid HTMLElement');
        }

        return parent;
    },
    
    // Модифицируем withComponents для поддержки асинхронных компонентов
    withComponentsAsync: (...children) => async (parent, ...args) => {
        if (!parent || !(parent instanceof HTMLElement)) {
            throw new TypeError(`Expected HTMLElement for parent`);
        }
        
        for (const childDef of children) {
            try {
                let child;
                
                if (Array.isArray(childDef)) {
                    const [fn, ...childArgs] = childDef;
                    child = await fn(...childArgs, ...args);
                } else {
                    child = await (typeof childDef === 'function' ? childDef(...args) : childDef);
                }
                
                if (child && child instanceof HTMLElement) {
                    parent.appendChild(child);
                }
            } catch (error) {
                console.warn('Error creating child:', error);
            }
        }
        
        return parent;
    },

    /**
     * Higher-order function that adds event handlers to a DOM element
     *
     * @param {EventHandlers} handlers - Object with event handlers, where keys are event names (with or without 'on' prefix)
     *
     * @returns {Function} Function that accepts a DOM element and returns the same element with attached event handlers
     *
     * @throws {TypeError} When element is not a Node
     * @throws {TypeError} When eventName is not a string
     * @throws {TypeError} When handler is not a function
     *
     * @example
     * // Adding click and hover handlers to button
     * const button = document.createElement('button');
     * const enhancedButton = withEventHandlers({
     *   onClick: (e) => console.log('Click!'),
     *   onMouseover: (e) => console.log('Cursor over button')
     * })(button);
     *
     * @example
     * // Usage with call chain
     * document.createElement('div')
     *   .appendChild(
     *     withEventHandlers({
     *       onClick: handleClick,
     *       onKeydown: handleKeyPress
     *     })(document.createElement('input'))
     *   );
     */
    withEventHandlers: (handlers) => (element) => {
        if (!(element instanceof Node)) {
            throw new TypeError(
                `[withEventHandlers] Invalid element passed. Expected Node, got: ${typeof element}`
            );
        }

        Object.entries(handlers).forEach(([eventName, handler]) => {
            if (typeof eventName !== 'string') {
                throw new TypeError(`[withEventHandlers:eventName] Expected string, got: ${typeof eventName}`);
            }

            // Check handler
            if (typeof handler !== 'function') {
                throw new TypeError(
                    `[withEventHandlers:handler] Handler for event ${eventName} must be a function. Got: ${typeof handler}`
                );
            }

            const event = eventName.replace(/^on/, '').toLowerCase();
            element.addEventListener(event, handler);
        });

        return element;
    },
    
    render: (target) => (element) => {
        // if (!(target instanceof s)) {
        //     throw new TypeError(
        //         `[render] Invalid target passed. Expected Node, got: ${typeof target}`
        //     );
        // }
        
        const targetEl = document.querySelector(target);
        
        if (!targetEl) {
            throw new Error("[render] Target element was not found");
        }
        
        targetEl.appendChild(element);
        
        return element;
    },

    /**
     * Higher-order function that executes an initialization callback for an element
     * @param {Function} callback - Initialization function that accepts an element and performs additional actions
     * @returns {Function} Function that accepts an element, calls the callback, and returns the element
     *
     * @throws {TypeError} When callback is not a function
     * @throws {Error} When callback throws an error
     *
     * @example
     * // Simple initialization
     * const withLogging = withInit((el) => {
     *   console.log('Element created:', el);
     * });
     *
     * const div = withLogging(document.createElement('div'));
     *
     * @example
     * // Setting complex attributes
     * const withDataAttributes = withInit((el) => {
     *   el.dataset.createdAt = new Date().toISOString();
     *   el.dataset.version = '1.0.0';
     * });
     *
     * @example
     * // Usage in call chain
     * const element = pipe(
     *   createElementFromSelector,
     *   withTextContent('Hello, world!'),
     *   withInit((el) => {
     *     el.style.backgroundColor = 'lightblue';
     *     el.style.padding = '10px';
     *   }),
     *   withEventHandlers({
     *     onClick: () => console.log('Click!')
     *   })
     * )('div.container');
     *
     * @example
     * // Initialization with logic
     * const withLazyLoading = withInit((img) => {
     *   img.loading = 'lazy';
     *   img.addEventListener('load', () => {
     *     console.log('Image loaded');
     *   });
     * });
     *
     * @example
     * // Generates errors
     * withInit(123)(document.createElement('div')); // TypeError - callback not a function
     * withInit(() => { throw new Error('Initialization error'); })(div); // Error
     */
    withInit: (callback) => (element) => {
        if (typeof callback !== 'function') {
            throw new TypeError(
                `[withInit] Expected function for callback, got: ${typeof callback}`
            );
        }

        if (!element || !(element instanceof Node)) {
            throw new TypeError(
                `[withInit] Expected Node for el, got: ${typeof element}`
            );
        }

        try {
            callback(element);
        } catch (error) {
            throw createErrorWithCause(
                `[withInit] Error executing callback: ${error.message}`,
                error
            );
        }

        return element;
    },

    /**
     * Higher-order function that executes a callback when the element is inserted into the DOM
     * Returns the element immediately, and the callback executes asynchronously after insertion
     *
     * @param {Function} callback - Function that will be called after the element is inserted into the DOM
     * @returns {Function} Function that accepts an element and returns it immediately, registering the callback for insertion
     *
     * @throws {TypeError} When callback is not a function
     * @throws {TypeError} When the passed element is not a Node
     *
     * @example
     * // Asynchronous initialization after insertion
     * const withLazyInit = withInserted((element) => {
     *   console.log('Element inserted into DOM, can initialize:', element);
     *   element.classList.add('animated');
     * });
     *
     * const div = withLazyInit(document.createElement('div'));
     * // Element returned immediately, callback executes later
     * document.body.appendChild(div); // Callback called
     *
     * @example
     * // Loading data only when element is in DOM
     * const withDataLoading = withInserted(async (element) => {
     *   const data = await fetchData();
     *   element.textContent = data.message;
     * });
     *
     * @example
     * // Usage in call chain
     * const lazyComponent = pipe(
     *   createElementFromSelector,
     *   withTextContent('Loading...'),
     *   withInserted((element) => {
     *     // This code executes only when component is in DOM
     *     loadHeavyLibrary(element);
     *     initializeComplexBehavior(element);
     *   }),
     *   withEventHandlers({
     *     onClick: () => console.log('Component clicked')
     *   })
     * )('div.lazy-component');
     *
     * @example
     * // Entrance animation
     * const withEntranceAnimation = withInserted((element) => {
     *   element.style.opacity = '0';
     *   element.style.transition = 'opacity 0.3s ease-in';
     *
     *   requestAnimationFrame(() => {
     *     element.style.opacity = '1';
     *   });
     * });
     *
     * @example
     * // Generates errors
     * withInserted(123)(document.createElement('div')); // TypeError
     * withInserted(() => {})({ not: 'element' }); // TypeError
     *
     * @see onInsert
     */
    withInserted: (callback) => (element) => {
        if (typeof callback !== 'function') {
            throw new TypeError(
                `[withInserted] Expected function for callback, got: ${typeof callback}`
            );
        }

        if (!element || !(element instanceof Node)) {
            throw new TypeError(
                `[withInserted] Expected Node for element, got: ${typeof element}`
            );
        }

        // Register callback for element insertion into DOM
        onInsert(element, () => {
            try {
                callback(element);
            } catch (error) {
                console.error('[withInserted] Error executing callback:', error);
            }
        });

        return element;
    },

    /**
     * Higher-order function that executes a callback when the element is removed from the DOM
     * Returns the element immediately, and the callback executes asynchronously after removal
     *
     * @param {Function} callback - Function that will be called after the element is removed from the DOM
     * @returns {Function} Function that accepts an element and returns it immediately, registering the callback for removal
     *
     * @throws {TypeError} When callback is not a function
     * @throws {TypeError} When the passed element is not a Node
     * @throws {Error} When MutationObserver creation error occurs
     *
     * @example
     * // Cleaning up resources when element is removed
     * const withCleanup = withRemoved((element) => {
     *   console.log('Element removed from DOM, cleaning up resources:', element);
     *   // Release timers, subscriptions, etc.
     * });
     *
     * const div = withCleanup(document.createElement('div'));
     * document.body.appendChild(div);
     * document.body.removeChild(div); // Callback called
     *
     * @example
     * // Unsubscribing from events on removal
     * const withEventCleanup = withRemoved((element) => {
     *   // Unsubscribe from global events
     *   window.removeEventListener('resize', element._resizeHandler);
     *   delete element._resizeHandler;
     * });
     *
     * @example
     * // Usage in call chain
     * const componentWithCleanup = pipe(
     *   createElementFromSelector('div.component'),
     *   withTextContent('Component with cleanup'),
     *   withInserted((element) => {
     *     // Initialization on insertion
     *     element._interval = setInterval(() => {
     *       console.log('Component active');
     *     }, 1000);
     *   }),
     *   withRemoved((element) => {
     *     // Cleanup on removal
     *     clearInterval(element._interval);
     *     console.log('Component removed, interval cleared');
     *   })
     * )();
     *
     * @example
     * // Logging element removal
     * const withRemovalLogging = withRemoved((element) => {
     *   console.log(`Element ${element.tagName} was removed from DOM`);
     *   // Can send analytics
     *   trackComponentRemoval(element);
     * });
     *
     * @example
     * // Generates errors
     * withRemoved(123)(document.createElement('div')); // TypeError
     * withRemoved(() => {})({ not: 'element' }); // TypeError
     */
    withRemoved: (callback) => (element) => {
        if (typeof callback !== 'function') {
            throw new TypeError(
                `[withRemoved] Expected function for callback, got: ${typeof callback}`
            );
        }

        if (!element || !(element instanceof Node)) {
            throw new TypeError(
                `[withRemoved] Expected Node for el, got: ${typeof element}`
            );
        }

        try {
            const observer = new MutationObserver(() => {
                if (!document.body.contains(element)) {
                    observer.disconnect();
                    try {
                        callback(element);
                    } catch (error) {
                        console.error('[withRemoved] Error executing callback:', error);
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } catch (error) {
            throw createErrorWithCause(
                `[withRemoved] Error creating MutationObserver: ${error.message}`,
                error
            );
        }

        return element;
    },
});

/**
 * Calls a callback when an element is inserted into the DOM
 *
 * @param {Node} element - Element to watch for insertion
 * @param {Function} callback - Function that will be called after the element is inserted into the DOM
 * @returns {void}
 *
 * @throws {TypeError} When element is not a Node
 * @throws {TypeError} When callback is not a function
 * @throws {Error} When DOM observation error occurs
 *
 * @example
 * // Tracking element insertion
 * const div = document.createElement('div');
 * onInsert(div, (element) => {
 *   console.log('Element inserted into DOM:', element);
 *   element.style.backgroundColor = 'green';
 * });
 *
 * // Later, when element is added to DOM
 * document.body.appendChild(div); // Callback called
 *
 * @example
 * // Component initialization after insertion
 * const modal = createElementFromSelector('div.modal');
 * onInsert(modal, (element) => {
 *   // Initialization only when element is in DOM
 *   element.classList.add('fade-in');
 *   initializeModalBehavior(element);
 * });
 *
 * @example
 * // Tracking dynamically created elements
 * const createLazyElement = () => {
 *   const el = document.createElement('div');
 *   el.textContent = 'Dynamic element';
 *
 *   onInsert(el, (element) => {
 *     console.log('Dynamic element added to DOM');
 *     loadComponentData(element);
 *   });
 *
 *   return el;
 * };
 *
 * @example
 * // Generates errors
 * onInsert('not-an-element', () => {}); // TypeError
 * onInsert(div, 'not-a-function'); // TypeError
 */
const onInsert = (element, callback) => {
    if (!element || !(element instanceof Node)) {
        throw new TypeError(
            `[onInsert] Expected Node for element, got: ${typeof element}`
        );
    }

    if (typeof callback !== 'function') {
        throw new TypeError(
            `[onInsert] Expected function for callback, got: ${typeof callback}`
        );
    }

    // If element is already in DOM, call callback immediately
    if (document.body.contains(element)) {
        try {
            callback(element);
        } catch (error) {
            console.error('[onInsert] Error executing callback for element already in DOM:', error);
        }
        return;
    }

    try {
        const observer = new MutationObserver(() => {
            if (document.body.contains(element)) {
                observer.disconnect();
                try {
                    callback(element);
                } catch (error) {
                    console.error('[onInsert] Error executing callback:', error);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } catch (error) {
        throw createErrorWithCause(
            `[onInsert] Error creating MutationObserver: ${error.message}`,
            error
        );
    }
};