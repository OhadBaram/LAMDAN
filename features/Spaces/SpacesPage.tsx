
import React, { useState, useRef, useEffect } from "react"; // Added useEffect
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
    const { spaces, addSpace, updateSpace, deleteSpace, activeSpaceId, setActiveSpaceId, addFileToSpace, removeFileFromSpace, markFeatureVisited } = useUserSettings();
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
            openErrorDialog(
                lang === 'he' ? 'שם חסר' : 'Name Missing', 
                lang === 'he' ? 'אופס, שכחת לתת שם למרחב. כל מרחב צריך שם ייחודי.' : 'Oops, you forgot to name the space. Every space needs a unique name.'
            );
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
        if (window.confirm(lang === 'he' ? 'האם למחוק מרחב זה וכל קבציו? זו פעולה שלא ניתן לשחזר.' : 'Delete this space and all its files? This action cannot be undone.')) {
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
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle>{lang === 'he' ? 'ניהול מרחבי עבודה' : 'Manage Workspaces (Spaces)'}</CardTitle>
                    <Button onClick={handleAddNewSpace} variant="default"><Plus className="w-3.5 h-3.5 me-1.5"/>{lang === 'he' ? 'צור מרחב חדש' : 'Create New Space'}</Button>
                </CardHeader>
                <CardContent>
                    {spaces.length > 0 ? (
                        <div className="space-y-2.5">
                            <Label htmlFor="active-space-select">{lang === 'he' ? 'בחר מרחב פעיל:' : 'Select Active Space:'}</Label>
                            <Select id="active-space-select" value={activeSpaceId || ''} onChange={e => setActiveSpaceId(e.target.value || null)}>
                                <option value="">{lang === 'he' ? 'ללא מרחב פעיל' : 'No Active Space'}</option>
                                {spaces.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}
                            </Select>
                        </div>
                    ) : (
                         <p className="text-center text-[var(--text-secondary)] py-6">{lang === 'he' ? 'עדיין אין מרחבים. צור אחד כדי להתחיל לארגן את הקבצים שלך.' : 'No spaces yet. Create one to start organizing your files.'}</p>
                    )}
                </CardContent>
            </Card>

            {currentActiveSpace && (
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <CardTitle>{currentActiveSpace.name}</CardTitle>
                            {currentActiveSpace.description && <CardDescription>{currentActiveSpace.description}</CardDescription>}
                        </div>
                        <div className="space-x-1.5">
                             <Button variant="outline" size="sm" onClick={() => handleEditSpace(currentActiveSpace)}><Edit3 className="w-3 h-3 me-1"/>{lang === 'he' ? 'ערוך פרטי מרחב' : 'Edit Space Details'}</Button>
                             <Button variant="destructive" size="sm" onClick={() => handleDeleteSpace(currentActiveSpace.id)}><Trash2 className="w-3 h-3 me-1"/>{lang === 'he' ? 'מחק מרחב' : 'Delete Space'}</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-3">
                            <Label htmlFor="file-upload-space" className="cursor-pointer inline-flex items-center px-3 py-2 border border-dashed border-[var(--border)] rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]">
                                <UploadCloud className="w-3.5 h-3.5 me-1.5"/>{lang === 'he' ? 'העלה קבצים למרחב זה' : 'Upload Files to this Space'}
                            </Label>
                            <input id="file-upload-space" type="file" ref={fileInputRef} onChange={handleFileForSpaceUpload} className="hidden" multiple accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.txt,.md,text/plain"/>
                        </div>
                        {(currentActiveSpace.files || []).length > 0 ? (
                            <ul className="space-y-1.5">
                                {(currentActiveSpace.files || []).map(file => (
                                    <li key={file.id} className="p-2.5 border border-[var(--border)] rounded-md flex items-center justify-between bg-[var(--bg-primary)] hover:border-[var(--accent)]/50">
                                        <div className="flex items-center gap-1.5">
                                            {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-[var(--accent)]"/> : <FileIconPkg className="w-4 h-4 text-[var(--accent)]"/>}
                                            <span className="text-sm text-[var(--text-primary)]">{file.name}</span>
                                            <span className="text-xs text-[var(--text-secondary)]">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => activeSpaceId && removeFileFromSpace(activeSpaceId, file.id)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--error)]">
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">{lang === 'he' ? 'אין קבצים במרחב זה עדיין.' : 'No files in this space yet.'}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={showSpaceDialog} onOpenChange={setShowSpaceDialog}>
                <DialogHeader>
                    <DialogTitle>{editingSpace?.id ? (lang === 'he' ? 'ערוך מרחב' : 'Edit Space') : (lang === 'he' ? 'צור מרחב חדש' : 'Create New Space')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-4 space-y-3">
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
                     <Button variant="ghost" onClick={() => {setShowSpaceDialog(false); setEditingSpace(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</Button>
                    <Button onClick={handleSaveSpace} variant="default">{lang === 'he' ? 'שמור' : 'Save'}</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
