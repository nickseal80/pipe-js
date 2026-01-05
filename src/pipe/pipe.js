/**
 * Pipeline utility for composing functions with hooks
 * @module pipeline
 */

/**
 * Синхронный пайплайн для композиции функций
 *
 * @example
 * const process = pipe(
 *   x => x * 2,
 *   x => x + 1
 * );
 * console.log(process(5)); // 11
 *
 * @param {...Function} fns - Functions to execute in pipeline
 * @returns {Function} The pipeline executor.
 */
export const pipe = (...fns) => {
    const beforeHooks = [];
    const afterHooks = [];
    const errorHooks = [];
    
    const executor = (input, ...args) => {
        let result = input;
        
        for (let index = 0; index < fns.length; index++) {
            const fn = fns[index];
            const baseContext = { fn, index, total: fns.length };
            
            try {
                // before hooks
                for (const hook of beforeHooks) {
                    result = hook(result, baseContext);
                }
                
                // main function
                result = fn(result, ...args);
                
                // after hooks
                for (const hook of afterHooks) {
                    result = hook(result, baseContext);
                }
                
            } catch (error) {
                // error hooks
                if (errorHooks.length > 0) {
                    const errorContext = { ...baseContext, input: result };
                    let errorHandled = false;
                    
                    for (const hook of errorHooks) {
                        const handled = hook(error, errorContext);
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
     */
    executor.error = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('error handler must be a function');
        }
        errorHooks.push(fn);
        return executor;
    };
    
    executor.async = false;
    
    return executor;
};

/**
 * Асинхронный пайплайн для композиции функций с поддержкой загрузки
 *
 * @example
 * const process = pipeAsync(
 *   loadFrom('/api/data'),
 *   data => transform(data)
 * );
 * const result = await process();
 *
 * @param {...Function} fns - Functions to execute in pipeline
 * @returns {Function} Async pipeline executor.
 */
export const pipeAsync = (...fns) => {
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
                    const hookResult = hook(result, baseContext);
                    result = hookResult instanceof Promise ? await hookResult : hookResult;
                }
                
                // loading hooks
                if (fn.__isLoading) {
                    const loadingContext = { ...baseContext, isLoading: true };
                    for (const hook of loadingHooks) {
                        const hookResult = hook(result, loadingContext);
                        result = hookResult instanceof Promise ? await hookResult : hookResult;
                    }
                }
                
                // main function
                const fnResult = fn(result, ...args);
                result = fnResult instanceof Promise ? await fnResult : fnResult;
                
                // after hooks
                for (const hook of afterHooks) {
                    const hookResult = hook(result, baseContext);
                    result = hookResult instanceof Promise ? await hookResult : hookResult;
                }
                
            } catch (error) {
                // error hooks
                if (errorHooks.length > 0) {
                    const errorContext = { ...baseContext, input: result };
                    let errorHandled = false;
                    
                    for (const hook of errorHooks) {
                        const handled = hook(error, errorContext);
                        if (handled !== undefined) {
                            result = handled instanceof Promise ? await handled : handled;
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
    
    executor.before = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('before hook must be a function');
        }
        beforeHooks.push(fn);
        return executor;
    };
    
    executor.after = (fn) => {
        if (typeof fn !== 'function') {
            throw new TypeError('after hook must be a function');
        }
        afterHooks.push(fn);
        return executor;
    };
    
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
 * Wraps a function to add artificial delay (for testing/debugging).
 * Marks itself as a loading operation.
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
 * Creates a middleware that activates during loading operations.
 * Для использования с pipeAsync
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
 * Для использования с pipeAsync
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
 * Creates an error handling middleware for loading operations.
 * Для использования с pipeAsync
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
 * Для использования с pipeAsync
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
 * Для использования с pipeAsync
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

/**
 * Утилита для преобразования синхронного пайплайна в асинхронный
 *
 * @example
 * const syncPipe = pipe(x => x * 2, x => x + 1);
 * const asyncPipe = toAsync(syncPipe);
 * const result = await asyncPipe(5); // 11
 */
export const toAsync = (syncPipeline) => {
    return async (...args) => {
        return syncPipeline(...args);
    };
};

/**
 * Утилита для преобразования асинхронного пайплайна в синхронный
 * (будет выбрасывать ошибку если встретит Promise)
 *
 * @example
 * const asyncPipe = pipeAsync(loadFrom('/api/data'));
 * const syncPipe = toSync(asyncPipe);
 * // Будет ошибка если loadFrom вернет Promise
 */
export const toSync = (asyncPipeline) => {
    return (...args) => {
        const result = asyncPipeline(...args);
        if (result instanceof Promise) {
            throw new Error('Pipeline returned a Promise. Use async version or await it.');
        }
        return result;
    };
};