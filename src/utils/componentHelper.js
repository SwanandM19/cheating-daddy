// Helper utility for creating web components without Lit

export function createStyle(cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    return style;
}

export function setElementProperties(element, properties) {
    for (const [key, value] of Object.entries(properties)) {
        if (key.startsWith('on') && typeof value === 'function') {
            // Handle event handlers
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            // Set property directly
            element[key] = value;
        }
    }
}

export function html(strings, ...values) {
    let htmlString = '';
    for (let i = 0; i < strings.length; i++) {
        htmlString += strings[i];
        if (i < values.length) {
            const value = values[i];
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    htmlString += value.join('');
                } else if (typeof value === 'object' && value.outerHTML) {
                    htmlString += value.outerHTML;
                } else {
                    htmlString += String(value);
                }
            }
        }
    }
    return htmlString;
}

export function css(strings, ...values) {
    return strings.reduce((result, str, i) => {
        return result + str + (values[i] || '');
    }, '');
}

