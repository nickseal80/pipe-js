export const createLibrary = (namespace, methods) => {
    const library = {};

    // Создаем обернутые методы
    for (const [name, fn] of Object.entries(methods)) {
        library[name] = (...args) => {
            return (input, ...pipeArgs) => {
                // Сохраняем контекст
                const context = {
                    namespace,
                    method: name,
                    library
                };

                // Вызываем с контекстом
                return fn.call(context, input, ...args, ...pipeArgs);
            };
        };

        // Статический вызов
        library[name].static = (...args) => fn(null, ...args);
    }

    // Метод для использования библиотеки
    library.use = () => (input) => {
        // Можно добавить логику установки неймспейса
        return input;
    };

    library.namespace = namespace;

    return library;
};

// Глобальный реестр библиотек
const libraries = new Map();

/**
 * Регистрация библиотеки
 */
export const registerLibrary = (namespace, methods) => {
    if (libraries.has(namespace)) {
        throw new Error(`Library "${namespace}" already exists`);
    }

    const lib = createLibrary(namespace, methods);
    libraries.set(namespace, lib);
    return lib;
};

/**
 * Получение библиотеки
 */
export const getLibrary = (namespace) => {
    return libraries.get(namespace);
};