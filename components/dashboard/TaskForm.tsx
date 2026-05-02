'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@/components/ui/field';

import { Loader2 } from 'lucide-react';
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInput } from './FileInput';
import { createTask } from '@/actions/tasks/create_task';
import { updateTask } from '@/actions/tasks/update_Task';
import toast from 'react-hot-toast';
import type { Task } from '@/interfaces/task';

export type Status = Task['status'];

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

const taskSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({ isOpen, onClose, task, onSuccess }: TaskFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
        },
    });

    const { handleSubmit, control } = form;

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
            });
            setSelectedFile(null);
            setRemoveImage(false);
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
            });
            setSelectedFile(null);
            setRemoveImage(false);
        }
    }, [task, form, isOpen]);

    const onSubmit = async (data: TaskFormValues) => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('status', data.status);
            formData.append('priority', data.priority);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            if (task) {
                formData.append('id', task.id);
                formData.append('existingImage', task.image || '');
                if (removeImage) formData.append('removeImage', 'true');
            }

            const result = task ? await updateTask(formData) : await createTask(formData);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success(task ? 'Tarea actualizada' : 'Tarea creada');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Error al guardar la tarea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="lg:w-xl md:w-full w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="mb-0" data-invalid={!!fieldState.error}>
                                <FieldLabel htmlFor="task-title">Título</FieldLabel>
                                <Input
                                    {...field}
                                    id="task-title"
                                    placeholder="Título de la tarea"
                                    disabled={loading}
                                />
                                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field className="mb-0" data-invalid={!!fieldState.error}>
                                <FieldLabel htmlFor="task-description">Descripción</FieldLabel>
                                <Textarea
                                    {...field}
                                    id="task-description"
                                    placeholder="Describe lo que hay que hacer..."
                                    rows={3}
                                    disabled={loading}
                                />
                                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <Field className="mb-0" data-invalid={!!fieldState.error}>
                                    <FieldLabel>Estado</FieldLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">Pendiente</SelectItem>
                                            <SelectItem value="in-progress">En curso</SelectItem>
                                            <SelectItem value="review">En revisión</SelectItem>
                                            <SelectItem value="done">Completado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="priority"
                            render={({ field, fieldState }) => (
                                <Field className="mb-0" data-invalid={!!fieldState.error}>
                                    <FieldLabel>Prioridad</FieldLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baja</SelectItem>
                                            <SelectItem value="medium">Media</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                </Field>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <FileInput
                            key={`${task?.id ?? 'new'}-${isOpen}`}
                            accept="image/jpeg, image/png, image/gif, image/webp"
                            multiple={false}
                            onFilesSelected={(files) => {
                                if (files.length > 0) {
                                    setSelectedFile(files[0] as File);
                                    setRemoveImage(false);
                                } else {
                                    setSelectedFile(null);
                                    if (task?.image) setRemoveImage(true);
                                }
                            }}
                            initialImageUrl={task?.image || undefined}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {task ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
