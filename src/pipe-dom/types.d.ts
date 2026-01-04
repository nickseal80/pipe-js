// types.d.ts

// Типы для DOM библиотеки
declare namespace DOM {
    interface Selector {
        tag: string | null;
        id?: string | null;
        classes?: string[];
        attributes?: Array<Object>;
    }

    type StringType = 'selector' | 'html';

    const CSS_SELECTOR_STR: StringType;
    const HTML_ELEMENT_STR: StringType;

    interface PipeDomLibrary {
        /**
         * Определяет тип строки: HTML-элемент или CSS-селектор
         */
    }
}

export interface EventHandlers {
    onClick?: (event: MouseEvent) => void,
    onDoubleClick?: (event: MouseEvent) => void,
    onMouseDown?: (event: MouseEvent) => void,
    onMouseUp?: (event: MouseEvent) => void,
    onMouseMove?: (event: MouseEvent) => void,
    onKeyDown?: (event: KeyboardEvent) => void,
    onKeyUp?: (event: KeyboardEvent) => void,
    onFocus?: (event: FocusEvent) => void,
    onBlur?: (event: FocusEvent) => void,
    onChange?: (event: Event) => void,
    onInput?: (event: Event) => void,
    onSubmit?: (event: Event) => void,
}

// Если вы хотите объявить глобально
declare const pipeDom: DOM.PipeDomLibrary;