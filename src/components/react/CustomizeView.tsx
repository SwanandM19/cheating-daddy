import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

interface Profile {
    value: string;
    name: string;
    description: string;
}

interface Language {
    value: string;
    name: string;
}

interface KeybindAction {
    key: string;
    name: string;
    description: string;
}

interface Keybinds {
    [key: string]: string;
}

interface CustomizeViewProps {
    selectedProfile: string;
    selectedLanguage: string;
    selectedScreenshotInterval: string;
    selectedImageQuality: string;
    layoutMode: string;
    advancedMode: boolean;
    onProfileChange: (profile: string) => void;
    onLanguageChange: (language: string) => void;
    onScreenshotIntervalChange: (interval: string) => void;
    onImageQualityChange: (quality: string) => void;
    onLayoutModeChange: (mode: string) => void;
    onAdvancedModeChange: (enabled: boolean) => void;
}

const profiles: Profile[] = [
    { value: 'interview', name: 'Job Interview', description: 'Get help with answering interview questions' },
    { value: 'sales', name: 'Sales Call', description: 'Assist with sales conversations and objection handling' },
    { value: 'meeting', name: 'Business Meeting', description: 'Support for professional meetings and discussions' },
    { value: 'presentation', name: 'Presentation', description: 'Help with presentations and public speaking' },
    { value: 'negotiation', name: 'Negotiation', description: 'Guidance for business negotiations and deals' },
    { value: 'exam', name: 'Exam Assistant', description: 'Academic assistance for test-taking and exam questions' },
];

const languages: Language[] = [
    { value: 'en-US', name: 'English (US)' },
    { value: 'en-GB', name: 'English (UK)' },
    { value: 'en-AU', name: 'English (Australia)' },
    { value: 'de-DE', name: 'German (Germany)' },
    { value: 'es-US', name: 'Spanish (United States)' },
    { value: 'es-ES', name: 'Spanish (Spain)' },
    { value: 'fr-FR', name: 'French (France)' },
    { value: 'hi-IN', name: 'Hindi (India)' },
    { value: 'pt-BR', name: 'Portuguese (Brazil)' },
    { value: 'ja-JP', name: 'Japanese (Japan)' },
    { value: 'ko-KR', name: 'Korean (South Korea)' },
    { value: 'cmn-CN', name: 'Mandarin Chinese (China)' },
];

const profileNames: Record<string, string> = {
    interview: 'Job Interview',
    sales: 'Sales Call',
    meeting: 'Business Meeting',
    presentation: 'Presentation',
    negotiation: 'Negotiation',
    exam: 'Exam Assistant',
};

