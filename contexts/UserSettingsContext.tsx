
import React, { createContext, useContext, useState, useEffect } from "react";
import { mockStorage } from '../utils/storage'; 

// --- Type Definitions ---
export interface AppCustomization { 
    headerBgColor?: string; // May be deprecated visually by new theme
    headerTitleColor?: string; // May be deprecated visually by new theme
    chatBgColor?: string; // Will be overridden by theme's --bg-primary
    chatFontColor?: string; // Will be overridden by theme's --text-primary for bot messages
    chatFontSize?: number; 
    botVoiceURI?: string | null; 
    userName?: string; 
    userImage?: string | null; 
    botName?: string; 
    botImage?: string | null; 
    systemPrompt?: string; 
    // Gamification fields
    userXP?: number;
    lastActiveDate?: string | null; // ISO date string
    dailyStreak?: number;
    badges?: string[];
    sessionActivity?: { // To track first-time page visits per session
        visitedArena?: boolean;
        visitedSpaces?: boolean;
        visitedAgentArena?: boolean;
        visitedKnowledgeBase?: boolean;
        visitedCockpit?: boolean;
    };
}
export interface SavedPrompt { id: string; title: string; content: string; order: number; }
export interface Persona { id: string; name: string; prompt: string; order: number; isDefault?: boolean; }
export interface SpaceFile { id: string; name: string; type: string; size: number; uploadedAt: string; content: string; dataUrl?: string; }
export interface Space { id: string; name: string; description?: string; files?: SpaceFile[]; }
export interface Agent { id: string; name: string; goal: string; modelId: string; tools: string[]; }
export interface CostManagement { dailyBudget: number; weeklyBudget: number; monthlyBudget: number; alertEmail: string; }

export interface KnowledgeBaseSource {
    id: string;
    title: string;
    type: 'text'; 
    content: string;
    createdAt: string;
}
export interface KnowledgeBase {
    id: string;
    name: string;
    description?: string;
    sources: KnowledgeBaseSource[];
    createdAt: string;
    updatedAt: string;
}


// --- Storage Instances ---
export const initialAppCustomizationData: AppCustomization = {
    // These colors are now primarily driven by the theme.
    // Setting them to generic values or removing if components no longer read them directly.
    headerBgColor: '#343541', // Matches dark --bg-secondary
    headerTitleColor: '#FFFFFF', // Matches dark --text-primary
    chatBgColor: '#202123',    // Matches dark --bg-primary
    chatFontColor: '#FFFFFF',  // Matches dark --text-primary
    chatFontSize: 16, // Default to 16px as per typography guidelines
    botVoiceURI: null,
    userName: 'User', 
    userImage: null,
    botName: 'LUMINA', 
    botImage: null,
    systemPrompt: 'You are a helpful AI assistant.',
    // Gamification defaults
    userXP: 0,
    lastActiveDate: null,
    dailyStreak: 0,
    badges: [],
    sessionActivity: {
        visitedArena: false,
        visitedSpaces: false,
        visitedAgentArena: false,
        visitedKnowledgeBase: false,
        visitedCockpit: false,
    },
};

const AppCustomizationStorage = mockStorage<AppCustomization>('app_customization_v3', initialAppCustomizationData); // Incremented version for new fields
const SavedPromptsStorage = mockStorage<SavedPrompt>('saved_prompts_v2', [
    { id: 'news_il', title: 'חדשות אחרונות בישראל', content: 'מהן החדשות האחרונות בישראל ביממה האחרונה?', order: 0 },
    { id: 'translate_he_en', title: 'תרגום מעברית לאנגלית', content: 'תרגם את הטקסט הבא מעברית לאנגלית: ', order: 1 },
    { id: 'translate_en_he', title: 'תרגום מאנגלית לעברית', content: 'תרגם את הטקסט הבא מאנגלית לעברית: ', order: 2 },
    { id: 'rephrase', title: 'הצע 5 ניסוחים אחרים', content: 'הצע 5 ניסוחים שונים למשפט הבא: ', order: 3 },
]);
const PersonasStorage = mockStorage<Persona>('personas_v2', [{id: 'default', name: 'Default Assistant', prompt: 'You are a general-purpose AI assistant.', order: 0, isDefault: true}]);
const SpacesStorage = mockStorage<Space>('spaces_v2', []);
const AgentsStorage = mockStorage<Agent>('agents_v2', []);
const KnowledgeBaseStorage = mockStorage<KnowledgeBase>('knowledge_bases_v1', []); 

