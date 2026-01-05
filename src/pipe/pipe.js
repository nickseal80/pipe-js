/**
 * Pipeline utility for composing functions with hooks
 * @module pipeline
 */

/**
 * Attaches a hook that executes before each function in the pipeline.
 *
 * @example
 * pipeline.before((data, {fn, index}) => {
 *   console.log(`Before ${fn.name || 'anonymous'} [${index}]`);
 *   return data;
 * });
 *
 * @param {...Function} fns - Functions to execute in pipeline
 * @returns {Object} The pipeline executor for chaining.
 */
export const pipe = (...fns) => {
    const beforeHooks = [];
    const afterHooks = [];
    const errorHooks = [];
    const loadingHooks = [];
    
    const executor = async (input, ...args) => {
        let result = input;
        
        for (let index = 0; index < fns.length; index++) {
            const fn = fns[index];
            const baseContext = { fn, index, total: fns.length };
            
            try {
                // before hooks
                for (const hook of beforeHooks) {
                    result = await hook(result, baseContext);
                }
                
                // loading hooks
                if (fn.__isLoading) {
                    const loadingContext = { ...baseContext, isLoading: true };
                    for (const hook of loadingHooks) {
                        result = await hook(result, loadingContext);
                    }
                }
                
                // main function
                const fnResult = fn(result, ...args);
                result = fnResult instanceof Promise ? await fnResult : fnResult;
                
                // after hooks
                for (const hook of afterHooks) {
                    result = await hook(result, baseContext);
                }
                
            } catch (error) {
                // error hooks
                if (errorHooks.length > 0) {
                    const errorContext = { ...baseContext, input: result };
                    let errorHandled = false;
                    
                    for (const hook of errorHooks) {
                        const handled = await hook(error, errorContext);
                        if (handled !== undefined) {
                            result = handled;
                            errorHandled = true;
                            break;
                        }
                    }
                    
                    if (!errorHandled) {
                        throw error;
                    }
                } else {
                    throw error;
                }
            }
        }
        
        return result;
    };
    
    /**
     * Attaches a hook that executes before each function in the pipeline.
     *
     * @example
     * pipeline.before((data, {fn, index}) => {
     *   console.log(`Before ${fn.name || 'anonymous'} [${index}]`);
     *   return data;
     * });
     *
     * @param {Function} fn - Hook function to execute.
     *                         Receives: (currentData, {fn, index, total})
     *                         Must return: modified data or same data.
     * @returns {Object} The pipeline executor for chaining.
     */
    executor.before = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('before hook must be a function');
        }
        beforeHooks.push(fn);
        return executor;
    };
    
    /**
     * Attaches a hook that executes after each function in the pipeline.
     *
     * @example
     * pipeline.after((result, {fn, index}) => {
     *   console.log(`After ${fn.name}: ${result}`);
     *   return result;
     * });
     *
     * @param {Function} fn - Hook function to execute.
     *                         Receives: (result, {fn, index, total})
     *                         Must return: modified result or same result.
     * @returns {Object} The pipeline executor for chaining.
     */
    executor.after = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('after hook must be a function');
        }
        afterHooks.push(fn);
        return executor;
    };
    
    /**
     * Attaches an error handler for the entire pipeline.
     * If multiple error handlers are attached, they execute in order until one returns a value.
     *
     * @example
     * pipeline.error((error, {fn, index}) => {
     *   if (error instanceof NetworkError) {
     *     console.log('Network error, retrying...');
     *     return fallbackData; // Recover from error
     *   }
     *   // Return undefined to let next handler try
     * });
     *
     * @param {Function} fn - Error handler function.
     *                         Receives: (error, {fn, index, total, input})
     *                         Returns: recovered value or undefined.
     * @returns {Object} The pipeline executor for chaining.
     */
    executor.error = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('error handler must be a function');
        }
        errorHooks.push(fn);
        return executor;
    };
    
    /**
     * Attaches a loading state handler for async operations.
     * Only triggers for functions marked with `__isLoading = true`.
     *
     * @example
     * pipeline.loading((data, {fn, isLoading}) => {
     *   showSpinner();
     *   return data;
     * });
     *
     * @param {Function} fn - Loading handler function.
     *                         Receives: (data, {fn, index, total, isLoading})
     *                         Returns: modified data or same data.
     * @returns {Object} The pipeline executor for chaining.
     */
    executor.loading = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('loading hook must be a function');
        }
        loadingHooks.push(fn);
        return executor;
    };
    
    executor.async = true;
    
    return executor;
};

/**
 * Creates a data loading function that fetches from a URL.
 * Automatically marks itself as a loading operation (`__isLoading = true`).
 *
 * @example
 * const loadUser = loadFrom('/api/users/123');
 * const loadDynamic = loadFrom((id) => `/api/users/${id}`);
 *
 * // With options
 * const loadWithAuth = loadFrom('/api/data', {
 *   headers: { Authorization: 'Bearer token' }
 * });
 *
 * @param {string|Function} url - URL to fetch from. Can be a string or function
 *                                that receives pipeline input and returns URL.
 * @param {Object} [options={}] - Fetch API options (method, headers, body, etc.)
 * @returns {Function} Async loading function with `__isLoading` flag.
 *
 * @throws {Error} HTTP errors (non-2xx responses) or network errors.
 *
 * @property {boolean} __isLoading - Always true, identifies loading operations.
 * @property {string} displayName - Debug name for the function.
 */
