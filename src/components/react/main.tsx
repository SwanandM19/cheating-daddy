import React from 'react';
import { createRoot } from 'react-dom/client';
import { CheatingDaddyApp } from './App';
import '../../styles/globals.css';

// Initialize React app
function initApp() {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error('Root element not found!');
        return;
    }

    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <CheatingDaddyApp />
        </React.StrictMode>
    );
}

// Wait for DOM if not ready, otherwise init immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