const initialCostManagementData: CostManagement = { dailyBudget: 0, weeklyBudget: 0, monthlyBudget: 0, alertEmail: '' };
const CostManagementStorage = mockStorage<CostManagement>('cost_management_v2', initialCostManagementData);

// Badge definitions
const BADGE_DEFINITIONS: { [key: string]: { name: string; description: string; icon?: string; xpThreshold?: number } } = {
    EXPLORER: { name: "Explorer", description: "Reached 50 XP.", xpThreshold: 50 },
    COMMUNICATOR: { name: "Communicator", description: "Reached 150 XP.", xpThreshold: 150 },
    ENGAGED_USER: { name: "Engaged User", description: "Reached 300 XP.", xpThreshold: 300 },
    // Add more badges here
};

// --- UserSettingsContext Definition ---
interface UserSettingsContextType {
    userProfile: AppCustomization | null;
    setUserProfile: (profile: AppCustomization) => Promise<void>;
    updateUserProfilePartial: (updates: Partial<AppCustomization>) => Promise<void>;
    incrementXP: (amount: number) => Promise<void>;
    updateStreak: () => Promise<void>;
    markFeatureVisited: (feature: keyof NonNullable<AppCustomization['sessionActivity']>) => Promise<void>;
    resetSessionActivity: () => Promise<void>;
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
    knowledgeBases: KnowledgeBase[];
    loadKnowledgeBases: () => Promise<void>;
    addKnowledgeBase: (kb: Omit<KnowledgeBase, 'id' | 'sources' | 'createdAt' | 'updatedAt'>) => Promise<KnowledgeBase>;
    updateKnowledgeBase: (kbId: string, updates: Partial<KnowledgeBase>) => Promise<KnowledgeBase>;
    deleteKnowledgeBase: (kbId: string) => Promise<void>;
    activeKnowledgeBaseId: string | null;
    setActiveKnowledgeBaseId: (id: string | null) => void;
    addSourceToKnowledgeBase: (kbId: string, source: Omit<KnowledgeBaseSource, 'id' | 'createdAt'>) => Promise<KnowledgeBase | null>;
    removeSourceFromKnowledgeBase: (kbId: string, sourceId: string) => Promise<KnowledgeBase | null>;
    updateSourceInKnowledgeBase: (kbId: string, sourceId: string, updates: Partial<KnowledgeBaseSource>) => Promise<KnowledgeBase | null>;
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
    const [userProfile, setUserProfileState] = useState<AppCustomization | null>(initialAppCustomizationData);
    const [savedPrompts, setSavedPromptsState] = useState<SavedPrompt[]>([]);
    const [personas, setPersonasState] = useState<Persona[]>([]);
    const [activePersonaId, setActivePersonaIdState] = useState<string | null>(null);
    const [spaces, setSpacesState] = useState<Space[]>([]);
    const [activeSpaceId, setActiveSpaceIdState] = useState<string | null>(null);
    const [agents, setAgentsState] = useState<Agent[]>([]);
    const [costManagement, setCostManagementState] = useState<CostManagement>(initialCostManagementData);
    const [knowledgeBases, setKnowledgeBasesState] = useState<KnowledgeBase[]>([]);
    const [activeKnowledgeBaseId, setActiveKnowledgeBaseIdState] = useState<string | null>(null);

    const checkAndAwardBadges = (currentXP: number, currentBadges: string[]): string[] => {
        const newBadges = [...currentBadges];
        Object.entries(BADGE_DEFINITIONS).forEach(([badgeKey, badgeInfo]) => {
            if (badgeInfo.xpThreshold && currentXP >= badgeInfo.xpThreshold && !newBadges.includes(badgeKey)) {
                newBadges.push(badgeKey);
            }
        });
        return newBadges;
    };
    
    const updateUserProfilePartial = async (updates: Partial<AppCustomization>) => {
        const currentProfile = userProfile || initialAppCustomizationData;
        const newProfileData = { ...currentProfile, ...updates };
        const savedProfile = await AppCustomizationStorage.saveSingle(newProfileData);
        setUserProfileState(savedProfile);
    };

    const incrementXP = async (amount: number) => {
        const currentProfile = userProfile || initialAppCustomizationData;
        const newXP = (currentProfile.userXP || 0) + amount;
        const newBadges = checkAndAwardBadges(newXP, currentProfile.badges || []);
        await updateUserProfilePartial({ userXP: newXP, badges: newBadges });
    };

