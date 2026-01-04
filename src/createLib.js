export const createLibrary = (namespace, methods) => {
    const library = { _namespace: namespace };
    
    // Создаем кешированные версии методов для контекста
    const createMethodForContext = (methodName, methodFn) => {
        return (...args) => {
            const context = createContext();
            return methodFn.call(context, ...args);
        };
    };
    
    // Функция для создания контекста с методами
    const createContext = () => {
        const context = { _namespace: namespace };
        
        // Добавляем все методы в контекст
        Object.entries(methods).forEach(([methodName, methodFn]) => {
            context[methodName] = createMethodForContext(methodName, methodFn);
        });
        
        return context;
    };
    
    // Создаем публичные методы
    Object.entries(methods).forEach(([name, fn]) => {
        // Публичный метод для прямого вызова
        const publicMethod = (...args) => {
            const context = createContext();
            return fn.call(context, ...args);
        };
        
        // Добавляем вспомогательные методы
        publicMethod.direct = publicMethod;
        publicMethod.static = (...args) => fn(null, ...args);
        
        library[name] = publicMethod;
    });
    
    return library;
};