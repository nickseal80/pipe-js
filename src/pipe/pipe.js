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
