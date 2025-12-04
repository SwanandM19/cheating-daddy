import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

export function AdvancedView() {
    const [isClearing, setIsClearing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
    const [throttleTokens, setThrottleTokens] = useState(true);
    const [maxTokensPerMin, setMaxTokensPerMin] = useState(1000000);
    const [throttleAtPercent, setThrottleAtPercent] = useState(75);
    const [contentProtection, setContentProtection] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        const savedThrottleTokens = localStorage.getItem('throttleTokens');
        const savedMaxTokens = localStorage.getItem('maxTokensPerMin');
        const savedThrottlePercent = localStorage.getItem('throttleAtPercent');
        const savedContentProtection = localStorage.getItem('contentProtection');

        if (savedThrottleTokens !== null) setThrottleTokens(savedThrottleTokens === 'true');
        if (savedMaxTokens !== null) setMaxTokensPerMin(parseInt(savedMaxTokens, 10) || 1000000);
        if (savedThrottlePercent !== null) setThrottleAtPercent(parseInt(savedThrottlePercent, 10) || 75);
        if (savedContentProtection !== null) setContentProtection(savedContentProtection === 'true');
    };

    const handleThrottleTokensChange = (checked: boolean) => {
        setThrottleTokens(checked);
        localStorage.setItem('throttleTokens', checked.toString());
    };

    const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setMaxTokensPerMin(value);
            localStorage.setItem('maxTokensPerMin', value.toString());
        }
    };

    const handleThrottlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            setThrottleAtPercent(value);
            localStorage.setItem('throttleAtPercent', value.toString());
        }
    };

    const resetRateLimitSettings = () => {
        setThrottleTokens(true);
        setMaxTokensPerMin(1000000);
        setThrottleAtPercent(75);
        localStorage.removeItem('throttleTokens');
        localStorage.removeItem('maxTokensPerMin');
        localStorage.removeItem('throttleAtPercent');
    };

    const handleContentProtectionChange = async (checked: boolean) => {
        setContentProtection(checked);
        localStorage.setItem('contentProtection', checked.toString());
        if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            try {
                await ipcRenderer.invoke('update-content-protection', checked);
            } catch (error) {
                console.error('Failed to update content protection:', error);
            }
        }
    };

    const clearLocalData = async () => {
        if (isClearing) return;
        setIsClearing(true);
        setStatusMessage('');
        setStatusType('');

        try {
            localStorage.clear();
            sessionStorage.clear();
            const databases = await indexedDB.databases();
            const clearPromises = databases.map(db => {
                return new Promise<void>((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name!);
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                    deleteReq.onblocked = () => {
                        console.warn(`Deletion of database ${db.name} was blocked`);
                        resolve();
                    };
                });
            });
            await Promise.all(clearPromises);
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            setStatusMessage(`✅ Successfully cleared all local data (${databases.length} databases, localStorage, sessionStorage, and caches)`);
            setStatusType('success');
            setTimeout(() => {
                setStatusMessage('🔄 Closing application...');
                setTimeout(async () => {
                    if ((window as any).require) {
                        const { ipcRenderer } = (window as any).require('electron');
                        await ipcRenderer.invoke('quit-application');
                    }
                }, 1000);
            }, 2000);
        } catch (error: any) {
            console.error('Error clearing data:', error);
            setStatusMessage(`❌ Error clearing data: ${error.message}`);
            setStatusType('error');
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="p-3 max-w-[700px] mx-auto space-y-3 overflow-y-auto max-h-full pb-20">
            {/* Content Protection Section */}
            <section className="glass-panel p-4 rounded-xl border border-white/20">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    🔒 Content Protection
                </h3>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">
                    Content protection makes the application window invisible to screen sharing and recording software. 
                    This is useful for privacy when sharing your screen, but may interfere with certain display setups like DisplayLink.
                </p>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                    <div>
                        <Label className="text-xs text-white/80">Enable content protection (stealth mode)</Label>
                        <p className="text-[11px] text-white/50 mt-0.5">
                            {contentProtection 
                                ? 'The application is currently invisible to screen sharing and recording software.' 
                                : 'The application is currently visible to screen sharing and recording software.'}
                        </p>
                    </div>
                    <Switch checked={contentProtection} onCheckedChange={handleContentProtectionChange} />
                </div>
            </section>

            {/* Rate Limiting Section */}
            <section className="glass-panel p-4 rounded-xl border border-white/20">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    ⏱️ Rate Limiting
                </h3>
                
                {/* Warning Box */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 flex gap-2 text-[11px] text-yellow-400">
                    <span>⚠️</span>
                    <span>
                        <strong>Warning:</strong> Don't mess with these settings if you don't know what this is about. 
                        Incorrect rate limiting settings may cause the application to stop working properly or hit API limits unexpectedly.
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-xs text-white/80">Throttle tokens when close to rate limit</Label>
                        <Switch checked={throttleTokens} onCheckedChange={handleThrottleTokensChange} />
                    </div>

                    <div className={cn("space-y-3 transition-opacity", !throttleTokens && "opacity-50 pointer-events-none")}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-white/80 mb-1.5 block">Max Allowed Tokens Per Minute</Label>
                                <Input
                                    type="number"
                                    value={maxTokensPerMin}
                                    onChange={handleMaxTokensChange}
                                    min={1000}
                                    max={10000000}
                                    step={1000}
                                    disabled={!throttleTokens}
                                    className="glass-panel border-white/20"
                                />
                                <p className="text-[10px] text-white/50 mt-1">Maximum tokens allowed per minute before throttling</p>
                            </div>
                            <div>
                                <Label className="text-xs text-white/80 mb-1.5 block">Throttle At Percent</Label>
                                <Input
                                    type="number"
                                    value={throttleAtPercent}
                                    onChange={handleThrottlePercentChange}
                                    min={1}
                                    max={99}
                                    step={1}
                                    disabled={!throttleTokens}
                                    className="glass-panel border-white/20"
                                />
                                <p className="text-[10px] text-white/50 mt-1">
                                    Start throttling at {throttleAtPercent}% = {Math.floor((maxTokensPerMin * throttleAtPercent) / 100)} tokens
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                            <Button variant="glass" size="sm" onClick={resetRateLimitSettings} disabled={!throttleTokens}>
                                Reset to Defaults
                            </Button>
                            <p className="text-[10px] text-white/50 mt-2">Reset rate limiting settings to default values</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Management Section (Danger Zone) */}
            <section className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-red-500 rounded-full" />
                    🗑️ Data Management
                </h3>
                
                {/* Danger Box */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex gap-2 text-[11px] text-red-400">
                    <span>⚠️</span>
                    <span>
                        <strong>Important:</strong> This action will permanently delete all local data and cannot be undone.
                    </span>
                </div>

                <Button 
                    variant="destructive" 
                    onClick={clearLocalData} 
                    disabled={isClearing}
                    className="bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                >
                    {isClearing ? '🔄 Clearing...' : '🗑️ Clear All Local Data'}
                </Button>

                {statusMessage && (
                    <div className={cn(
                        "mt-3 p-2.5 rounded-lg text-[11px] font-medium",
                        statusType === 'success' 
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                        {statusMessage}
                    </div>
                )}
            </section>
        </div>
    );
}
