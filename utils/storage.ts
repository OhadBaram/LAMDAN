// utils/storage.ts

export const mockStorage = <T extends Record<string, any>>(name: string, initialData: T[] | T) => {
    const key = `mock_${name}_global_user`; // Simplified key for broader uniqueness if multiple users were a concept
    let items: T[] | T;
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            items = JSON.parse(stored);
        } else {
            // Ensure deep copy for initialData to prevent mutation of the original object/array
            items = Array.isArray(initialData) 
                ? JSON.parse(JSON.stringify(initialData)) // Deep copy for arrays
                : (typeof initialData === 'object' && initialData !== null 
                    ? JSON.parse(JSON.stringify(initialData)) // Deep copy for objects
                    : initialData);
        }
    } catch (e) {
        console.error(`Could not load ${name} from localStorage`, e);
        // Fallback to deep copied initialData on error as well
        items = Array.isArray(initialData)
            ? JSON.parse(JSON.stringify(initialData))
            : (typeof initialData === 'object' && initialData !== null
                ? JSON.parse(JSON.stringify(initialData))
                : initialData);
    }

    const sync = () => { 
        try { 
            localStorage.setItem(key, JSON.stringify(items)); 
        } catch (e) { 
            console.error(`Could not save ${name} to localStorage`, e); 
        } 
    }

    return {
        list: async (): Promise<T[]> => Array.isArray(items) ? [...items] : [],
        get: async (id: string): Promise<T | undefined> => Array.isArray(items) ? items.find(i => (i as any).id === id) : undefined,
        upsert: async (item: T & { id?: string }): Promise<T> => {
            if (!Array.isArray(items)) { // If items is not an array (e.g. single object storage), convert to array
                items = []; // This might be an issue if it was intentionally a single object. Adjust if needed.
                            // For current usage (ApiSettings, Prompts etc.), they are lists.
            }
            const newItem = { ...item, id: item.id || `genid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, updatedAt: new Date().toISOString() } as T;
            const index = (items as T[]).findIndex(i => (i as any).id === (newItem as any).id);
            if (index > -1) (items as T[])[index] = newItem;
            else (items as T[]).push(newItem);
            sync();
            return newItem;
        },
        delete: async (id: string): Promise<void> => {
            if (!Array.isArray(items)) items = []; // Ensure items is an array
            items = (items as T[]).filter(i => (i as any).id !== id);
            sync();
        },
        getSingle: async (): Promise<T> => {
            if (Array.isArray(items)) { // If it's an array but meant to be single, return first or default
                return items.length > 0 ? {...items[0]} : (initialData && !Array.isArray(initialData) ? JSON.parse(JSON.stringify(initialData)) : {} as T)
            }
            return {...items}; // If it's already a single object
        },
        saveSingle: async (data: T): Promise<T> => { 
            items = data; 
            sync(); 
            return {...items}; 
        },
        // This was a debug/temp property, consider removing or formalizing if needed for reset logic
        _initialData_for_reset_purpose_only_pls_refactor: initialData 
    };
};