export function CustomizeView({
    selectedProfile,
    selectedLanguage,
    selectedScreenshotInterval,
    selectedImageQuality,
    layoutMode,
    advancedMode,
    onProfileChange,
    onLanguageChange,
    onScreenshotIntervalChange,
    onImageQualityChange,
    onLayoutModeChange,
    onAdvancedModeChange,
}: CustomizeViewProps) {
    const [customPrompt, setCustomPrompt] = useState('');
    const [audioMode, setAudioMode] = useState('speaker_only');
    const [stealthProfile, setStealthProfile] = useState('balanced');
    const [googleSearchEnabled, setGoogleSearchEnabled] = useState(true);
    const [backgroundTransparency, setBackgroundTransparency] = useState(0.8);
    const [fontSize, setFontSize] = useState(20);
    const [keybinds, setKeybinds] = useState<Keybinds>({});

    // Load settings from localStorage
    useEffect(() => {
        setCustomPrompt(localStorage.getItem('customPrompt') || '');
        setAudioMode(localStorage.getItem('audioMode') || 'speaker_only');
        setStealthProfile(localStorage.getItem('stealthProfile') || 'balanced');
        setGoogleSearchEnabled(localStorage.getItem('googleSearchEnabled') !== 'false');
        setBackgroundTransparency(parseFloat(localStorage.getItem('backgroundTransparency') || '0.8'));
        setFontSize(parseInt(localStorage.getItem('fontSize') || '20', 10));
        loadKeybinds();
    }, []);

    const getDefaultKeybinds = useCallback((): Keybinds => {
        const isMac = (window as any).cheddar?.isMacOS || navigator.platform.includes('Mac');
        return {
            moveUp: isMac ? 'Alt+Up' : 'Ctrl+Up',
            moveDown: isMac ? 'Alt+Down' : 'Ctrl+Down',
            moveLeft: isMac ? 'Alt+Left' : 'Ctrl+Left',
            moveRight: isMac ? 'Alt+Right' : 'Ctrl+Right',
            toggleVisibility: isMac ? 'Cmd+\\' : 'Ctrl+\\',
            toggleClickThrough: isMac ? 'Cmd+M' : 'Ctrl+M',
            nextStep: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
            previousResponse: isMac ? 'Cmd+[' : 'Ctrl+[',
            nextResponse: isMac ? 'Cmd+]' : 'Ctrl+]',
            scrollUp: isMac ? 'Cmd+Shift+Up' : 'Ctrl+Shift+Up',
            scrollDown: isMac ? 'Cmd+Shift+Down' : 'Ctrl+Shift+Down',
        };
    }, []);

    const loadKeybinds = useCallback(() => {
        const savedKeybinds = localStorage.getItem('customKeybinds');
        if (savedKeybinds) {
            try {
                setKeybinds({ ...getDefaultKeybinds(), ...JSON.parse(savedKeybinds) });
            } catch {
                setKeybinds(getDefaultKeybinds());
            }
        } else {
            setKeybinds(getDefaultKeybinds());
        }
    }, [getDefaultKeybinds]);

    const saveKeybinds = (newKeybinds: Keybinds) => {
        localStorage.setItem('customKeybinds', JSON.stringify(newKeybinds));
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.send('update-keybinds', newKeybinds);
        }
    };

    const handleKeybindChange = (action: string, value: string) => {
        const newKeybinds = { ...keybinds, [action]: value };
        setKeybinds(newKeybinds);
        saveKeybinds(newKeybinds);
    };

    const resetKeybinds = () => {
        const defaultKeybinds = getDefaultKeybinds();
        setKeybinds(defaultKeybinds);
        localStorage.removeItem('customKeybinds');
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.send('update-keybinds', defaultKeybinds);
        }
    };

    const handleBackgroundTransparencyChange = (value: number) => {
        setBackgroundTransparency(value);
        localStorage.setItem('backgroundTransparency', value.toString());
        updateBackgroundTransparency(value);
    };

    const updateBackgroundTransparency = (transparency: number) => {
        const root = document.documentElement;
        root.style.setProperty('--header-background', `rgba(0, 0, 0, ${transparency})`);
        root.style.setProperty('--main-content-background', `rgba(0, 0, 0, ${transparency})`);
        root.style.setProperty('--card-background', `rgba(255, 255, 255, ${transparency * 0.05})`);
        root.style.setProperty('--input-background', `rgba(0, 0, 0, ${transparency * 0.375})`);
        root.style.setProperty('--button-background', `rgba(0, 0, 0, ${transparency * 0.625})`);
    };

    const handleFontSizeChange = (value: number) => {
        setFontSize(value);
        localStorage.setItem('fontSize', value.toString());
        document.documentElement.style.setProperty('--response-font-size', `${value}px`);
    };

    const keybindActions: KeybindAction[] = [
        { key: 'moveUp', name: 'Move Window Up', description: 'Move the application window up' },
        { key: 'moveDown', name: 'Move Window Down', description: 'Move the application window down' },
        { key: 'moveLeft', name: 'Move Window Left', description: 'Move the application window left' },
        { key: 'moveRight', name: 'Move Window Right', description: 'Move the application window right' },
        { key: 'toggleVisibility', name: 'Toggle Window Visibility', description: 'Show/hide the application window' },
        { key: 'toggleClickThrough', name: 'Toggle Click-through Mode', description: 'Enable/disable click-through functionality' },
        { key: 'nextStep', name: 'Ask Next Step', description: 'Take screenshot and ask AI for the next step suggestion' },
        { key: 'previousResponse', name: 'Previous Response', description: 'Navigate to the previous AI response' },
        { key: 'nextResponse', name: 'Next Response', description: 'Navigate to the next AI response' },
        { key: 'scrollUp', name: 'Scroll Response Up', description: 'Scroll the AI response content up' },
        { key: 'scrollDown', name: 'Scroll Response Down', description: 'Scroll the AI response content down' },
    ];

    const handleKeybindInput = (e: React.KeyboardEvent<HTMLInputElement>, action: string) => {
        e.preventDefault();
        const modifiers: string[] = [];
        if (e.ctrlKey) modifiers.push('Ctrl');
        if (e.metaKey) modifiers.push('Cmd');
        if (e.altKey) modifiers.push('Alt');
        if (e.shiftKey) modifiers.push('Shift');

        let mainKey = e.key;
        switch (e.code) {
            case 'ArrowUp': mainKey = 'Up'; break;
            case 'ArrowDown': mainKey = 'Down'; break;
            case 'ArrowLeft': mainKey = 'Left'; break;
            case 'ArrowRight': mainKey = 'Right'; break;
            case 'Enter': mainKey = 'Enter'; break;
            case 'Space': mainKey = 'Space'; break;
            case 'Backslash': mainKey = '\\'; break;
            default:
                if (e.key.length === 1) mainKey = e.key.toUpperCase();
                break;
        }

        if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) return;

        const keybind = [...modifiers, mainKey].join('+');
        handleKeybindChange(action, keybind);
        (e.target as HTMLInputElement).blur();
    };

    return (
        <div className="p-3 max-w-[700px] mx-auto space-y-3 overflow-y-auto max-h-full pb-20" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {/* AI Profile & Behavior */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    AI Profile & Behavior
                </h3>
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs text-white/80 mb-1.5 block">
                            Profile Type
                            <span className="ml-2 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                ✓ {profiles.find(p => p.value === selectedProfile)?.name}
                            </span>
                        </Label>
                        <select
                            value={selectedProfile}
                            onChange={(e) => {
                                onProfileChange(e.target.value);
                                localStorage.setItem('selectedProfile', e.target.value);
                            }}
                            className="w-full glass-panel border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white bg-black/30"
                        >
                            {profiles.map(profile => (
                                <option key={profile.value} value={profile.value}>{profile.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs text-white/80 mb-1.5 block">Custom AI Instructions</Label>
                        <Textarea
                            placeholder={`Add specific instructions for how you want the AI to behave during ${profileNames[selectedProfile] || 'this interaction'}...`}
                            value={customPrompt}
                            onChange={(e) => {
                                setCustomPrompt(e.target.value);
                                localStorage.setItem('customPrompt', e.target.value);
                            }}
                            className="glass-panel border-white/20 min-h-[80px]"
                        />
                        <p className="text-[11px] text-white/50 mt-1">
                            Personalize the AI's behavior with specific instructions
                        </p>
                    </div>
                </div>
            </section>

            {/* Audio & Microphone */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Audio & Microphone
                </h3>
                <div>
                    <Label className="text-xs text-white/80 mb-1.5 block">Audio Mode</Label>
                    <select
                        value={audioMode}
                        onChange={(e) => {
                            setAudioMode(e.target.value);
                            localStorage.setItem('audioMode', e.target.value);
                        }}
                        className="w-full glass-panel border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white bg-black/30"
                    >
                        <option value="speaker_only">Speaker Only (Interviewer)</option>
                        <option value="mic_only">Microphone Only (Me)</option>
                        <option value="both">Both Speaker & Microphone</option>
                    </select>
                    <p className="text-[11px] text-white/50 mt-1">Choose which audio sources to capture</p>
                </div>
            </section>

            {/* Language & Audio */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Language & Audio
                </h3>
                <div>
                    <Label className="text-xs text-white/80 mb-1.5 block">
                        Speech Language
                        <span className="ml-2 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                            ✓ {languages.find(l => l.value === selectedLanguage)?.name}
                        </span>
                    </Label>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => {
                            onLanguageChange(e.target.value);
                            localStorage.setItem('selectedLanguage', e.target.value);
                        }}
                        className="w-full glass-panel border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white bg-black/30"
                    >
                        {languages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.name}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Interface Layout */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Interface Layout
                </h3>
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs text-white/80 mb-1.5 block">Layout Mode</Label>
                        <select
                            value={layoutMode}
                            onChange={(e) => {
                                onLayoutModeChange(e.target.value);
                                localStorage.setItem('layoutMode', e.target.value);
                            }}
                            className="w-full glass-panel border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white bg-black/30"
                        >
                            <option value="normal">Normal</option>
                            <option value="compact">Compact</option>
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs text-white/80">Background Transparency</Label>
                            <span className="text-[11px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 font-mono">
                                {Math.round(backgroundTransparency * 100)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={backgroundTransparency}
                            onChange={(e) => handleBackgroundTransparencyChange(parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-[10px] text-white/50 mt-1">
                            <span>Transparent</span>
                            <span>Opaque</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs text-white/80">Response Font Size</Label>
                            <span className="text-[11px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 font-mono">
                                {fontSize}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min="12"
                            max="32"
                            step="1"
                            value={fontSize}
                            onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-[10px] text-white/50 mt-1">
                            <span>12px</span>
                            <span>32px</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Screen Capture Settings */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Screen Capture Settings
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-white/80 mb-1.5 block">Capture Interval</Label>
                        <select
                            value={selectedScreenshotInterval}
                            onChange={(e) => {
                                onScreenshotIntervalChange(e.target.value);
                                localStorage.setItem('selectedScreenshotInterval', e.target.value);
                            }}
                            className="w-full glass-panel border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white bg-black/30"
                        >
                            <option value="manual">Manual</option>
                            <option value="1">Every 1 second</option>
                            <option value="2">Every 2 seconds</option>
                            <option value="5">Every 5 seconds</option>
                            <option value="10">Every 10 seconds</option>
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs text-white/80 mb-1.5 block">Image Quality</Label>
                        <select
                            value={selectedImageQuality}
                            onChange={(e) => onImageQualityChange(e.target.value)}
                            className="w-full glass-panel border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white bg-black/30"
                        >
                            <option value="high">High Quality</option>
                            <option value="medium">Medium Quality</option>
                            <option value="low">Low Quality</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Keyboard Shortcuts
                </h3>
                <div className="space-y-2">
                    {keybindActions.map(action => (
                        <div key={action.key} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                            <div>
                                <div className="text-xs font-medium text-white">{action.name}</div>
                                <div className="text-[10px] text-white/50">{action.description}</div>
                            </div>
                            <Input
                                type="text"
                                value={keybinds[action.key] || ''}
                                onKeyDown={(e) => handleKeybindInput(e, action.key)}
                                onFocus={(e) => e.target.select()}
                                readOnly
                                className="w-[120px] text-center text-xs font-mono glass-panel border-white/20"
                            />
                        </div>
                    ))}
                    <div className="pt-2 border-t border-white/10">
                        <Button variant="glass" size="sm" onClick={resetKeybinds}>
                            Reset to Defaults
                        </Button>
                    </div>
                </div>
            </section>

            {/* Google Search */}
            <section className="glass p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Google Search
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-xs text-white/80">Enable Google Search</Label>
                        <p className="text-[11px] text-white/50 mt-0.5">Allow AI to search for up-to-date information</p>
                    </div>
                    <Switch
                        checked={googleSearchEnabled}
                        onCheckedChange={(checked) => {
                            setGoogleSearchEnabled(checked);
                            localStorage.setItem('googleSearchEnabled', checked.toString());
                        }}
                    />
                </div>
            </section>

            {/* Settings Note */}
            <div className="text-center text-[10px] text-white/40 italic p-2 bg-white/5 rounded-lg border border-white/10">
                💡 Settings are automatically saved as you change them
            </div>

            {/* Advanced Mode (Danger Zone) */}
            <section className="glass p-4 rounded-xl border-red-500/30 bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-red-500 rounded-full" />
                    ⚠️ Advanced Mode
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-xs text-white/80">Enable Advanced Mode</Label>
                        <p className="text-[11px] text-white/50 mt-0.5">Unlock experimental features and developer tools</p>
                    </div>
                    <Switch
                        checked={advancedMode}
                        onCheckedChange={(checked) => {
                            onAdvancedModeChange(checked);
                            localStorage.setItem('advancedMode', checked.toString());
                        }}
                    />
                </div>
            </section>
        </div>
    );
}
