import { resizeLayout } from '../../utils/windowResize.js';

export class MainView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.onStart = () => {};
        this.onAPIKeyHelp = () => {};
        this.isInitializing = false;
        this.onLayoutModeChange = () => {};
        this.showApiKeyError = false;
        this.boundKeydownHandler = this.handleKeydown.bind(this);
    }

    static get styles() {
        return `
        * {
            font-family: 'Space Grotesk', sans-serif;
            cursor: var(--custom-cursor);
            user-select: none;
        }

        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 500px;
        }

        .welcome {
            font-size: 28px;
            margin-bottom: 12px;
            font-weight: 700;
            margin-top: auto;
            color: var(--text-neutral-100);
        }

        .input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        .input-group input {
            flex: 1;
        }

        input {
            background: var(--glass-bg);
            color: var(--text-color);
            border: 1px solid var(--glass-border);
            padding: 12px 16px;
            width: 100%;
            border-radius: var(--border-radius-sm);
            font-size: 14px;
            font-family: 'Space Grotesk', sans-serif;
            transition: all 0.3s ease;
            backdrop-filter: var(--backdrop-blur);
            -webkit-backdrop-filter: var(--backdrop-blur);
            box-shadow: 0 0 0 1px var(--glass-ring);
        }

        input:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 1px var(--focus-border-color), 0 4px 12px rgba(59, 130, 246, 0.15);
            background: var(--input-background-focus);
        }

        input::placeholder {
            color: var(--placeholder-color);
        }

        input.api-key-error {
            animation: blink-red 1s ease-in-out;
            border-color: #ff4444;
        }

        @keyframes blink-red {
            0%, 100% {
                border-color: var(--button-border);
                background: var(--input-background);
            }
            25%, 75% {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }
            50% {
                border-color: #ff6666;
                background: rgba(255, 68, 68, 0.15);
            }
        }

        .start-button {
            background: var(--button-background);
            color: var(--start-button-color);
            border: 1px solid var(--glass-border);
            padding: 12px 20px;
            border-radius: var(--border-radius-sm);
            font-size: 14px;
            font-weight: 600;
            font-family: 'Space Grotesk', sans-serif;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            backdrop-filter: var(--backdrop-blur);
            -webkit-backdrop-filter: var(--backdrop-blur);
            box-shadow: 0 0 0 1px var(--glass-ring);
        }

        .start-button:hover {
            background: var(--button-background-hover);
            border-color: var(--glass-border);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--glass-ring);
        }

        .start-button.initializing {
            opacity: 0.5;
        }

        .start-button.initializing:hover {
            background: var(--start-button-background);
            border-color: var(--start-button-border);
        }

        .shortcut-icons {
            display: flex;
            align-items: center;
            gap: 2px;
            margin-left: 4px;
        }

        .shortcut-icons svg {
            width: 14px;
            height: 14px;
        }

        .shortcut-icons svg path {
            stroke: currentColor;
        }

        .description {
            color: var(--text-neutral-300);
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.6;
            font-weight: 400;
        }

        .link {
            color: var(--link-color);
            text-decoration: none;
            cursor: pointer;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .link:hover {
            color: rgba(59, 130, 246, 1);
            text-decoration: underline;
        }

        .shortcut-hint {
            color: var(--description-color);
            font-size: 11px;
            opacity: 0.8;
        }
        `;
    }

    connectedCallback() {
        this.render();
        window.electron?.ipcRenderer?.on('session-initializing', (event, isInitializing) => {
            this.isInitializing = isInitializing;
            this.update();
        });
        document.addEventListener('keydown', this.boundKeydownHandler);
        this.loadLayoutMode();
        resizeLayout();
    }

    disconnectedCallback() {
        window.electron?.ipcRenderer?.removeAllListeners('session-initializing');
        document.removeEventListener('keydown', this.boundKeydownHandler);
    }

    handleKeydown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';
        if (isStartShortcut) {
            e.preventDefault();
            this.handleStartClick();
        }
    }

    handleInput(e) {
        localStorage.setItem('apiKey', e.target.value);
        if (this.showApiKeyError) {
            this.showApiKeyError = false;
            this.update();
        }
    }

    handleStartClick() {
        if (this.isInitializing) return;
        this.onStart();
    }

    handleAPIKeyHelpClick() {
        this.onAPIKeyHelp();
    }

    loadLayoutMode() {
        const savedLayoutMode = localStorage.getItem('layoutMode');
        if (savedLayoutMode && savedLayoutMode !== 'normal') {
            this.onLayoutModeChange(savedLayoutMode);
        }
    }

    triggerApiKeyError() {
        this.showApiKeyError = true;
        this.update();
        setTimeout(() => {
            this.showApiKeyError = false;
            this.update();
        }, 1000);
    }

    getStartButtonText() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdIcon = `<svg width="14px" height="14px" viewBox="0 0 24 24" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H18C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;
        const enterIcon = `<svg width="14px" height="14px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.25 19.25L6.75 15.75L10.25 12.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M6.75 15.75H12.75C14.9591 15.75 16.75 13.9591 16.75 11.75V4.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;
        if (isMac) {
            return `Start Session <span class="shortcut-icons">${cmdIcon}${enterIcon}</span>`;
        } else {
            return `Start Session <span class="shortcut-icons">Ctrl${enterIcon}</span>`;
        }
    }

    update() {
        this.render();
    }

    render() {
        const style = document.createElement('style');
        style.textContent = MainView.styles;
        
        const container = document.createElement('div');
        container.innerHTML = `
            <div class="welcome">Welcome</div>
            <div class="input-group">
                <input
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    value="${localStorage.getItem('apiKey') || ''}"
                    class="${this.showApiKeyError ? 'api-key-error' : ''}"
                />
                <button class="start-button ${this.isInitializing ? 'initializing' : ''}">
                    ${this.getStartButtonText()}
                </button>
            </div>
            <p class="description">
                dont have an api key?
                <span class="link">get one here</span>
            </p>
        `;

        // Attach event listeners
        const input = container.querySelector('input');
        const button = container.querySelector('button');
        const link = container.querySelector('.link');
        
        input.addEventListener('input', (e) => this.handleInput(e));
        button.addEventListener('click', () => this.handleStartClick());
        link.addEventListener('click', () => this.handleAPIKeyHelpClick());

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }
}

customElements.define('main-view', MainView);
