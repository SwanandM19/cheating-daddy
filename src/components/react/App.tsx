import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from './AppHeader';
import { OnboardingView } from './OnboardingView';
import { MainView } from './MainView';
import { AssistantView } from './AssistantView';
import { CustomizeView } from './CustomizeView';
import { HelpView } from './HelpView';
import { HistoryView } from './HistoryView';
import { AdvancedView } from './AdvancedView';
import { cn } from '@/lib/utils';

export type ViewType = 'onboarding' | 'main' | 'assistant' | 'customize' | 'help' | 'history' | 'advanced';

interface CheatingDaddyAppProps {
    initialView?: ViewType;
}

// Get cheddar from window
declare global {
    interface Window {
        cheddar: {
            initializeGemini: (apiKey: string) => Promise<boolean>;
            startCapture: (selectedScreen: any, options: any) => Promise<void>;
            stopCapture: () => Promise<void>;
            sendTextMessage: (message: string) => Promise<void>;
            captureManualScreenshot: () => void;
            getAllConversationSessions: () => Promise<any[]>;
            isMacOS: boolean;
        };
    }
}

export function CheatingDaddyApp({ initialView = 'onboarding' }: CheatingDaddyAppProps) {
    const [currentView, setCurrentView] = useState<ViewType>(initialView);
    const [isCapturing, setIsCapturing] = useState(false);
    const [responses, setResponses] = useState<string[]>([]);
    const [currentResponseIndex, setCurrentResponseIndex] = useState(-1);
    const [shouldAnimateResponse, setShouldAnimateResponse] = useState(false);
    const [apiKey, setApiKey] = useState('');
    
    // Settings
    const [selectedProfile, setSelectedProfile] = useState('interview');
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    const [selectedScreenshotInterval, setSelectedScreenshotInterval] = useState('5');
    const [selectedImageQuality, setSelectedImageQuality] = useState('medium');
    const [layoutMode, setLayoutMode] = useState('normal');
    const [advancedMode, setAdvancedMode] = useState(false);

    // Check for saved state on mount
    useEffect(() => {
        const savedApiKey = localStorage.getItem('geminiApiKey');
        const savedProfile = localStorage.getItem('selectedProfile');
        const savedLanguage = localStorage.getItem('selectedLanguage');
        const savedScreenshotInterval = localStorage.getItem('selectedScreenshotInterval');
        const savedLayoutMode = localStorage.getItem('layoutMode');
        const savedAdvancedMode = localStorage.getItem('advancedMode');
        const onboardingComplete = localStorage.getItem('onboardingComplete');

        if (savedApiKey) setApiKey(savedApiKey);
        if (savedProfile) setSelectedProfile(savedProfile);
        if (savedLanguage) setSelectedLanguage(savedLanguage);
        if (savedScreenshotInterval) setSelectedScreenshotInterval(savedScreenshotInterval);
        if (savedLayoutMode) setLayoutMode(savedLayoutMode);
        if (savedAdvancedMode) setAdvancedMode(savedAdvancedMode === 'true');
        
        // Skip onboarding if already completed
        if (onboardingComplete === 'true' && savedApiKey) {
            setCurrentView('main');
        }
    }, []);

    // Listen for AI responses from gemini.js (sends 'update-response' event)
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            
            const handleAIResponse = (_event: any, response: string) => {
                console.log('Received AI response:', response?.substring(0, 100));
                setResponses(prev => [...prev, response]);
                setCurrentResponseIndex(prev => prev + 1);
                setShouldAnimateResponse(true);
            };

            ipcRenderer.on('update-response', handleAIResponse);

            return () => {
                ipcRenderer.removeListener('update-response', handleAIResponse);
            };
        }
    }, []);

    const handleNavigation = useCallback((view: ViewType) => {
        setCurrentView(view);
    }, []);

    const handleOnboardingComplete = useCallback(async (apiKeyValue: string) => {
        setApiKey(apiKeyValue);
        localStorage.setItem('geminiApiKey', apiKeyValue);
        localStorage.setItem('onboardingComplete', 'true');
        setCurrentView('main');
    }, []);

    const handleStartSession = useCallback(async (selectedScreen: any) => {
        console.log('handleStartSession called');
        console.log('API Key available:', apiKey ? 'yes' : 'no');
        
        try {
            const cheddar = window.cheddar;
            console.log('Cheddar object:', cheddar ? 'available' : 'not available');
            
            if (!cheddar) {
                console.error('Cheddar not available');
                alert('Error: Cheddar not available. Please refresh the app.');
                return;
            }

            // Initialize Gemini with API key and profile/language
            console.log('Initializing Gemini with API key...');
            const initialized = await cheddar.initializeGemini(apiKey, selectedProfile, selectedLanguage);
            console.log('Gemini initialized:', initialized);
            
            if (!initialized) {
                console.error('Failed to initialize Gemini');
                alert('Failed to initialize Gemini. Please check your API key.');
                return;
            }

            // Start capture with interval and quality
            // The renderer.js startCapture expects (screenshotIntervalSeconds, imageQuality)
            const intervalSeconds = selectedScreenshotInterval === 'manual' ? 0 : parseInt(selectedScreenshotInterval, 10);
            console.log('Starting capture with interval:', intervalSeconds, 'quality:', selectedImageQuality);
            await cheddar.startCapture(intervalSeconds, selectedImageQuality);
            console.log('Capture started successfully');

            setIsCapturing(true);
            setCurrentView('assistant');
        } catch (error) {
            console.error('Error starting session:', error);
            alert('Error starting session: ' + (error as Error).message);
        }
    }, [apiKey, selectedProfile, selectedLanguage, selectedScreenshotInterval, selectedImageQuality]);

    const handleStopSession = useCallback(async () => {
        try {
            const cheddar = window.cheddar;
            if (cheddar) {
                await cheddar.stopCapture();
            }
            setIsCapturing(false);
            setCurrentView('main');
        } catch (error) {
            console.error('Error stopping session:', error);
        }
    }, []);

    const handleSendText = useCallback(async (message: string) => {
        const cheddar = window.cheddar;
        if (cheddar) {
            await cheddar.sendTextMessage(message);
        }
    }, []);

    const handleExternalLinkClick = useCallback((url: string) => {
        if (typeof window !== 'undefined' && (window as any).require) {
            const { shell } = (window as any).require('electron');
            shell.openExternal(url);
        }
    }, []);

    const handleResponseIndexChanged = useCallback((index: number) => {
        setCurrentResponseIndex(index);
        setShouldAnimateResponse(false);
    }, []);

    const renderCurrentView = () => {
        switch (currentView) {
            case 'onboarding':
                return (
                    <OnboardingView
                        onComplete={handleOnboardingComplete}
                        initialApiKey={apiKey}
                    />
                );
            case 'main':
                return (
                    <MainView
                        apiKey={apiKey}
                        onApiKeyChange={setApiKey}
                        onStartSession={handleStartSession}
                        isCapturing={isCapturing}
                    />
                );
            case 'assistant':
                return (
                    <AssistantView
                        responses={responses}
                        currentResponseIndex={currentResponseIndex}
                        selectedProfile={selectedProfile}
                        onSendText={handleSendText}
                        onResponseIndexChanged={handleResponseIndexChanged}
                    />
                );
            case 'customize':
                return (
                    <CustomizeView
                        selectedProfile={selectedProfile}
                        selectedLanguage={selectedLanguage}
                        selectedScreenshotInterval={selectedScreenshotInterval}
                        selectedImageQuality={selectedImageQuality}
                        layoutMode={layoutMode}
                        advancedMode={advancedMode}
                        onProfileChange={setSelectedProfile}
                        onLanguageChange={setSelectedLanguage}
                        onScreenshotIntervalChange={setSelectedScreenshotInterval}
                        onImageQualityChange={setSelectedImageQuality}
                        onLayoutModeChange={setLayoutMode}
                        onAdvancedModeChange={setAdvancedMode}
                    />
                );
            case 'help':
                return <HelpView onExternalLinkClick={handleExternalLinkClick} />;
            case 'history':
                return <HistoryView />;
            case 'advanced':
                return <AdvancedView />;
            default:
                return null;
        }
    };

    // Show header for all views except onboarding
    const showHeader = currentView !== 'onboarding';

    return (
        <div className={cn(
            "h-screen w-screen flex flex-col overflow-hidden",
            "bg-transparent font-['Space_Grotesk',sans-serif]"
        )}>
            {showHeader && (
                <div className="p-2">
                    <AppHeader
                        currentView={currentView}
                        isCapturing={isCapturing}
                        advancedMode={advancedMode}
                        onNavigate={handleNavigation}
                        onStopSession={handleStopSession}
                    />
                </div>
            )}
            
            <main className={cn(
                "flex-1 overflow-hidden",
                showHeader ? "mx-2 mb-2 rounded-2xl glass" : ""
            )}>
                <div className="h-full overflow-auto p-3">
                    {renderCurrentView()}
                </div>
            </main>
        </div>
    );
}
