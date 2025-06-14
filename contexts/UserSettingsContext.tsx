
import React, { createContext, useContext, useState, useEffect } from "react";
import { mockStorage } from '../utils/storage'; // *** ייבוא חדש ***
// ApiSetting, ChatMessageItem, TokenUsage might not be needed here if not directly used
// For now, keeping AppCustomization definition here as it's core to UserSettings

// --- Type Definitions (specific to UserSettings or re-exported/defined) ---
export interface AppCustomization { headerBgColor?: string; headerTitleColor?: string; chatBgColor?: string; chatFontColor?: string; chatFontSize?: number; botVoiceURI?: string | null; userName?: string; userImage?: string | null; botName?: string; botImage?: string | null; systemPrompt?: string; }
export interface SavedPrompt { id: string; title: string; content: string; order: number; }
export interface Persona { id: string; name: string; prompt: string; order: number; isDefault?: boolean; }
export interface SpaceFile { id: string; name: string; type: string; size: number; uploadedAt: string; content: string; dataUrl?: string; }
export interface Space { id: string; name: string; description?: string; files?: SpaceFile[]; }
export interface Agent { id: string; name: string; goal: string; modelId: string; tools: string[]; }
export interface CostManagement { dailyBudget: number; weeklyBudget: number; monthlyBudget: number; alertEmail: string; }


// --- Storage Instances (specific to UserSettingsContext) ---
export const initialAppCustomizationData: AppCustomization = { 
    headerBgColor: '#2c3e50', 
    headerTitleColor: '#ecf0f1',
    chatBgColor: '#f4f6f8', 
    chatFontColor: '#34495e',
    chatFontSize: 14, 
    botVoiceURI: null, // This is fine as Select component handles null
    userName: 'User', 
    userImage: null, 
    botName: 'LUMINA', 
    botImage: null, 
    systemPrompt: 'You are a helpful AI assistant.' 
};

const AppCustomizationStorage = mockStorage<AppCustomization>('app_customization_v2', initialAppCustomizationData);
const SavedPromptsStorage = mockStorage<SavedPrompt>('saved_prompts_v2', [
    { id: 'news_il', title: 'חדשות אחרונות בישראל', content: 'מהן החדשות האחרונות בישראל ביממה האחרונה?', order: 0 },
    { id: 'translate_he_en', title: 'תרגום מעברית לאנגלית', content: 'תרגם את הטקסט הבא מעברית לאנגלית: ', order: 1 },
    { id: 'translate_en_he', title: 'תרגום מאנגלית לעברית', content: 'תרגם את הטקסט הבא מאנגלית לעברית: ', order: 2 },
    { id: 'rephrase', title: 'הצע 5 ניסוחים אחרים', content: 'הצע 5 ניסוחים שונים למשפט הבא: ', order: 3 },
]);
const PersonasStorage = mockStorage<Persona>('personas_v2', [{id: 'default', name: 'Default Assistant', prompt: 'You are a general-purpose AI assistant.', order: 0, isDefault: true}]);
const SpacesStorage = mockStorage<Space>('spaces_v2', []);
const AgentsStorage = mockStorage<Agent>('agents_v2', []);

const initialCostManagementData: CostManagement = { dailyBudget: 0, weeklyBudget: 0, monthlyBudget: 0, alertEmail: '' };
const CostManagementStorage = mockStorage<CostManagement>('cost_management_v2', initialCostManagementData);


