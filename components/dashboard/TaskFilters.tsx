"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Filter } from 'lucide-react';
import { Searchbar } from './Searchbar';

export type Status = 'todo' | 'in-progress' | 'review' | 'done';

interface TaskFiltersProps {
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    currentFilters: {
        search: string;
        status: string;
        priority: string;
    };
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}


export function TaskFilters({
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    currentFilters,
}: TaskFiltersProps) {
    const [searchTerm, setSearchTerm] = useState(currentFilters.search);
    const debouncedSearch = useDebounce(searchTerm, 400);

    useEffect(() => {
        // Sincronizar término local cuando el padre resetea filtros (p. ej. vuelta atrás)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- prop → estado local; debounce exige copia local
        setSearchTerm(currentFilters.search);
    }, [currentFilters.search]);

    useEffect(() => {
        if (debouncedSearch !== currentFilters.search) {
            onSearchChange(debouncedSearch);
        }
    }, [debouncedSearch, onSearchChange, currentFilters.search]);

    return (
            <div className="flex flex-col py-4 gap-3 sm:flex-row sm:flex-nowrap sm:items-end sm:gap-4">
                <div className="w-full min-w-0 space-y-2 sm:basis-1/2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        Buscar por título o descripción
                    </label>
                    <Searchbar
                        id="task-search"
                        placeholder="Escribe para buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="w-full min-w-0 space-y-2 sm:basis-1/4">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Filter size={16} /> Estado
                    </label>
                    <Select value={currentFilters.status} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="todo">Pendiente</SelectItem>
                            <SelectItem value="in-progress">En curso</SelectItem>
                            <SelectItem value="review">En revisión</SelectItem>
                            <SelectItem value="done">Completada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full min-w-0 space-y-2 sm:basis-1/4">
                    <label className="text-sm font-medium flex items-center gap-2 truncate">
                        Prioridad
                    </label>
                    <Select value={currentFilters.priority} onValueChange={onPriorityChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
    );
}
