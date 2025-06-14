
import React, { useState, useRef } from "react";
import { Plus, Edit3, Trash2, UploadCloud, X, ImageIcon, File as FileIconPkg } from "lucide-react";
import { useAppContext } from '../../contexts/AppContext';
import { useUserSettings, Space, SpaceFile } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';


export function SpacesPage() {
    const { lang, openErrorDialog } = useAppContext();
    const { spaces, addSpace, updateSpace, deleteSpace, activeSpaceId, setActiveSpaceId, addFileToSpace, removeFileFromSpace } = useUserSettings();
    const [showSpaceDialog, setShowSpaceDialog] = useState(false);
    const [editingSpace, setEditingSpace] = useState<Partial<Space> | null>(null);
    const [_fileForUpload, setFileForUpload] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddNewSpace = () => {
        setEditingSpace({ name: '', description: '', files: [] });
        setShowSpaceDialog(true);
    };
    const handleEditSpace = (space: Space) => {
        setEditingSpace(space);
        setShowSpaceDialog(true);
    };
    const handleSaveSpace = async () => {
        if (!editingSpace || !editingSpace.name?.trim()) {
            openErrorDialog(lang === 'he' ? 'שם חסר' : 'Name Missing', lang === 'he' ? 'אנא הזן שם למרחב.' : 'Please enter a name for the space.');
            return;
        }
        if (editingSpace.id) {
            await updateSpace(editingSpace.id, editingSpace);
        } else {
            const newSpace = await addSpace(editingSpace as Omit<Space, 'id'>);
            setActiveSpaceId(newSpace.id); 
        }
        setShowSpaceDialog(false);
        setEditingSpace(null);
    };
    const handleDeleteSpace = async (spaceId: string) => {
        if (window.confirm(lang === 'he' ? 'האם למחוק מרחב זה וכל קבציו?' : 'Delete this space and all its files?')) {
            await deleteSpace(spaceId);
        }
    };

    const handleFileForSpaceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && activeSpaceId) {
            setFileForUpload(file); 
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                let fileContent: string = "";
                const resultString = e.target?.result as string || "";

                if (file.type.startsWith('image/')) {
                    fileContent = `Simulated OCR text from ${file.name}: "[Image showing various objects...]"`;
                } else if (file.type === 'application/pdf') {
                    fileContent = `Simulated PDF text for ${file.name}: "[Content of PDF document related to AI research...]". (Simulated full text extraction)`;
                } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
                    fileContent = `Simulated Word document text for ${file.name}: "[Company report Q3 results...]" (Simulated full text extraction)`;
                } else if (file.type.startsWith('text/')) {
                    fileContent = resultString;
                } else {
                    fileContent = `(Unsupported file type for content extraction: ${file.name})`;
                }

                await addFileToSpace(activeSpaceId, {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: fileContent,
                    dataUrl: file.type.startsWith('image/') ? resultString : undefined
                });
            };

            if (file.type.startsWith('text/') || file.type.startsWith('image/')) { 
                reader.readAsDataURL(file); 
            } else { 
                 reader.readAsText(file);
            }
        }
        if(event.target) event.target.value = '';
    };

    const currentActiveSpace = spaces.find(s => s.id === activeSpaceId);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>{lang === 'he' ? 'ניהול מרחבי עבודה' : 'Manage Workspaces (Spaces)'}</CardTitle>
                    <Button onClick={handleAddNewSpace}><Plus className="w-4 h-4 me-2"/>{lang === 'he' ? 'צור מרחב חדש' : 'Create New Space'}</Button>
                </CardHeader>
                <CardContent>
                    {spaces.length > 0 ? (
                        <div className="space-y-3">
                            <Label htmlFor="active-space-select">{lang === 'he' ? 'בחר מרחב פעיל:' : 'Select Active Space:'}</Label>
                            <Select id="active-space-select" value={activeSpaceId || ''} onChange={e => setActiveSpaceId(e.target.value || null)}>
                                <option value="">{lang === 'he' ? 'ללא מרחב פעיל' : 'No Active Space'}</option>
                                {spaces.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}
                            </Select>
                        </div>
                    ) : (
                         <p className="text-center text-gray-500 py-8">{lang === 'he' ? 'עדיין אין מרחבים. צור אחד כדי להתחיל לארגן את הקבצים שלך.' : 'No spaces yet. Create one to start organizing your files.'}</p>
                    )}
                </CardContent>
            </Card>

            {currentActiveSpace && (
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <div>
                            <CardTitle>{currentActiveSpace.name}</CardTitle>
                            {currentActiveSpace.description && <CardDescription>{currentActiveSpace.description}</CardDescription>}
                        </div>
                        <div className="space-x-2">
                             <Button variant="outline" size="sm" onClick={() => handleEditSpace(currentActiveSpace)}><Edit3 className="w-3 h-3 me-1"/>{lang === 'he' ? 'ערוך פרטי מרחב' : 'Edit Space Details'}</Button>
                             <Button variant="destructive" size="sm" onClick={() => handleDeleteSpace(currentActiveSpace.id)}><Trash2 className="w-3 h-3 me-1"/>{lang === 'he' ? 'מחק מרחב' : 'Delete Space'}</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <Label htmlFor="file-upload-space" className="cursor-pointer inline-flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <UploadCloud className="w-4 h-4 me-2"/>{lang === 'he' ? 'העלה קבצים למרחב זה' : 'Upload Files to this Space'}
                            </Label>
                            <input id="file-upload-space" type="file" ref={fileInputRef} onChange={handleFileForSpaceUpload} className="hidden" multiple accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.txt,.md,text/plain"/>
                        </div>
                        {(currentActiveSpace.files || []).length > 0 ? (
                            <ul className="space-y-2">
                                {(currentActiveSpace.files || []).map(file => (
                                    <li key={file.id} className="p-3 border dark:border-gray-700 rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-indigo-500"/> : <FileIconPkg className="w-5 h-5 text-indigo-500"/>}
                                            <span className="text-sm">{file.name}</span>
                                            <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => activeSpaceId && removeFileFromSpace(activeSpaceId, file.id)} className="p-1 text-red-500 hover:text-red-700">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">{lang === 'he' ? 'אין קבצים במרחב זה עדיין.' : 'No files in this space yet.'}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={showSpaceDialog} onOpenChange={setShowSpaceDialog}>
                <DialogHeader>
                    <DialogTitle>{editingSpace?.id ? (lang === 'he' ? 'ערוך מרחב' : 'Edit Space') : (lang === 'he' ? 'צור מרחב חדש' : 'Create New Space')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="spaceName">{lang === 'he' ? 'שם המרחב' : 'Space Name'}</Label>
                        <Input id="spaceName" value={editingSpace?.name || ''} onChange={e => setEditingSpace(s => ({...s, name: e.target.value}))}/>
                    </div>
                    <div>
                        <Label htmlFor="spaceDescription">{lang === 'he' ? 'תיאור (אופציונלי)' : 'Description (Optional)'}</Label>
                        <Textarea id="spaceDescription" value={editingSpace?.description || ''} onChange={e => setEditingSpace(s => ({...s, description: e.target.value}))} rows={3}/>
                    </div>
                </DialogContent>
                <DialogFooter>
                     <Button variant="outline" onClick={() => {setShowSpaceDialog(false); setEditingSpace(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</Button>
                    <Button onClick={handleSaveSpace}>{lang === 'he' ? 'שמור' : 'Save'}</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