// --- UserSettingsContext Definition ---
interface UserSettingsContextType {
    userProfile: AppCustomization | null;
    setUserProfile: (profile: AppCustomization) => Promise<void>;
    savedPrompts: SavedPrompt[];
    setSavedPrompts: (prompts: SavedPrompt[]) => Promise<void>;
    addSavedPrompt: (prompt: Omit<SavedPrompt, 'id' | 'order'>) => Promise<SavedPrompt>;
    updateSavedPrompt: (promptId: string, updates: Partial<SavedPrompt>) => Promise<SavedPrompt>;
    deleteSavedPrompt: (promptId: string) => Promise<void>;
    reorderSavedPrompts: (prompts: SavedPrompt[]) => Promise<void>;
    personas: Persona[];
    setPersonas: (personas: Persona[]) => Promise<void>;
    addPersona: (persona: Omit<Persona, 'id' | 'order'>) => Promise<Persona>;
    updatePersona: (personaId: string, updates: Partial<Persona>) => Promise<Persona>;
    deletePersona: (personaId: string) => Promise<void>;
    reorderPersonas: (personas: Persona[]) => Promise<void>;
    activePersonaId: string | null;
    setActivePersonaId: (id: string | null) => void;
    spaces: Space[];
    loadSpaces: () => Promise<void>;
    addSpace: (space: Omit<Space, 'id'>) => Promise<Space>;
    updateSpace: (spaceId: string, updates: Partial<Space>) => Promise<Space>;
    deleteSpace: (spaceId: string) => Promise<void>;
    activeSpaceId: string | null;
    setActiveSpaceId: (id: string | null) => void;
    addFileToSpace: (spaceId: string, file: Omit<SpaceFile, 'id' | 'uploadedAt'>) => Promise<Space | null>;
    removeFileFromSpace: (spaceId: string, fileId: string) => Promise<Space | null>;
    agents: Agent[];
    loadAgents: () => Promise<void>;
    addAgent: (agent: Omit<Agent, 'id'>) => Promise<Agent>;
    updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<Agent>;
    deleteAgent: (agentId: string) => Promise<void>;
    costManagement: CostManagement;
    setCostManagements: (settings: CostManagement) => Promise<void>;
}
const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

