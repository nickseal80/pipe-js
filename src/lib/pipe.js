export const pipe = (...fns) => {
    const beforeHooks = [];
    const afterHooks = [];
    const errorHooks = [];

    const executor = (input, ...args) => {
        return fns.reduce((acc, fn, index) => {
            try {
                // before hooks
                let current = acc;
                for (const hook of beforeHooks) {
                    current = hook(current, { fn, index, total: fns.length });
                }

                // main function
                const result = fn(current, ...args);

                // after hooks
                let finalResult = result;
                for (const hook of afterHooks) {
                    finalResult = hook(finalResult, { fn, index, total: fns.length });
                }

                return finalResult;
            } catch (error) {
                // error hooks
                for (const hook of errorHooks) {
                    const handled = hook(error, { fn, index, total: fns.length });
                    if (handled !== undefined) {
                        return handled;
                    }
                }
                throw error;
            }
        }, input);
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

    return executor;
};