    const updateStreak = async () => {
        const currentProfile = userProfile || initialAppCustomizationData;
        const today = new Date().toISOString().split('T')[0];
        let newStreak = currentProfile.dailyStreak || 0;
        let lastActive = currentProfile.lastActiveDate;

        if (lastActive) {
            const lastDate = new Date(lastActive);
            const currentDate = new Date(today);
            const diffTime = currentDate.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak++;
            } else if (diffDays > 1) {
                newStreak = 1; // Reset streak
            }
            // If diffDays is 0, it's the same day, do nothing to streak
        } else {
            newStreak = 1; // First activity
        }
        await updateUserProfilePartial({ dailyStreak: newStreak, lastActiveDate: today });
    };

    const markFeatureVisited = async (feature: keyof NonNullable<AppCustomization['sessionActivity']>) => {
        const currentProfile = userProfile || initialAppCustomizationData;
        const currentSessionActivity = currentProfile.sessionActivity || {};
        if (!currentSessionActivity[feature]) {
            await updateUserProfilePartial({ 
                sessionActivity: { ...currentSessionActivity, [feature]: true } 
            });
            await incrementXP(10); // Award XP for visiting a new feature in session
        }
    };
    
    const resetSessionActivity = async () => {
         await updateUserProfilePartial({ sessionActivity: {} });
    };


    useEffect(() => {
        const loadAllUserSettings = async () => {
            const [profileDataFromStorage, promptsData, personasData, spacesData, agentsData, costManagementDataFromStorage, kbData] = await Promise.all([
                AppCustomizationStorage.getSingle(),
                SavedPromptsStorage.list(),
                PersonasStorage.list(),
                SpacesStorage.list(),
                AgentsStorage.list(),
                CostManagementStorage.getSingle(),
                KnowledgeBaseStorage.list(),
            ]);

            const sanitizedProfileData: AppCustomization = {
                ...initialAppCustomizationData, // Start with all defaults including gamification
                ...(profileDataFromStorage || {}), // Override with stored data
                // Ensure gamification fields have defaults if not in storage
                userXP: profileDataFromStorage?.userXP ?? initialAppCustomizationData.userXP,
                lastActiveDate: profileDataFromStorage?.lastActiveDate ?? initialAppCustomizationData.lastActiveDate,
                dailyStreak: profileDataFromStorage?.dailyStreak ?? initialAppCustomizationData.dailyStreak,
                badges: profileDataFromStorage?.badges ?? initialAppCustomizationData.badges,
                sessionActivity: profileDataFromStorage?.sessionActivity ?? initialAppCustomizationData.sessionActivity,
                // Ensure new theme defaults for visual settings if not present or if we want to override old values
                chatFontSize: profileDataFromStorage?.chatFontSize ?? initialAppCustomizationData.chatFontSize,
            };
            setUserProfileState(sanitizedProfileData);

            const sanitizedCostManagementData: CostManagement = {
                ...initialCostManagementData,
                ...(costManagementDataFromStorage || {}),
            };
            setCostManagementState(sanitizedCostManagementData);

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
            setKnowledgeBasesState(kbData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            const storedActiveKBId = localStorage.getItem('activeKnowledgeBaseId_v1');
            if (storedActiveKBId && kbData.find(kb => kb.id === storedActiveKBId)) {
                setActiveKnowledgeBaseIdState(storedActiveKBId);
            } else if (kbData.length > 0) {
                 setActiveKnowledgeBaseIdState(kbData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].id);
            }
        };
        loadAllUserSettings();
    }, []);

    const setUserProfile = async (newProfile: AppCustomization) => {
        const profileToSave: AppCustomization = {
            ...initialAppCustomizationData, // Ensure all fields have defaults
            ...userProfile, // Persist existing userProfile fields not being changed
            ...newProfile // Apply incoming new profile data
        };
        const updatedProfile = await AppCustomizationStorage.saveSingle(profileToSave);
        setUserProfileState(updatedProfile); 
    };

    // ... (rest of the existing storage functions: setSavedPrompts, addSavedPrompt, etc.)
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
        const sanitizedSettings: CostManagement = {
            dailyBudget: (newSettings.dailyBudget === null || newSettings.dailyBudget === undefined) ? 0 : Number(newSettings.dailyBudget),
            weeklyBudget: (newSettings.weeklyBudget === null || newSettings.weeklyBudget === undefined) ? 0 : Number(newSettings.weeklyBudget),
            monthlyBudget: (newSettings.monthlyBudget === null || newSettings.monthlyBudget === undefined) ? 0 : Number(newSettings.monthlyBudget),
            alertEmail: (newSettings.alertEmail === null || newSettings.alertEmail === undefined) ? '' : String(newSettings.alertEmail),
        };
        const updatedSettings = await CostManagementStorage.saveSingle(sanitizedSettings);
        setCostManagementState(updatedSettings);
    };

    const loadKnowledgeBases = async () => {
        const kbs = await KnowledgeBaseStorage.list();
        setKnowledgeBasesState(kbs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    const addKnowledgeBase = async (kbData: Omit<KnowledgeBase, 'id' | 'sources' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newKb: KnowledgeBase = {
            ...kbData,
            id: `kb-${Date.now()}`,
            sources: [],
            createdAt: now,
            updatedAt: now,
        };
        const savedKb = await KnowledgeBaseStorage.upsert(newKb);
        await loadKnowledgeBases();
        return savedKb;
    };

    const updateKnowledgeBase = async (kbId: string, updates: Partial<KnowledgeBase>) => {
        const existingKb = await KnowledgeBaseStorage.get(kbId);
        if (!existingKb) throw new Error("Knowledge Base not found");
        const updatedKbData = { ...existingKb, ...updates, id: kbId, updatedAt: new Date().toISOString() };
        const savedKb = await KnowledgeBaseStorage.upsert(updatedKbData);
        await loadKnowledgeBases(); // This will re-sort
        // Make sure the editingKb in KnowledgeBasePage gets updated if it was being edited
        return savedKb;
    };

    const deleteKnowledgeBase = async (kbId: string) => {
        await KnowledgeBaseStorage.delete(kbId);
        const remainingKbs = knowledgeBases.filter(kb => kb.id !== kbId); // Use current state to filter
        setKnowledgeBasesState(remainingKbs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())); // re-sort
        if (activeKnowledgeBaseId === kbId) {
             setActiveKnowledgeBaseIdInternal(remainingKbs.length > 0 ? remainingKbs[0].id : null);
        }
    };
    
    const setActiveKnowledgeBaseIdInternal = (id: string | null) => {
        setActiveKnowledgeBaseIdState(id);
        if (id) localStorage.setItem('activeKnowledgeBaseId_v1', id);
        else localStorage.removeItem('activeKnowledgeBaseId_v1');
    };

    const addSourceToKnowledgeBase = async (kbId: string, sourceData: Omit<KnowledgeBaseSource, 'id' | 'createdAt'>) => {
        const kb = await KnowledgeBaseStorage.get(kbId);
        if (!kb) return null;
        const newSource: KnowledgeBaseSource = {
            ...sourceData,
            id: `kbsrc-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        const updatedSources = [...(kb.sources || []), newSource];
        return updateKnowledgeBase(kbId, { sources: updatedSources });
    };
    
    const removeSourceFromKnowledgeBase = async (kbId: string, sourceId: string) => {
        const kb = await KnowledgeBaseStorage.get(kbId);
        if (!kb || !kb.sources) return null;
        const updatedSources = kb.sources.filter(s => s.id !== sourceId);
        return updateKnowledgeBase(kbId, { sources: updatedSources });
    };

    const updateSourceInKnowledgeBase = async (kbId: string, sourceId: string, updates: Partial<KnowledgeBaseSource>) => {
        const kb = await KnowledgeBaseStorage.get(kbId);
        if (!kb || !kb.sources) return null;
        const updatedSources = kb.sources.map(s => s.id === sourceId ? { ...s, ...updates, id: s.id, createdAt: s.createdAt } as KnowledgeBaseSource : s); // Ensure id and createdAt are preserved
        return updateKnowledgeBase(kbId, { sources: updatedSources });
    };


    const value: UserSettingsContextType = {
        userProfile, setUserProfile, updateUserProfilePartial, incrementXP, updateStreak, markFeatureVisited, resetSessionActivity,
        savedPrompts, setSavedPrompts, addSavedPrompt, updateSavedPrompt, deleteSavedPrompt, reorderSavedPrompts,
        personas, setPersonas, addPersona, updatePersona, deletePersona, reorderPersonas, activePersonaId, setActivePersonaId: _setActivePersonaIdInternal,
        spaces, loadSpaces, addSpace, updateSpace, deleteSpace, activeSpaceId, setActiveSpaceId: _setActiveSpaceIdInternal, addFileToSpace, removeFileFromSpace,
        agents, loadAgents, addAgent, updateAgent, deleteAgent,
        costManagement, setCostManagements,
        knowledgeBases, loadKnowledgeBases, addKnowledgeBase, updateKnowledgeBase, deleteKnowledgeBase, activeKnowledgeBaseId, setActiveKnowledgeBaseId: setActiveKnowledgeBaseIdInternal, addSourceToKnowledgeBase, removeSourceFromKnowledgeBase, updateSourceInKnowledgeBase
    };
    return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>;
}
