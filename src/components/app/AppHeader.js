export class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentView = 'main';
        this.statusText = '';
        this.startTime = null;
        this.onCustomizeClick = () => {};
        this.onHelpClick = () => {};
        this.onHistoryClick = () => {};
        this.onCloseClick = () => {};
        this.onBackClick = () => {};
        this.onHideToggleClick = () => {};
        this.isClickThrough = false;
        this.advancedMode = false;
        this.onAdvancedClick = () => {};
        this._timerInterval = null;
        this._prevView = null;
        this._prevStartTime = null;
    }

    static get styles() {
        return `
        * {
            font-family: 'Space Grotesk', sans-serif;
            cursor: var(--custom-cursor);
            user-select: none;
        }

        :host {
            display: block;
        }

        .header {
            -webkit-app-region: drag;
            display: flex;
            align-items: center;
            padding: var(--header-padding);
            border: 1px solid var(--glass-border);
            background: var(--glass-bg);
            border-radius: var(--border-radius);
            backdrop-filter: var(--backdrop-blur);
            -webkit-backdrop-filter: var(--backdrop-blur);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px var(--glass-ring);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: radial-gradient(600px 240px at 25% 10%, var(--gradient-blue-1), transparent 65%);
            z-index: 0;
        }

        .header > * {
            position: relative;
            z-index: 1;
        }

        .header-title {
            flex: 1;
            font-size: var(--header-font-size);
            font-weight: 600;
            -webkit-app-region: drag;
        }

        .header-actions {
            display: flex;
            gap: var(--header-gap);
            align-items: center;
            -webkit-app-region: no-drag;
        }

        .header-actions span {
            font-size: var(--header-font-size-small);
            color: var(--header-actions-color);
        }

        .button {
            background: var(--button-background);
            color: var(--text-color);
            border: 1px solid var(--glass-border);
            padding: var(--header-button-padding);
            border-radius: var(--border-radius-sm);
            font-size: var(--header-font-size-small);
            font-weight: 500;
            font-family: 'Space Grotesk', sans-serif;
            transition: all 0.3s ease;
            backdrop-filter: var(--backdrop-blur);
            -webkit-backdrop-filter: var(--backdrop-blur);
            box-shadow: 0 0 0 1px var(--glass-ring);
            cursor: pointer;
        }

        .icon-button {
            background: transparent;
            color: var(--icon-button-color);
            border: none;
            padding: var(--header-icon-padding);
            border-radius: var(--border-radius-sm);
            font-size: var(--header-font-size-small);
            font-weight: 500;
            font-family: 'Space Grotesk', sans-serif;
            display: flex;
            opacity: 0.7;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .icon-button svg {
            width: var(--icon-size);
            height: var(--icon-size);
        }

        .icon-button:hover {
            background: var(--button-background-hover);
            opacity: 1;
            transform: translateY(-1px);
        }

        .button:hover {
            background: var(--button-background-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--glass-ring);
        }

        :host([isclickthrough]) .button:hover,
        :host([isclickthrough]) .icon-button:hover {
            background: transparent;
        }

        .key {
            background: var(--key-background);
            padding: 4px 8px;
            border-radius: var(--border-radius-sm);
            font-size: 11px;
            font-family: 'Space Grotesk', sans-serif;
            margin: 0px;
            border: 1px solid var(--glass-border);
            backdrop-filter: var(--backdrop-blur);
            -webkit-backdrop-filter: var(--backdrop-blur);
        }
        `;
    }

    static get observedAttributes() {
        return ['isclickthrough'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'isclickthrough') {
            this.isClickThrough = newValue !== null;
            this.update();
        }
    }

    connectedCallback() {
        this.render();
        this._startTimer();
    }

    disconnectedCallback() {
        this._stopTimer();
    }

    _checkAndUpdate() {
        if (this._prevView !== this.currentView || this._prevStartTime !== this.startTime) {
            this._prevView = this.currentView;
            this._prevStartTime = this.startTime;
            
            if (this.currentView === 'assistant' && this.startTime) {
                this._startTimer();
            } else {
                this._stopTimer();
            }
            
            if (this.startTime && this.currentView === 'assistant') {
                this._startTimer();
            } else if (!this.startTime) {
                this._stopTimer();
            }
        }
    }

    _startTimer() {
        this._stopTimer();
        if (this.currentView === 'assistant' && this.startTime) {
            this._timerInterval = setInterval(() => {
                this.update();
            }, 1000);
        }
    }

    _stopTimer() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    }

    getViewTitle() {
        const titles = {
            onboarding: 'Welcome to Cheating Daddy',
            main: 'Cheating Daddy',
            customize: 'Customize',
            help: 'Help & Shortcuts',
            history: 'Conversation History',
            advanced: 'Advanced Tools',
            assistant: 'Cheating Daddy',
        };
        return titles[this.currentView] || 'Cheating Daddy';
    }

    getElapsedTime() {
        if (this.currentView === 'assistant' && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            return `${elapsed}s`;
        }
        return '';
    }

    isNavigationView() {
        const navigationViews = ['customize', 'help', 'history', 'advanced'];
        return navigationViews.includes(this.currentView);
    }

    update() {
        this._checkAndUpdate();
        this.render();
    }

    render() {
        const style = document.createElement('style');
        style.textContent = AppHeader.styles;

        const header = document.createElement('div');
        header.className = 'header';

        const title = document.createElement('div');
        title.className = 'header-title';
        title.textContent = this.getViewTitle();

        const actions = document.createElement('div');
        actions.className = 'header-actions';

        const elapsedTime = this.getElapsedTime();

        if (this.currentView === 'assistant') {
            if (elapsedTime) {
                const timeSpan = document.createElement('span');
                timeSpan.textContent = elapsedTime;
                actions.appendChild(timeSpan);
            }
            if (this.statusText) {
                const statusSpan = document.createElement('span');
                statusSpan.textContent = this.statusText;
                actions.appendChild(statusSpan);
            }
            
            const hideButton = document.createElement('button');
            hideButton.className = 'button';
            const isMac = window.cheddar?.isMacOS || navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            hideButton.innerHTML = `Hide&nbsp;&nbsp;<span class="key" style="pointer-events: none;">${isMac ? 'Cmd' : 'Ctrl'}</span>&nbsp;&nbsp;<span class="key">\\</span>`;
            hideButton.addEventListener('click', () => this.onHideToggleClick());
            actions.appendChild(hideButton);

            const closeButton = document.createElement('button');
            closeButton.className = 'icon-button window-close';
            closeButton.innerHTML = `<svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            closeButton.addEventListener('click', () => this.onCloseClick());
            actions.appendChild(closeButton);
        } else if (this.currentView === 'main') {
            const historyButton = document.createElement('button');
            historyButton.className = 'icon-button';
            historyButton.innerHTML = `<svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M12 21V7C12 5.89543 12.8954 5 14 5H21.4C21.7314 5 22 5.26863 22 5.6V18.7143" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
                <path d="M12 21V7C12 5.89543 11.1046 5 10 5H2.6C2.26863 5 2 5.26863 2 5.6V18.7143" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
                <path d="M14 19L22 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
                <path d="M10 19L2 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
                <path d="M12 21C12 19.8954 12.8954 19 14 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12 21C12 19.8954 11.1046 19 10 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            historyButton.addEventListener('click', () => this.onHistoryClick());
            actions.appendChild(historyButton);

            if (this.advancedMode) {
                const advancedButton = document.createElement('button');
                advancedButton.className = 'icon-button';
                advancedButton.title = 'Advanced Tools';
                advancedButton.innerHTML = `<svg width="24px" stroke-width="1.7" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                    <path d="M18.5 15L5.5 15" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path>
                    <path d="M16 4L8 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M9 4.5L9 10.2602C9 10.7376 8.82922 11.1992 8.51851 11.5617L3.48149 17.4383C3.17078 17.8008 3 18.2624 3 18.7398V19C3 20.1046 3.89543 21 5 21L19 21C20.1046 21 21 20.1046 21 19V18.7398C21 18.2624 20.8292 17.8008 20.5185 17.4383L15.4815 11.5617C15.1708 11.1992 15 10.7376 15 10.2602L15 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M12 9.01L12.01 8.99889" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M11 2.01L11.01 1.99889" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>`;
                advancedButton.addEventListener('click', () => this.onAdvancedClick());
                actions.appendChild(advancedButton);
            }

            const customizeButton = document.createElement('button');
            customizeButton.className = 'icon-button';
            customizeButton.innerHTML = `<svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            customizeButton.addEventListener('click', () => this.onCustomizeClick());
            actions.appendChild(customizeButton);

            const helpButton = document.createElement('button');
            helpButton.className = 'icon-button';
            helpButton.innerHTML = `<svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12 18.01L12.01 17.9989" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            helpButton.addEventListener('click', () => this.onHelpClick());
            actions.appendChild(helpButton);

            const closeButton = document.createElement('button');
            closeButton.className = 'icon-button window-close';
            closeButton.innerHTML = `<svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            closeButton.addEventListener('click', () => this.onCloseClick());
            actions.appendChild(closeButton);
        } else {
            const closeButton = document.createElement('button');
            closeButton.className = 'icon-button window-close';
            closeButton.innerHTML = `<svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            closeButton.addEventListener('click', () => {
                if (this.isNavigationView()) {
                    this.onBackClick();
                } else {
                    this.onCloseClick();
                }
            });
            actions.appendChild(closeButton);
        }

        header.appendChild(title);
        header.appendChild(actions);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(header);

        if (this.isClickThrough) {
            this.setAttribute('isclickthrough', '');
        } else {
            this.removeAttribute('isclickthrough');
        }
    }
}

customElements.define('app-header', AppHeader);
