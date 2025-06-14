
import React from 'react';
import { X, ImageIcon, File as FileIconPkg } from "lucide-react";
import { Button } from '../../components/ui/Button';

interface FilePreviewProps {
    file: { id: string; name: string; type: string; dataUrl: string; content: string };
    onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
    return (
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md flex items-center gap-2 text-sm">
            {file.type.startsWith('image/') && file.dataUrl ? (
                <img src={file.dataUrl} alt={file.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
            ) : (
                file.type.startsWith('image/') ? 
                <ImageIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" /> : 
                <FileIconPkg className="w-6 h-6 text-indigo-500 flex-shrink-0" />
            )}
            <span className="truncate flex-1 min-w-0" title={file.name}>{file.name}</span>
            <Button size="icon" variant="ghost" onClick={onRemove} className="p-1 text-red-500 hover:text-red-700 flex-shrink-0">
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
