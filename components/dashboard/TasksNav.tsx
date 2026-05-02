"use client";

import { AvatarBadge } from "@/components/dashboard/AvatarBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";

interface TasksNavProps {
  onNewTask?: () => void;
}

export function TasksNav({ onNewTask }: TasksNavProps) {
  const { user } = useAuth();

  return (
    <nav className="flex justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3 text-xl font-extrabold tracking-tight">
        <LayoutGrid size={32} />
        Gestor de Tareas
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="default"
            className="rounded-4xl shadow-md"
            onClick={onNewTask}
          >
            <Plus className="size-4 shrink-0" />
            Nueva Tarea
          </Button>
          <Link href="/profile">
            <AvatarBadge name={user.name} avatar_url={user.avatar_url} />
          </Link>
        </div>
      )}
    </nav>
  );
}
