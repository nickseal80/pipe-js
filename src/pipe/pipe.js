export const pipe = (...fns) => {
    const beforeHooks = [];
    const afterHooks = [];
    const errorHooks = [];
    const loadingHooks = [];

    const executor = async (input, ...args) => {
        let result = input;

        for (let index = 0; index < fns.length; index++) {
            const fn = fns[index];

            try {
                // before hooks
                for (const hook of beforeHooks) {
                    result = await hook(result, { fn, index, total: fns.length });
                }

                // Проверяем, является ли функция асинхронной
                const fnName = fn.name || `step_${index}`;

                // Если функция помечена как loading, вызываем loading hooks
                if (fn.__isLoading) {
                    for (const hook of loadingHooks) {
                        result = await hook(result, {
                            fn,
                            index,
                            total: fns.length,
                            isLoading: true
                        });
                    }
                }

                // main function
                const fnResult = fn(result, ...args);

                // Обрабатываем как Promise, если это асинхронная функция
                result = fnResult instanceof Promise ? await fnResult : fnResult;

                // after hooks
                for (const hook of afterHooks) {
                    result = await hook(result, { fn, index, total: fns.length });
                }

            } catch (error) {
                // error hooks
                if (errorHooks.length > 0) {
                    for (const hook of errorHooks) {
                        const handled = await hook(error, { fn, index, total: fns.length, input: result });
                        if (handled !== undefined) {
                            result = handled;
                            break;
                        }
                    }
                } else {
                    throw error;
                }
            }
        }

        return result;
    };

    // Добавляем методы для middleware
    executor.before = (fn) => {
        beforeHooks.push(fn);
        return executor;
    };

    executor.after = (fn) => {
        afterHooks.push(fn);
        return executor;
    };

    executor.error = (fn) => {
        errorHooks.push(fn);
        return executor;
    };

    executor.loading = (fn) => {
        loadingHooks.push(fn);
        return executor;
    };

    // Добавляем утилиты для работы с асинхронностью
    executor.async = true;

    return executor;
};

/**
 * Создает функцию загрузки
 */
export const loadFrom = (url, options = {}) => {
    const loadFn = async (input) => {
        console.log(`Загрузка данных из: ${url}`);

        // Если есть входные параметры, можно их использовать
        const requestUrl = typeof url === 'function' ? url(input) : url;

        try {
            const response = await fetch(requestUrl, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Определяем тип данных
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            throw error;
        }
    };

    loadFn.__isLoading = true;
    loadFn.displayName = `loadFrom(${url})`;

    return loadFn;
};

/**
 * Middleware для отображения состояния загрузки
 */
export const whenLoading = (loadingHandler) => {
    const loadingFn = (input, context) => {
        if (context.isLoading) {
            console.log('Показываем индикатор загрузки...');
            return loadingHandler(input, context);
        }
        return input;
    };

    return loadingFn;
};

/**
 * Middleware для обработки загруженных данных
 */
export const whenLoaded = (successHandler) => {
    const loadedFn = (input, context) => {
        console.log('Данные загружены, скрываем индикатор...');
        return successHandler ? successHandler(input, context) : input;
    };

    return loadedFn;
};

/**
 * Создает асинхронную функцию с задержкой (для тестирования)
 */
export const delayed = (fn, delay = 1000) => {
    const delayedFn = async (...args) => {
        console.log(`Задержка ${delay}мс...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fn(...args);
    };

    delayedFn.__isLoading = true;
    delayedFn.displayName = `delayed(${fn.name || 'anonymous'})`;

    return delayedFn;
};

/**
 * Обработчик ошибок загрузки
 */
export const whenError = (errorHandler) => {
    return (error, context) => {
        console.log('Обработка ошибки загрузки...');
        return errorHandler(error, context);
    };
};

/**
 * Создает функцию для отображения индикатора загрузки
 */
export const showLoader = (loaderElement) => {
    return (input, context) => {
        if (context.isLoading && loaderElement) {
            loaderElement.style.display = 'block';
            console.log('Индикатор загрузки показан');
        }
        return input;
    };
};

/**
 * Создает функцию для скрытия индикатора загрузки
 */
export const hideLoader = (loaderElement) => {
    return (input, context) => {
        if (loaderElement) {
            loaderElement.style.display = 'none';
            console.log('Индикатор загрузки скрыт');
        }
        return input;
    };
};