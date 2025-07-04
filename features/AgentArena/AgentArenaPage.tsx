
import React, { useState, useEffect } from "react"; // Added useEffect
import { Play, Loader2 } from "lucide-react";
import { useAppContext, InvokeLLM } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';


export function AgentArenaPage() {
    const { lang, apiSettings, openErrorDialog, InvokeLLM: InvokeLLMFromContext } = useAppContext(); 
    const { agents, userProfile, activePersonaId, personas, markFeatureVisited } = useUserSettings();

    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [task, setTask] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agentRunLog, setAgentRunLog] = useState<Array<{type: 'thought' | 'action' | 'observation' | 'final_answer' | 'error', content: string, tool?: string, toolInput?: string}>>([]);
    
    const handleRunAgent = async () => {
        if (!selectedAgentId || !task.trim()) {
            openErrorDialog(
                lang === 'he' ? 'קלט חסר' : 'Missing Input', 
                lang === 'he' ? 'אוי, נראה שצריך לבחור סוכן ולהזין משימה כדי להתחיל.' : 'Oops, it looks like you need to select an agent and enter a task to begin.'
            );
            return;
        }
        const agentConfig = agents.find(a => a.id === selectedAgentId);
        const modelConfig = apiSettings.find(m => m.id === agentConfig?.modelId);

        if (!agentConfig || !modelConfig || !modelConfig.isValid) {
            openErrorDialog(
                lang === 'he' ? 'תצורת סוכן שגויה' : 'Agent Configuration Error', 
                lang === 'he' ? 'הממ, הסוכן או המודל שלו לא מוגדרים כמו שצריך או לא תקינים. כדאי לבדוק.' : 'Hmm, the agent or its model isn\'t configured correctly or isn\'t valid. Worth checking!'
            );
            return;
        }

        setIsLoading(true);
        setAgentRunLog([{ type: 'thought', content: `Starting agent "${agentConfig.name}" with task: ${task}` }]);

        let currentPrompt = `Goal: ${agentConfig.goal}\nTask: ${task}\n\nAvailable tools: ${agentConfig.tools.join(', ')}. Use tools by outputting a JSON block: {"tool": "tool_name", "tool_input": "input for tool"}. For final answer: {"final_answer": "your answer"}.\n\nBegin!`;
        const maxIterations = 5;
        let iteration = 0;
        let finalAnswer = null;

        while (iteration < maxIterations && !finalAnswer) {
            iteration++;
            setAgentRunLog(prev => [...prev, { type: 'thought', content: `Iteration ${iteration}. Current prompt for LLM: ${currentPrompt.substring(0, 200)}...` }]);

            const personaPrompt = personas.find(p => p.id === activePersonaId)?.prompt || "";
            const systemPrompt = [userProfile?.systemPrompt, personaPrompt, agentConfig.goal].filter(Boolean).join("\n\n");

            const llmResponse = await InvokeLLMFromContext({ modelConfig, prompt: currentPrompt, systemPrompt });

            if (llmResponse.error) {
                setAgentRunLog(prev => [...prev, { type: 'error', content: `LLM Error: ${llmResponse.error}` }]);
                break;
            }

            setAgentRunLog(prev => [...prev, { type: 'thought', content: `LLM raw response: ${llmResponse.message}` }]);

            try {
                const actionRegex = /```json\s*([\s\S]*?)\s*```/;
                const match = llmResponse.message.match(actionRegex);
                let parsedAction = null;
                if(match && match[1]) {
                    parsedAction = JSON.parse(match[1]);
                } else {
                    try { parsedAction = JSON.parse(llmResponse.message); } catch (e) {}
                }

                if (parsedAction?.final_answer) {
                    finalAnswer = parsedAction.final_answer;
                    setAgentRunLog(prev => [...prev, { type: 'final_answer', content: finalAnswer as string }]);
                    break;
                } else if (parsedAction?.tool && parsedAction?.tool_input !== undefined) {
                    const toolName = parsedAction.tool;
                    const toolInput = parsedAction.tool_input;
                    setAgentRunLog(prev => [...prev, { type: 'action', content: `Using tool: ${toolName}`, tool: toolName, toolInput: String(toolInput) }]);

                    let observation = `Observation: Executed tool ${toolName}. `;
                    if (toolName === 'webSearch' && agentConfig.tools.includes('webSearch')) {
                        observation += `Simulated search results for "${toolInput}": Found 3 articles about recent developments.`;
                    } else if (toolName === 'fileReader' && agentConfig.tools.includes('fileReader')) {
                        observation += `Simulated file content for "${toolInput}": The document contains data about market trends.`;
                    } else {
                        observation += `Tool "${toolName}" is not available or recognized by simulation.`;
                    }
                    setAgentRunLog(prev => [...prev, { type: 'observation', content: observation }]);
                    currentPrompt = `${llmResponse.message}\n${observation}`;
                } else {
                    setAgentRunLog(prev => [...prev, { type: 'thought', content: `Could not parse action. LLM response: ${llmResponse.message}` }]);
                    currentPrompt = llmResponse.message + "\nObservation: Could not parse a valid action from your last response. Please use the specified JSON format for tools or final answer.";
                }

            } catch (e: any) {
                setAgentRunLog(prev => [...prev, { type: 'error', content: `Error parsing LLM action: ${e.message}. LLM response: ${llmResponse.message}` }]);
                currentPrompt = llmResponse.message + "\nObservation: Your last response was not valid JSON. Please use the specified JSON format.";
            }
             await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!finalAnswer && iteration >= maxIterations) {
            setAgentRunLog(prev => [...prev, { type: 'error', content: 'Agent reached max iterations without a final answer.' }]);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{lang === 'he' ? 'זירת הפעלת סוכנים' : 'Agent Operation Arena'}</CardTitle>
                    <CardDescription>{lang === 'he' ? 'הפעל סוכנים אוטונומיים לביצוע משימות מורכבות.' : 'Run autonomous agents to perform complex tasks.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <Label htmlFor="agent-select">{lang === 'he' ? 'בחר סוכן' : 'Select Agent'}</Label>
                        <Select id="agent-select" value={selectedAgentId || ''} onChange={e => setSelectedAgentId(e.target.value || null)}>
                            <option value="">{lang === 'he' ? 'בחר...' : 'Select...'}</option>
                            {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                        </Select>
                    </div>
                    {selectedAgentId && agents.find(a=>a.id === selectedAgentId) && (
                        <div className="text-sm p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md">
                            <p><strong>{lang === 'he' ? 'מטרת הסוכן:' : 'Agent Goal:'}</strong> {agents.find(a=>a.id === selectedAgentId)?.goal}</p>
                            <p><strong>{lang === 'he' ? 'כלים זמינים:' : 'Tools:'}</strong> {agents.find(a=>a.id === selectedAgentId)?.tools.join(', ')}</p>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="agent-task">{lang === 'he' ? 'משימה לסוכן' : 'Task for Agent'}</Label>
                        <Textarea id="agent-task" value={task} onChange={e => setTask(e.target.value)} rows={3} placeholder={lang === 'he' ? 'הזן את המשימה שלך כאן...' : 'Enter your task here...'}/>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleRunAgent} disabled={isLoading || !selectedAgentId || !task.trim()} variant="default">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin me-1.5"/> : <Play className="w-4 h-4 me-1.5"/>}
                        {lang === 'he' ? 'הפעל סוכן' : 'Run Agent'}
                    </Button>
                </CardFooter>
            </Card>

            {agentRunLog.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-base">{lang === 'he' ? 'יומן ריצת סוכן' : 'Agent Run Log'}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm max-h-[400px] overflow-y-auto p-3">
                        {agentRunLog.map((entry, index) => (
                            <div key={index} className={`p-2 rounded-md text-xs border ${
                                entry.type === 'thought' ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--text-primary)]' :
                                entry.type === 'action' ? 'bg-yellow-500/10 border-yellow-500/20 text-[var(--text-primary)]' :
                                entry.type === 'observation' ? 'bg-[var(--border)]/30 border-[var(--border)]/50 text-[var(--text-secondary)]' :
                                entry.type === 'final_answer' ? 'bg-green-500/10 border-green-500/20 text-green-400 font-medium' :
                                entry.type === 'error' ? 'bg-[var(--error)]/10 border-[var(--error)]/20 text-[var(--error)]' : 'border-[var(--border)]'
                            }`}>
                                <strong className="capitalize">{entry.type.replace('_', ' ')}:</strong>
                                {entry.tool && <span className="font-mono text-[10px] ms-1"> ({entry.tool}{entry.toolInput ? `: ${String(entry.toolInput).substring(0,50)}...` : ''})</span>}
                                <p className="whitespace-pre-wrap mt-0.5">{entry.content}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