export const useUserSettings = () => {
    const context = useContext(UserSettingsContext);
    if (context === null) {
        throw new Error("useUserSettings must be used within a UserSettingsProvider");
    }
    return context;
};

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfileState] = useState<AppCustomization | null>(null);
    const [savedPrompts, setSavedPromptsState] = useState<SavedPrompt[]>([]);
    const [personas, setPersonasState] = useState<Persona[]>([]);
    const [activePersonaId, setActivePersonaIdState] = useState<string | null>(null);
    const [spaces, setSpacesState] = useState<Space[]>([]);
    const [activeSpaceId, setActiveSpaceIdState] = useState<string | null>(null);
    const [agents, setAgentsState] = useState<Agent[]>([]);
    const [costManagement, setCostManagementState] = useState<CostManagement>(initialCostManagementData);

    useEffect(() => {
        const loadAllUserSettings = async () => {
            const [profileData, promptsData, personasData, spacesData, agentsData, costManagementData] = await Promise.all([
                AppCustomizationStorage.getSingle(),
                SavedPromptsStorage.list(),
                PersonasStorage.list(),
                SpacesStorage.list(),
                AgentsStorage.list(),
                CostManagementStorage.getSingle(),
            ]);

            setUserProfileState(profileData || initialAppCustomizationData);
            setSavedPromptsState(promptsData.sort((a,b) => a.order - b.order));
            setPersonasState(personasData.sort((a,b) => a.order - b.order));
            const defaultPersona = personasData.find(p => p.isDefault) || (personasData.length > 0 ? personasData[0] : null);
            if (defaultPersona) setActivePersonaIdState(defaultPersona.id);

            setSpacesState(spacesData);
            const storedActiveSpaceId = localStorage.getItem('activeSpaceId_v2');
            if (storedActiveSpaceId && spacesData.find(s => s.id === storedActiveSpaceId)) {
                setActiveSpaceIdState(storedActiveSpaceId);
            } else if (spacesData.length > 0) {
                setActiveSpaceIdState(spacesData[0].id);
            }

            setAgentsState(agentsData);
            setCostManagementState(costManagementData || initialCostManagementData);
        };
        loadAllUserSettings();
    }, []);

    const setUserProfile = async (newProfile: AppCustomization) => {
        const updatedProfile = await AppCustomizationStorage.saveSingle(newProfile);
        setUserProfileState(updatedProfile);
    };
    const setSavedPrompts = async (newPrompts: SavedPrompt[]) => {
        await Promise.all(newPrompts.map(async (p, index) => await SavedPromptsStorage.upsert({...p, order: index})));
        setSavedPromptsState(newPrompts.sort((a,b) => a.order - b.order));
    };
    const addSavedPrompt = async (prompt: Omit<SavedPrompt, 'id' | 'order'>) => {
        const newPrompt = await SavedPromptsStorage.upsert({...prompt, order: savedPrompts.length} as SavedPrompt);
        setSavedPromptsState(prev => [...prev, newPrompt].sort((a,b) => a.order - b.order));
        return newPrompt;
    };
    const updateSavedPrompt = async (promptId: string, updates: Partial<SavedPrompt>) => {
        const existingPrompt = await SavedPromptsStorage.get(promptId);
        if (!existingPrompt) throw new Error("Prompt not found");
        const updatedPrompt = await SavedPromptsStorage.upsert({ ...existingPrompt, ...updates, id: promptId });
        setSavedPromptsState(prev => prev.map(p => p.id === promptId ? updatedPrompt : p).sort((a,b) => a.order - b.order));
        return updatedPrompt;
    };
    const deleteSavedPrompt = async (promptId: string) => {
        await SavedPromptsStorage.delete(promptId);
        setSavedPromptsState(prev => prev.filter(p => p.id !== promptId));
    };
     const reorderSavedPrompts = async (reorderedPrompts: SavedPrompt[]) => {
        const updatedPrompts = await Promise.all(reorderedPrompts.map(async (prompt, index) => {
            return SavedPromptsStorage.upsert({ ...prompt, order: index });
        }));
        setSavedPromptsState(updatedPrompts.sort((a, b) => a.order - b.order));
    };

    const setPersonas = async (newPersonas: Persona[]) => {
        await Promise.all(newPersonas.map(async (p, index) => await PersonasStorage.upsert({...p, order: index})));
        setPersonasState(newPersonas.sort((a,b) => a.order - b.order));
    };
    const addPersona = async (persona: Omit<Persona, 'id'|'order'>) => {
        const newPersona = await PersonasStorage.upsert({...persona, order: personas.length} as Persona);
        setPersonasState(prev => [...prev, newPersona].sort((a,b) => a.order - b.order));
        return newPersona;
    };
    const updatePersona = async (personaId: string, updates: Partial<Persona>) => {
        const existingPersona = await PersonasStorage.get(personaId);
        if (!existingPersona) throw new Error("Persona not found");
        const updatedPersona = await PersonasStorage.upsert({ ...existingPersona, ...updates, id: personaId });

        let newPersonas = personas.map(p => p.id === personaId ? updatedPersona : p);
        if (updates.isDefault) {
            newPersonas = newPersonas.map(p => p.id === personaId ? updatedPersona : {...p, isDefault: false});
            await Promise.all(
                personas.filter(p => p.id !== personaId && p.isDefault)
                        .map(async p => await PersonasStorage.upsert({ ...p, isDefault: false }))
            );
        }
        setPersonasState(newPersonas.sort((a,b) => a.order - b.order));
        return updatedPersona;
    };
    const deletePersona = async (personaId: string) => {
        await PersonasStorage.delete(personaId);
        const remainingPersonas = personas.filter(p => p.id !== personaId);
        setPersonasState(remainingPersonas);
        if(activePersonaId === personaId) setActivePersonaIdState(remainingPersonas.find(p => p.isDefault)?.id || (remainingPersonas.length > 0 ? remainingPersonas[0].id : null));
    };
    const reorderPersonas = async (reorderedPersonas: Persona[]) => {
        const updatedPersonas = await Promise.all(reorderedPersonas.map(async (p, index) => {
            return PersonasStorage.upsert({ ...p, order: index });
        }));
        setPersonasState(updatedPersonas.sort((a,b) => a.order - b.order));
    };
    const _setActivePersonaIdInternal = (id: string | null) => setActivePersonaIdState(id);


    const loadSpaces = async () => setSpacesState(await SpacesStorage.list());
    const addSpace = async (space: Omit<Space, 'id'>) => {
        const newSpace = await SpacesStorage.upsert(space as Space);
        setSpacesState(prev => [...prev, newSpace]);
        return newSpace;
    };
    const updateSpace = async (spaceId: string, updates: Partial<Space>) => {
        const existingSpace = await SpacesStorage.get(spaceId);
        if(!existingSpace) throw new Error("Space not found");
        const updatedSpace = await SpacesStorage.upsert({ ...existingSpace, ...updates, id: spaceId });
        setSpacesState(prev => prev.map(s => s.id === spaceId ? updatedSpace : s));
        return updatedSpace;
    };
    const _setActiveSpaceIdInternal = (id: string | null) => {
        setActiveSpaceIdState(id);
        if (id) localStorage.setItem('activeSpaceId_v2', id);
        else localStorage.removeItem('activeSpaceId_v2');
    };
    const deleteSpace = async (spaceId: string) => {
        await SpacesStorage.delete(spaceId);
        const remainingSpaces = spaces.filter(s => s.id !== spaceId);
        setSpacesState(remainingSpaces);
        if (activeSpaceId === spaceId) _setActiveSpaceIdInternal(remainingSpaces.length > 0 ? remainingSpaces[0].id : null);
    };
    const addFileToSpace = async (spaceId: string, file: Omit<SpaceFile, 'id'|'uploadedAt'>) => {
        const space = await SpacesStorage.get(spaceId);
        if (!space) return null;
        const newFile = { ...file, id: `file-${Date.now()}`, uploadedAt: new Date().toISOString() };
        const updatedFiles = [...(space.files || []), newFile as SpaceFile];
        return updateSpace(spaceId, { files: updatedFiles });
    };
    const removeFileFromSpace = async (spaceId: string, fileId: string) => {
        const space = await SpacesStorage.get(spaceId);
        if (!space || !space.files) return null;
        const updatedFiles = space.files.filter(f => f.id !== fileId);
        return updateSpace(spaceId, { files: updatedFiles });
    };

    const loadAgents = async () => setAgentsState(await AgentsStorage.list());
    const addAgent = async (agent: Omit<Agent, 'id'>) => {
        const newAgent = await AgentsStorage.upsert(agent as Agent);
        setAgentsState(prev => [...prev, newAgent]);
        return newAgent;
    };
    const updateAgent = async (agentId: string, updates: Partial<Agent>) => {
        const existingAgent = await AgentsStorage.get(agentId);
        if(!existingAgent) throw new Error("Agent not found");
        const updatedAgent = await AgentsStorage.upsert({ ...existingAgent, ...updates, id: agentId });
        setAgentsState(prev => prev.map(a => a.id === agentId ? updatedAgent : a));
        return updatedAgent;
    };
    const deleteAgent = async (agentId: string) => {
        await AgentsStorage.delete(agentId);
        setAgentsState(prev => prev.filter(a => a.id !== agentId));
    };

    const setCostManagements = async (newSettings: CostManagement) => {
        const updatedSettings = await CostManagementStorage.saveSingle(newSettings);
        setCostManagementState(updatedSettings);
    };

    const value: UserSettingsContextType = {
        userProfile, setUserProfile,
        savedPrompts, setSavedPrompts, addSavedPrompt, updateSavedPrompt, deleteSavedPrompt, reorderSavedPrompts,
        personas, setPersonas, addPersona, updatePersona, deletePersona, reorderPersonas, activePersonaId, setActivePersonaId: _setActivePersonaIdInternal,
        spaces, loadSpaces, addSpace, updateSpace, deleteSpace, activeSpaceId, setActiveSpaceId: _setActiveSpaceIdInternal, addFileToSpace, removeFileFromSpace,
        agents, loadAgents, addAgent, updateAgent, deleteAgent,
        costManagement, setCostManagements
    };
    return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>;
}