export const loadFrom = (url, options = {}) => {
    const loadFn = async (input) => {
        console.log(`Загрузка данных из: ${url}`);
        
        const requestUrl = typeof url === 'function' ? url(input) : url;
        
        try {
            const response = await fetch(requestUrl, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            throw error;
        }
    };
    
    loadFn.__isLoading = true;
    loadFn.displayName = `loadFrom(${typeof url === 'function' ? 'dynamic' : url})`;
    
    return loadFn;
};

/**
 * Creates a middleware that activates during loading operations.
 *
 * @example
 * const showLoading = whenLoading((data, {isLoading}) => {
 *   console.log('Показываем индикатор загрузки...');
 *   return data;
 * });
 *
 * @param {Function} loadingHandler - Function to execute during loading.
 *                                    Receives: (data, context)
 *                                    Returns: modified data or same data.
 * @returns {Function} Middleware function.
 */
export const whenLoading = (loadingHandler) => {
    if (typeof loadingHandler !== 'function') {
        throw new TypeError('loadingHandler must be a function');
    }
    
    return (input, context = {}) => {
        if (context.isLoading) {
            console.log('Показываем индикатор загрузки...');
            return loadingHandler(input, context);
        }
        return input;
    };
};

/**
 * Creates a middleware that executes after loading completes.
 * Useful for hiding loading indicators or processing loaded data.
 *
 * @example
 * const hideSpinner = whenLoaded((data) => {
 *   document.getElementById('spinner').style.display = 'none';
 *   return data;
 * });
 *
 * @param {Function} [successHandler] - Optional function to process loaded data.
 *                                       If omitted, returns data unchanged.
 * @returns {Function} Middleware function.
 */
export const whenLoaded = (successHandler) => {
    const handler = typeof successHandler === 'function'
        ? successHandler
        : (input) => input;
    
    return (input, context = {}) => {
        console.log('Данные загружены, скрываем индикатор...');
        return handler(input, context);
    };
};

/**
 * Wraps a function to add artificial delay (for testing/debugging).
 * Marks itself as a loading operation.
 *
 * @example
 * const slowProcess = delayed(processData, 2000); // 2 second delay
 *
 * @param {Function} fn - Function to wrap with delay.
 * @param {number} [delay=1000] - Delay in milliseconds.
 * @returns {Function} Async function with added delay.
 *
 * @property {boolean} __isLoading - Always true.
 * @property {string} displayName - Debug name based on wrapped function.
 */
export const delayed = (fn, delay = 1000) => {
    if (typeof fn !== 'function') {
        throw new TypeError('fn must be a function');
    }
    
    const delayedFn = async (input, ...args) => {
        console.log(`Задержка ${delay}мс...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fn(input, ...args);
    };
    
    delayedFn.__isLoading = true;
    delayedFn.displayName = `delayed(${fn.name || 'anonymous'})`;
    
    return delayedFn;
};

/**
 * Creates an error handling middleware for loading operations.
 *
 * @example
 * const handleNetworkError = whenError((error, {fn}) => {
 *   if (error.name === 'NetworkError') {
 *     showToast('Network error, please check connection');
 *     return cachedData;
 *   }
 * });
 *
 * @param {Function} errorHandler - Error handler function.
 *                                   Receives: (error, context)
 *                                   Returns: recovery value or undefined.
 * @returns {Function} Error middleware function.
 */
export const whenError = (errorHandler) => {
    if (typeof errorHandler !== 'function') {
        throw new TypeError('errorHandler must be a function');
    }
    
    return (error, context = {}) => {
        console.log('Обработка ошибки загрузки...');
        return errorHandler(error, context);
    };
};

/**
 * Creates a middleware that shows a loading indicator element.
 * Only activates during loading operations.
 *
 * @example
 * const spinner = document.getElementById('spinner');
 * const showSpinner = showLoader(spinner);
 *
 * // Use in pipeline
 * pipeline.loading(showSpinner);
 *
 * @param {HTMLElement} loaderElement - DOM element to show as loader.
 * @returns {Function} Middleware function that shows the element.
 */
export const showLoader = (loaderElement) => {
    if (loaderElement && typeof loaderElement.style === 'undefined') {
        console.warn('showLoader: element has no style property');
    }
    
    return (input, context = {}) => {
        if (context.isLoading && loaderElement) {
            loaderElement.style.display = 'block';
            console.log('Индикатор загрузки показан');
        }
        return input;
    };
};

/**
 * Creates a middleware that hides a loading indicator element.
 *
 * @example
 * const spinner = document.getElementById('spinner');
 * const hideSpinner = hideLoader(spinner);
 *
 * // Use in pipeline
 * pipeline.after(hideSpinner);
 *
 * @param {HTMLElement} loaderElement - DOM element to hide.
 * @returns {Function} Middleware function that hides the element.
 */
export const hideLoader = (loaderElement) => {
    if (loaderElement && typeof loaderElement.style === 'undefined') {
        console.warn('hideLoader: element has no style property');
    }
    
    return (input, context = {}) => {
        if (loaderElement) {
            loaderElement.style.display = 'none';
            console.log('Индикатор загрузки скрыт');
        }
        return input;
    };
};