
import React, { useState, useEffect } from "react"; // Added useEffect
import { Zap, Loader2 } from "lucide-react";
import { useAppContext, InvokeLLM } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';


export function ArenaPage() {
    const { lang, apiSettings, recordTokenUsage, openErrorDialog, InvokeLLM: InvokeLLMFromContext } = useAppContext();
    const { userProfile, activePersonaId, personas, markFeatureVisited } = useUserSettings();

    const [prompt, setPrompt] = useState('');
    const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
    const [results, setResults] = useState<Array<{modelId: string, name: string, provider:string, response?: string, error?: string, cost?: number, tokens?: {incoming: number, outgoing: number}}>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const validModels = apiSettings.filter(m => m.isValid);

    const handleModelSelect = (modelId: string) => {
        setSelectedModelIds(prev =>
            prev.includes(modelId) ? prev.filter(id => id !== modelId) :
            prev.length < 4 ? [...prev, modelId] : prev
        );
    };

    const handleRunArena = async () => {
        if (!prompt.trim() || selectedModelIds.length === 0) {
            openErrorDialog(
                lang === 'he' ? 'קלט חסר' : 'Missing Input', 
                lang === 'he' ? 'אוי, שכחת להזין הנחיה או לבחור מודלים. צריך את שניהם כדי להמשיך.' : 'Oops, you forgot to enter a prompt or select models. We need both to proceed.'
            );
            return;
        }
        setIsLoading(true);
        setResults([]); 

        const personaPrompt = personas.find(p => p.id === activePersonaId)?.prompt || "";
        const systemPrompt = [userProfile?.systemPrompt, personaPrompt].filter(Boolean).join("\n\n");

        const promises = selectedModelIds.map(async modelId => {
            const modelConfig = apiSettings.find(m => m.id === modelId);
            if (!modelConfig) return { modelId, name: 'Unknown', provider: 'Unknown', error: 'Model config not found.' };

            const res = await InvokeLLMFromContext({ modelConfig, prompt, systemPrompt });
            if (res.error) {
                return { modelId, name: modelConfig.name, provider: modelConfig.provider, error: res.error };
            }
            recordTokenUsage(res.provider, res.modelId, res.usage.incomingTokens, res.usage.outgoingTokens, res.cost);
            return { modelId, name: modelConfig.name, provider: modelConfig.provider, response: res.message, cost: res.cost, tokens: res.usage };
        });

        const newResults = await Promise.all(promises);
        setResults(newResults as any[]);
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{lang === 'he' ? 'זירת השוואות מודלים' : 'Model Comparison Arena'}</CardTitle>
                    <CardDescription>{lang === 'he' ? 'הרץ את אותה הנחיה על מספר מודלים במקביל והשווה תוצאות ועלויות.' : 'Run the same prompt on multiple models simultaneously and compare results and costs.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <Label htmlFor="arena-prompt">{lang === 'he' ? 'הנחיה להרצה' : 'Prompt to Run'}</Label>
                        <Textarea id="arena-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder={lang === 'he' ? 'הזן את ההנחיה שלך כאן...' : 'Enter your prompt here...'}/>
                    </div>
                    <div>
                        <Label>{lang === 'he' ? `בחר מודלים (עד 4)` : `Select Models (up to 4)`}</Label>
                        {validModels.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                                {validModels.map(model => (
                                    <Button
                                        key={model.id}
                                        variant={selectedModelIds.includes(model.id) ? 'default' : 'outline'}
                                        onClick={() => handleModelSelect(model.id)}
                                        disabled={selectedModelIds.length >= 4 && !selectedModelIds.includes(model.id)}
                                        className="text-xs justify-start p-2 h-auto text-left"
                                    >
                                        <div className="flex flex-col items-start w-full">
                                           <span className="font-medium text-sm">{model.name}</span>
                                           <span className="text-[var(--text-secondary)] text-[10px]">{model.modelId}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        ): (
                             <p className="text-sm text-[var(--text-secondary)]">{lang === 'he' ? 'אוי, לא מצאתי מודלים תקינים. כדאי לבדוק את הגדרות ה-API.' : 'Oops, no valid models found. Might want to check the API settings.'}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRunArena} disabled={isLoading || !prompt.trim() || selectedModelIds.length === 0} variant="default">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin me-1.5"/> : <Zap className="w-4 h-4 me-1.5"/>}
                        {lang === 'he' ? 'הרץ השוואה' : 'Run Comparison'}
                    </Button>
                </CardFooter>
            </Card>

            {results.length > 0 && (
                <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedModelIds.length > 2 ? 'lg:grid-cols-' + Math.min(selectedModelIds.length, 4) : ''} gap-3`}>
                    {results.map(result => (
                        <Card key={result.modelId}>
                            <CardHeader className="py-3 px-3">
                                <CardTitle className="text-base">{result.name} <span className="text-xs text-[var(--text-secondary)]">({result.provider})</span></CardTitle>
                                {result.cost !== undefined && result.tokens && (
                                    <CardDescription className="text-xs">
                                        {lang === 'he' ? 'עלות:' : 'Cost:'} ${result.cost.toFixed(5)} | {lang === 'he' ? 'טוקנים (נ/י):' : 'Tokens (I/O):'} {result.tokens.incoming.toLocaleString()}/{result.tokens.outgoing.toLocaleString()}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="text-sm max-h-80 overflow-y-auto whitespace-pre-wrap p-3">
                                {result.error ? <p className="text-[var(--error)]">{result.error}</p> : <p>{result.response}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
