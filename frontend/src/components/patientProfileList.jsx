import React, { useState, useEffect } from 'react';
import { Minimize2, Plus, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to format timestamp
const formatTimestamp = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Helper function to sanitize input
const sanitizeInput = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .slice(0, 500); // Limit length to 500 characters
};

// Convert object to array format
const objectToArray = (obj) => {
    return Object.entries(obj).map(([name, timestamp]) => ({
        id: crypto.randomUUID(),
        name,
        timestamp
    }));
};

// Convert array back to object format for saving
const arrayToObject = (arr) => {
    return arr.reduce((obj, item) => {
        obj[item.name] = item.timestamp;
        return obj;
    }, {});
};

export default function PatientProfileList({
    readOnly,
    onClickMinimize,
    title,
    initialData = {},
    onSave,
    type
}) {
    // Store data as array of objects instead of key-value pairs
    const [items, setItems] = useState(objectToArray(initialData));
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [nameErrors, setNameErrors] = useState({});

    useEffect(() => {
        setItems(objectToArray(initialData));
        setHasUnsavedChanges(false);
        setNameErrors({});
    }, [initialData, type]);

    useEffect(() => {
        const currentObject = arrayToObject(items);
        const hasChanges = Object.entries(currentObject).some(([key, value]) => {
            return initialData[key] !== value || !initialData.hasOwnProperty(key);
        }) || Object.keys(currentObject).length !== Object.keys(initialData).length;

        setHasUnsavedChanges(hasChanges);
    }, [items, initialData]);

    const handleMinimizeClick = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedDialog(true);
            setPendingAction('minimize');
        } else {
            onClickMinimize();
        }
    };

    const validateName = (name) => {
        if (!name.trim()) {
            return 'Name cannot be empty';
        }
        return '';
    };

    const handleSave = async () => {
        // Validate all names
        const errors = {};
        let hasErrors = false;

        items.forEach(item => {
            const error = validateName(item.name);
            if (error) {
                errors[item.id] = error;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setNameErrors(errors);
            toast.error('Please fix all validation errors before saving');
            return;
        }

        try {
            const cleanedData = arrayToObject(
                items.map(item => ({
                    ...item,
                    name: sanitizeInput(item.name)
                }))
            );
            
            if (onSave) {
                await onSave(type, cleanedData);
                setHasUnsavedChanges(false);
                setItems(objectToArray(cleanedData));
            }
        } catch (error) {
            console.error(`Failed to update ${title}:`, error);
            toast.error(`Failed to update ${title}`);
        }
    };

    const handleAddItem = () => {
        // Check if the last item in the list is not empty
        const lastItem = items[items.length - 1];
        if (lastItem && !lastItem.name.trim()) {
            toast.error('Please fill in the last item before adding a new one.');
            return;
        }

        setItems(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: '',
                timestamp: formatTimestamp(new Date())
            }
        ]);
    };
    const handleRemoveItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
        const newNameErrors = { ...nameErrors };
        delete newNameErrors[id];
        setNameErrors(newNameErrors);
    };

    const handleNameChange = (id, newName) => {
        const error = validateName(newName);
        setNameErrors(prev => ({ ...prev, [id]: error }));

        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, name: newName } : item
        ));
    };

    const handleDialogConfirm = () => {
        setShowUnsavedDialog(false);
        if (pendingAction === 'minimize') {
            onClickMinimize();
        }
        setPendingAction(null);
    };

    const handleDialogCancel = () => {
        setShowUnsavedDialog(false);
        setPendingAction(null);
    };

    return (
        <>
            <div className="p-4 space-y-4 overflow-y-hidden">
                <div className="flex justify-between items-center">
                    <span className="text-foreground text-2xl font-semibold">{title}</span>
                    <div className="flex gap-2">
                        {!readOnly && hasUnsavedChanges && (
                            <Button
                                onClick={handleSave}
                                className="bg-primary text-white hover:bg-primary/90"
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                        )}
                        <div
                            className="flex text-foreground bg-btn-normal rounded-md items-center p-2 hover:bg-btn-normal/80 w-fit cursor-pointer"
                            onClick={handleMinimizeClick}
                        >
                            <Minimize2 size={24} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="space-y-1 animate-appear">
                            <div className="flex gap-2 items-center">
                                <Input
                                    className={`w-full ${nameErrors[item.id] ? 'border-destructive' : ''}`}
                                    value={item.name}
                                    onChange={(e) => handleNameChange(item.id, e.target.value)}
                                    readOnly={readOnly}
                                    placeholder="Name"
                                    maxLength={500}
                                />
                                <Input
                                    className="w-40"
                                    value={item.timestamp}
                                    readOnly={true}
                                />
                                {!readOnly && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="aspect-square"
                                    >
                                        <X />
                                    </Button>
                                )}
                            </div>
                            {nameErrors[item.id] && (
                                <p className="text-sm text-destructive">{nameErrors[item.id]}</p>
                            )}
                        </div>
                    ))}

                    {!readOnly && (
                        <Button
                            onClick={handleAddItem}
                            variant="outline"
                            className="w-full mt-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Item
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDialogCancel}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDialogConfirm} className={buttonVariants({ variant: "destructive" })}>Leave</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}