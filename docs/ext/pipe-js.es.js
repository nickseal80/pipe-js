const b = (...r) => {
  const e = [], t = [], c = [], o = (i, ...s) => {
    let n = i;
    for (let a = 0; a < r.length; a++) {
      const h = r[a], f = { fn: h, index: a, total: r.length };
      try {
        for (const l of e)
          n = l(n, f);
        n = h(n, ...s);
        for (const l of t)
          n = l(n, f);
      } catch (l) {
        if (c.length > 0) {
          const y = { ...f, input: n };
          let E = !1;
          for (const u of c) {
            const w = u(l, y);
            if (w !== void 0) {
              n = w, E = !0;
              break;
            }
          }
          if (!E)
            throw l;
        } else
          throw l;
      }
    }
    return n;
  };
  return o.before = (i) => {
    if (typeof i != "function")
      throw new TypeError("before hook must be a function");
    return e.push(i), o;
  }, o.after = (i) => {
    if (typeof i != "function")
      throw new TypeError("after hook must be a function");
    return t.push(i), o;
  }, o.error = (i) => {
    if (typeof i != "function")
      throw new TypeError("error handler must be a function");
    return c.push(i), o;
  }, o.async = !1, o;
}, g = (r, e) => {
  const t = { _namespace: r }, c = (i, s) => (...n) => {
    const a = o();
    return s.call(a, ...n);
  }, o = () => {
    const i = { _namespace: r };
    return Object.entries(e).forEach(([s, n]) => {
      i[s] = c(s, n);
    }), i;
  };
  return Object.entries(e).forEach(([i, s]) => {
    const n = (...a) => {
      const h = o();
      return s.call(h, ...a);
    };
    n.direct = n, n.static = (...a) => s(null, ...a), t[i] = n;
  }), t;
}, p = (r, e) => {
  let t;
  return t = new Error(r), e && (t.cause = e, t.originalError = e, e.stack && (t.stack += `
Caused by: ${e.stack}`)), t;
}, m = "http://www.w3.org/1999/xhtml", d = {
  CSS_SELECTOR_STR: "selector",
  HTML_ELEMENT_STR: "html"
}, S = g("DOM", {
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
  detectStringType: (r) => {
    if (typeof r != "string")
      throw new TypeError(
        `[detectStringType] Expected string, got: ${typeof r}`
      );
    const e = r.trim();
    if (e.length === 0)
      throw new Error("[detectStringType] Empty string passed");
    if (e.startsWith("<"))
      try {
        const t = new DOMParser().parseFromString(e, "text/html");
        if (t.querySelectorAll("parsererror").length > 0)
          return console.warn("[detectStringType] HTML parsing error, treating as selector"), d.CSS_SELECTOR_STR;
        const o = t.body.firstElementChild;
        if (o && o.tagName)
          return d.HTML_ELEMENT_STR;
      } catch (t) {
        return console.warn("[detectStringType] Error parsing HTML:", t), d.CSS_SELECTOR_STR;
      }
    return d.CSS_SELECTOR_STR;
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
  parseCssSelector(r) {
    if (typeof r != "string")
      throw new TypeError(
        `[parseCssSelector] Expected string, got: ${typeof r}`
      );
    const e = r.trim();
    if (e.length === 0)
      throw new Error("[parseCssSelector] Empty string passed");
    try {
      const t = e.match(/^[a-zA-Z][\w-]*/), c = e.match(/#([\w-]+)/), o = [...e.matchAll(/\.([\w-]+)/g)], i = [...e.matchAll(/\[([\w-]+)(?:=(["']?)(.*?)\2)?]/g)], s = t?.[0] ?? null, n = c?.[1] ?? null, a = o.map((f) => f[1]), h = i.map((f) => ({
        name: f[1],
        value: f[3] ?? null
      }));
      return { tag: s, id: n, classes: a, attributes: h };
    } catch (t) {
      throw p(
        `[parseCssSelector] Error parsing selector "${r}": ${t.message}`,
        t
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
  createElementFromSelectorData(r) {
    if (!r || typeof r != "object")
      throw new TypeError(
        `[createElementFromData] Expected object of type Selector, got: ${typeof r}`
      );
    const { tag: e, id: t, classes: c = [], attributes: o = [] } = r;
    if (!e || typeof e != "string")
      throw new Error(
        `[createElementFromData] Invalid tag: ${e}`
      );
    try {
      const i = document.createElementNS(m, e);
      return t && (typeof t != "string" ? console.warn(`[createElementFromData] ID must be a string, got: ${typeof t}`) : i.id = t), Array.isArray(c) && c.forEach((s) => {
        typeof s == "string" ? i.classList.add(s) : console.warn(`[createElementFromData] Skipped invalid class: ${s}`);
      }), Array.isArray(o) && o.forEach(({ name: s, value: n }) => {
        if (s && typeof s == "string")
          try {
            i.setAttribute(s, n || "");
          } catch (a) {
            console.warn(`[createElementFromData] Error setting attribute ${s}:`, a);
          }
      }), i;
    } catch (i) {
      throw p(
        `[createElementFromData] Error creating element <${e}>: ${i.message}`,
        i
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
  createElementFromSelector(r) {
    if (typeof r != "string")
      throw new TypeError(
        `[createElementFromSelector] Expected string, got: ${typeof r}`
      );
    try {
      const e = this.parseCssSelector(r);
      return this.createElementFromSelectorData(e);
    } catch (e) {
      throw p(
        `[createElementFromSelector] Error creating element from selector "${r}": ${e.message}`,
        e
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
  withTextContent: (r) => (e) => {
    if (typeof r != "string")
      throw new TypeError(
        `[withTextContent] Expected string, got: ${typeof r}`
      );
    return e.textContent = r, e;
  },
  withAttributes: (...r) => (e) => (r.forEach((t) => {
    const c = Object.keys(t)[0];
    e.setAttribute(c, t[c]);
  }), e),
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
  withElements: (...r) => (e) => {
    if (!e)
      throw new TypeError(
        "[withElements] Parent is required"
      );
    const t = typeof e == "function" ? e() : e;
    if (!(t instanceof Node))
      throw new TypeError(
        `[withElements] Expected Node or function returning Node, got: ${typeof t} (${t?.constructor?.name})`
      );
    let c = t;
    t instanceof HTMLTemplateElement ? c = t.content : t instanceof DocumentFragment && (c = t);
    let o = !1;
    return r.forEach((i, s) => {
      try {
        const n = typeof i == "function" ? i() : i;
        if (n && n instanceof Node)
          c.appendChild(n), o = !0;
        else if (n != null) {
          const a = document.createTextNode(String(n));
          c.appendChild(a), o = !0;
        }
      } catch (n) {
        console.warn(
          `[withElements] Error processing child element at index ${s}:`,
          n
        );
      }
    }), o || console.warn(
      "[withElements] None of the child elements is a valid Node or convertible to text"
    ), t;
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
  withComponents: (...r) => (e, ...t) => {
    if (!e || !(e instanceof HTMLElement))
      throw new TypeError(
        `[withComponents] Expected HTMLElement for parent, got: ${typeof e}`
      );
    let c = !1;
    return r.forEach((o, i) => {
      try {
        let s;
        if (Array.isArray(o)) {
          const [n, ...a] = o;
          if (n == null) {
            console.warn(`[withComponents] Skipped empty element in array at index ${i}`);
            return;
          }
          typeof n != "function" ? s = n : s = n(...a, ...t);
        } else
          s = typeof o == "function" ? o(...t) : o;
        s && s instanceof HTMLElement ? (e.appendChild(s), c = !0) : s != null && console.warn(
          `[withComponents] Skipped invalid child element at index ${i}. Expected HTMLElement, got: ${typeof s}`
        );
      } catch (s) {
        console.warn(
          `[withComponents] Error creating child element at index ${i}:`,
          s
        );
      }
    }), c || console.warn("[withComponents] None of the child elements is a valid HTMLElement"), e;
  },
  // Модифицируем withComponents для поддержки асинхронных компонентов
  withComponentsAsync: (...r) => async (e, ...t) => {
    if (!e || !(e instanceof HTMLElement))
      throw new TypeError("Expected HTMLElement for parent");
    for (const c of r)
      try {
        let o;
        if (Array.isArray(c)) {
          const [i, ...s] = c;
          o = await i(...s, ...t);
        } else
          o = await (typeof c == "function" ? c(...t) : c);
        o && o instanceof HTMLElement && e.appendChild(o);
      } catch (o) {
        console.warn("Error creating child:", o);
      }
    return e;
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
  withEventHandlers: (r) => (e) => {
    if (!(e instanceof Node))
      throw new TypeError(
        `[withEventHandlers] Invalid element passed. Expected Node, got: ${typeof e}`
      );
    return Object.entries(r).forEach(([t, c]) => {
      if (typeof t != "string")
        throw new TypeError(`[withEventHandlers:eventName] Expected string, got: ${typeof t}`);
      if (typeof c != "function")
        throw new TypeError(
          `[withEventHandlers:handler] Handler for event ${t} must be a function. Got: ${typeof c}`
        );
      const o = t.replace(/^on/, "").toLowerCase();
      e.addEventListener(o, c);
    }), e;
  },
  render: (r) => (e) => {
    const t = document.querySelector(r);
    if (!t)
      throw new Error("[render] Target element was not found");
    return t.appendChild(e), e;
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
  withInit: (r) => (e) => {
    if (typeof r != "function")
      throw new TypeError(
        `[withInit] Expected function for callback, got: ${typeof r}`
      );
    if (!e || !(e instanceof Node))
      throw new TypeError(
        `[withInit] Expected Node for el, got: ${typeof e}`
      );
    try {
      r(e);
    } catch (t) {
      throw p(
        `[withInit] Error executing callback: ${t.message}`,
        t
      );
    }
    return e;
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
  withInserted: (r) => (e) => {
    if (typeof r != "function")
      throw new TypeError(
        `[withInserted] Expected function for callback, got: ${typeof r}`
      );
    if (!e || !(e instanceof Node))
      throw new TypeError(
        `[withInserted] Expected Node for element, got: ${typeof e}`
      );
    return T(e, () => {
      try {
        r(e);
      } catch (t) {
        console.error("[withInserted] Error executing callback:", t);
      }
    }), e;
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
  withRemoved: (r) => (e) => {
    if (typeof r != "function")
      throw new TypeError(
        `[withRemoved] Expected function for callback, got: ${typeof r}`
      );
    if (!e || !(e instanceof Node))
      throw new TypeError(
        `[withRemoved] Expected Node for el, got: ${typeof e}`
      );
    try {
      const t = new MutationObserver(() => {
        if (!document.body.contains(e)) {
          t.disconnect();
          try {
            r(e);
          } catch (c) {
            console.error("[withRemoved] Error executing callback:", c);
          }
        }
      });
      t.observe(document.body, {
        childList: !0,
        subtree: !0
      });
    } catch (t) {
      throw p(
        `[withRemoved] Error creating MutationObserver: ${t.message}`,
        t
      );
    }
    return e;
  }
}), T = (r, e) => {
  if (!r || !(r instanceof Node))
    throw new TypeError(
      `[onInsert] Expected Node for element, got: ${typeof r}`
    );
  if (typeof e != "function")
    throw new TypeError(
      `[onInsert] Expected function for callback, got: ${typeof e}`
    );
  if (document.body.contains(r)) {
    try {
      e(r);
    } catch (t) {
      console.error("[onInsert] Error executing callback for element already in DOM:", t);
    }
    return;
  }
  try {
    const t = new MutationObserver(() => {
      if (document.body.contains(r)) {
        t.disconnect();
        try {
          e(r);
        } catch (c) {
          console.error("[onInsert] Error executing callback:", c);
        }
      }
    });
    t.observe(document.body, {
      childList: !0,
      subtree: !0
    });
  } catch (t) {
    throw p(
      `[onInsert] Error creating MutationObserver: ${t.message}`,
      t
    );
  }
};
export {
  b as pipe,
  S as pipeDom
};
