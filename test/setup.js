// Глобальные моки для браузерных API
globalThis.window = globalThis;
globalThis.document = {
    createElement: () => ({})
};
// Добавьте другие браузерные API по мере необходимости