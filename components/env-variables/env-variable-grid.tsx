"use client";

import { EnvVariableCard } from "./env-variable-card";

type EnvVariable = {
  id: string;
  title: string;
  key: string;
  iv: string;
  ciphertext: string;
  created_at: string;
  updated_at: string;
};

type EnvVariableGridProps = {
  envVars: EnvVariable[];
  projectName: string;
  selectedIds?: Set<string>;
  onSelectionChange?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
};

export function EnvVariableGrid({
  envVars,
  projectName,
  selectedIds = new Set(),
  onSelectionChange,
  selectionMode = false,
}: EnvVariableGridProps) {
  if (envVars.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {envVars.map((envVar) => (
        <EnvVariableCard
          key={envVar.id}
          envVar={envVar}
          projectName={projectName}
          isSelected={selectedIds.has(envVar.id)}
          onSelectionChange={onSelectionChange}
          selectionMode={selectionMode}
        />
      ))}
    </div>
  );
}
