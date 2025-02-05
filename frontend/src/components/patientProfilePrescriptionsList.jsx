import React, { useState, useEffect } from 'react';
import { Minimize2, Plus, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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

export default function PrescriptionList({
    readOnly,
    onClickMinimize,
    initialData = [],
    onSave,
    appointmentId,
}) {
    console.log(initialData);
    
    const [prescriptions, setPrescriptions] = useState(
        Array.isArray(initialData) ? initialData.map(p => ({ ...p })) : []
      );      
      
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [errors, setErrors] = useState({});

    const [newPrescriptions, setNewPrescriptions] = useState(new Set());
    const [deletedPrescriptions, setDeletedPrescriptions] = useState(new Set());
    const [modifiedPrescriptions, setModifiedPrescriptions] = useState(new Set());

    useEffect(() => {
        // Only call map if initialData is an array
        if (Array.isArray(initialData)) {
            setPrescriptions(initialData.map(p => ({ ...p })));
        } else {
            setPrescriptions([]); // Default to empty array if not an array
        }

        setNewPrescriptions(new Set());
        setDeletedPrescriptions(new Set());
        setModifiedPrescriptions(new Set());
        setHasUnsavedChanges(false);
        setErrors({});
    }, [initialData]);

    const validatePrescription = (prescription) => {
        const errors = {};
        if (!prescription.medication_name?.trim()) {
            errors.medication_name = 'Medication name is required';
        }
        if (!prescription.dosage?.trim()) {
            errors.dosage = 'Dosage is required';
        }
        if (!prescription.duration || prescription.duration <= 0) {
            errors.duration = 'Duration must be a positive number';
        }
        return errors;
    };

    const handleMinimizeClick = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedDialog(true);
            setPendingAction('minimize');
        } else {
            onClickMinimize();
        }
    };

    const handleSave = async () => {
        const allErrors = {};
        let hasErrors = false;

        prescriptions.forEach((prescription) => {
            const prescriptionErrors = validatePrescription(prescription);
            if (Object.keys(prescriptionErrors).length > 0) {
                allErrors[prescription.id] = prescriptionErrors;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(allErrors);
            toast.error('Please fix all validation errors before saving');
            return;
        }

        try {
            await onSave({
                new: prescriptions.filter(p => newPrescriptions.has(p.id)),
                modified: prescriptions.filter(p => modifiedPrescriptions.has(p.id)),
                deleted: Array.from(deletedPrescriptions)
            });

            setHasUnsavedChanges(false);
            setNewPrescriptions(new Set());
            setDeletedPrescriptions(new Set());
            setModifiedPrescriptions(new Set());
        } catch (error) {
            console.error('Failed to update prescriptions:', error);
            toast.error('Failed to update prescriptions');
        }
    };

    const canAddNewPrescription = () => {
        if (prescriptions.length === 0) return true;

        const lastPrescription = prescriptions[prescriptions.length - 1];
        const validationErrors = validatePrescription(lastPrescription);

        // Only check required fields, ignoring special_instructions
        return Object.keys(validationErrors).length === 0;
    };

    const handleAddPrescription = () => {
        if (!canAddNewPrescription()) {
            // Validate the last prescription and show errors
            const lastPrescription = prescriptions[prescriptions.length - 1];
            const validationErrors = validatePrescription(lastPrescription);
            setErrors(prev => ({
                ...prev,
                [lastPrescription.id]: validationErrors
            }));
            toast.error('Please complete the current prescription before adding a new one');
            return;
        }

        const newId = crypto.randomUUID();
        const newPrescription = {
            id: newId,
            medication_name: '',
            dosage: '',
            duration: 0,
            special_instructions: '',
            appointment: appointmentId
        };
        setPrescriptions(prev => [...prev.map(p => ({ ...p })), newPrescription]);
        setNewPrescriptions(prev => new Set(prev).add(newId));
        setHasUnsavedChanges(true);
    };

    const handleRemovePrescription = (id) => {
        if (newPrescriptions.has(id)) {
            setNewPrescriptions(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } else {
            setDeletedPrescriptions(prev => new Set(prev).add(id));
        }
        setPrescriptions(prev => prev.filter(prescription => prescription.id !== id));
        const newErrors = { ...errors };
        delete newErrors[id];
        setErrors(newErrors);
        setHasUnsavedChanges(true);
    };

    const handlePrescriptionChange = (id, field, value) => {
        setPrescriptions(prev =>
            prev.map(prescription =>
                prescription.id === id
                    ? {
                        ...prescription,
                        [field]: field === 'duration' ? parseInt(value) || 0 : value
                    }
                    : { ...prescription }
            )
        );

        if (!newPrescriptions.has(id)) {
            setModifiedPrescriptions(prev => new Set(prev).add(id));
        }

        if (errors[id]?.[field]) {
            setErrors(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: undefined
                }
            }));
        }

        setHasUnsavedChanges(true);
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
        <div className="flex flex-col h-full">
            <div className="sticky top-0 bg-background border-b  border-border z-20 p-4">
                <div className="flex justify-between items-center">
                    <span className="text-foreground text-2xl font-semibold">Prescriptions</span>
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
            </div>

            <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prescriptions.map((prescription) => (
                        <Card key={prescription.id} className="animate-appear bg-darker-background">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-darker-background">
                                <CardTitle className="text-lg">Medication Details</CardTitle>
                                {!readOnly && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemovePrescription(prescription.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-2 bg-darker-background">
                                <div>
                                    <Input
                                        className={`w-full ${errors[prescription.id]?.medication_name ? 'border-destructive' : ''}`}
                                        value={prescription.medication_name}
                                        onChange={(e) => handlePrescriptionChange(prescription.id, 'medication_name', e.target.value)}
                                        readOnly={readOnly}
                                        placeholder="Medication Name"
                                    />
                                    {errors[prescription.id]?.medication_name && (
                                        <p className="text-xs text-destructive">{errors[prescription.id].medication_name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Input
                                            className={errors[prescription.id]?.dosage ? 'border-destructive' : ''}
                                            value={prescription.dosage}
                                            onChange={(e) => handlePrescriptionChange(prescription.id, 'dosage', e.target.value)}
                                            readOnly={readOnly}
                                            placeholder="Dosage"
                                        />
                                        {errors[prescription.id]?.dosage && (
                                            <p className="text-xs text-destructive">{errors[prescription.id].dosage}</p>
                                        )}
                                    </div>

                                    <div className='flex flex-row  items-center'>
                                        <Input
                                            type="number"
                                            className={errors[prescription.id]?.duration ? 'border-destructive' : ''}
                                            value={prescription.duration}
                                            onChange={(e) => handlePrescriptionChange(prescription.id, 'duration', e.target.value)}
                                            readOnly={readOnly}
                                            placeholder="Duration (days)"
                                        />
                                        <span className='text-center items-center ml-2'>days</span>
                                        {errors[prescription.id]?.duration && (
                                            <p className="text-xs text-destructive">{errors[prescription.id].duration}</p>
                                        )}
                                    </div>
                                </div>

                                <Textarea
                                    value={prescription.special_instructions || ''}
                                    onChange={(e) => handlePrescriptionChange(prescription.id, 'special_instructions', e.target.value)}
                                    readOnly={readOnly}
                                    placeholder="Special Instructions"
                                    className="min-h-[60px] resize-none text-sm"
                                />
                            </CardContent>
                        </Card>
                    ))}

                    {!readOnly && (
                        <Button
                            onClick={handleAddPrescription}
                            variant="outline"
                            className="h-full min-h-[200px]"
                        >
                            <Plus className="w-6 h-6 mr-2" />
                            Add New Prescription
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
        </div>
    );
}