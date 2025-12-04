import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CornerDownLeft } from 'lucide-react';

interface MainViewProps {
    apiKey: string;
    onApiKeyChange: (apiKey: string) => void;
    onStartSession: (selectedScreen: any) => Promise<void>;
    isCapturing: boolean;
}

export function MainView({ apiKey, onApiKeyChange, onStartSession, isCapturing }: MainViewProps) {
    const [isInitializing, setIsInitializing] = useState(false);
    const [showApiKeyError, setShowApiKeyError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    useEffect(() => {
        // Listen for IPC events
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            const handleInitializing = (_: any, isInit: boolean) => {
                setIsInitializing(isInit);
            };
            ipcRenderer.on('session-initializing', handleInitializing);
            return () => {
                ipcRenderer.removeListener('session-initializing', handleInitializing);
            };
        }
    }, []);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';
            if (isStartShortcut) {
                e.preventDefault();
                handleStartClick();
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [apiKey, isMac]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onApiKeyChange(value);
        localStorage.setItem('geminiApiKey', value);
        if (showApiKeyError) {
            setShowApiKeyError(false);
        }
    };

    const handleStartClick = async () => {
        console.log('Start Session clicked');
        console.log('API Key:', apiKey ? 'present' : 'missing');
        console.log('isInitializing:', isInitializing);
        console.log('isCapturing:', isCapturing);
        
        if (isInitializing || isCapturing) {
            console.log('Already initializing or capturing, returning');
            return;
        }

        const trimmedKey = apiKey.trim();
        if (!trimmedKey) {
            console.log('No API key provided');
            setShowApiKeyError(true);
            setTimeout(() => setShowApiKeyError(false), 1000);
            return;
        }

        console.log('Setting initializing to true');
        setIsInitializing(true);
        
        try {
            // Pass null as selectedScreen - the actual screen selection
            // would come from a separate screen picker component
            console.log('Calling onStartSession...');
            await onStartSession(null);
            console.log('onStartSession completed');
        } catch (error) {
            console.error('Error in handleStartClick:', error);
        } finally {
            setIsInitializing(false);
        }
    };

    const handleAPIKeyHelp = () => {
        if ((window as any).require) {
            const { shell } = (window as any).require('electron');
            shell.openExternal('https://aistudio.google.com/app/apikey');
        }
    };

    return (
        <div className="flex flex-col h-full max-w-[500px] select-none">
            <div className="mt-auto">
                <h1 className="text-[28px] font-bold mb-3 text-neutral-100">Welcome</h1>
            </div>

            <div className="flex gap-3 mb-5">
                <Input
                    ref={inputRef}
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    value={apiKey}
                    onChange={handleInput}
                    className={`flex-1 glass ${showApiKeyError ? 'animate-blink-red border-red-500' : ''}`}
                />
                <Button
                    onClick={handleStartClick}
                    disabled={isInitializing}
                    className={`whitespace-nowrap glass ${isInitializing ? 'opacity-50' : ''}`}
                >
                    Start Session
                    <span className="flex items-center gap-0.5 ml-2">
                        {isMac ? (
                            <>
                                <kbd className="px-1.5 py-0.5 text-[10px] bg-black/30 rounded border border-white/10">⌘</kbd>
                                <CornerDownLeft className="h-3 w-3 ml-0.5" />
                            </>
                        ) : (
                            <>
                                <kbd className="px-1.5 py-0.5 text-[10px] bg-black/30 rounded border border-white/10">Ctrl</kbd>
                                <CornerDownLeft className="h-3 w-3 ml-0.5" />
                            </>
                        )}
                    </span>
                </Button>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed">
                don't have an api key?{' '}
                <button onClick={handleAPIKeyHelp} className="text-blue-400 hover:text-blue-300 hover:underline font-medium no-drag">
                    get one here
                </button>
            </p>
        </div>
    );
}
