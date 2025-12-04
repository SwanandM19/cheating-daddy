import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings, HelpCircle, BookOpen, FlaskConical } from 'lucide-react';

type ViewType = 'onboarding' | 'main' | 'assistant' | 'customize' | 'help' | 'history' | 'advanced';

interface AppHeaderProps {
    currentView: ViewType;
    isCapturing: boolean;
    advancedMode: boolean;
    onNavigate: (view: ViewType) => void;
    onStopSession: () => Promise<void>;
}

export function AppHeader({
    currentView,
    isCapturing,
    advancedMode,
    onNavigate,
    onStopSession,
}: AppHeaderProps) {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const getViewTitle = () => {
        const titles: Record<string, string> = {
            onboarding: 'Welcome to Cheating Daddy',
            main: 'Cheating Daddy',
            customize: 'Customize',
            help: 'Help & Shortcuts',
            history: 'Conversation History',
            advanced: 'Advanced Tools',
            assistant: 'Cheating Daddy',
        };
        return titles[currentView] || 'Cheating Daddy';
    };

    const isNavigationView = () => {
        return ['customize', 'help', 'history', 'advanced'].includes(currentView);
    };

    const handleClose = async () => {
        if (currentView === 'assistant') {
            await onStopSession();
        } else if (isNavigationView()) {
            onNavigate('main');
        } else if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            // Actually quit the app
            await ipcRenderer.invoke('quit-application');
        }
    };

    const handleHideToggle = () => {
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.send('toggle-visibility');
        }
    };

    return (
        <header className="glass rounded-xl p-3 flex items-center justify-between">
            <div className="flex-1 font-semibold text-sm select-none text-white">{getViewTitle()}</div>

            <div className="flex items-center gap-2 no-drag">
                {currentView === 'assistant' && (
                    <>
                        <Button variant="glass" size="sm" onClick={handleHideToggle} className="text-xs">
                            Hide&nbsp;&nbsp;
                            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-black/30 rounded border border-white/10">
                                {isMac ? 'Cmd' : 'Ctrl'}
                            </kbd>
                            &nbsp;
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-black/30 rounded border border-white/10">\</kbd>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 opacity-70 hover:opacity-100">
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                )}

                {currentView === 'main' && (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => onNavigate('history')} className="h-8 w-8 opacity-70 hover:opacity-100">
                            <BookOpen className="h-4 w-4" />
                        </Button>
                        {advancedMode && (
                            <Button variant="ghost" size="icon" onClick={() => onNavigate('advanced')} className="h-8 w-8 opacity-70 hover:opacity-100">
                                <FlaskConical className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => onNavigate('customize')} className="h-8 w-8 opacity-70 hover:opacity-100">
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onNavigate('help')} className="h-8 w-8 opacity-70 hover:opacity-100">
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 opacity-70 hover:opacity-100">
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                )}

                {isNavigationView() && (
                    <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 opacity-70 hover:opacity-100">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </header>
    );
}
