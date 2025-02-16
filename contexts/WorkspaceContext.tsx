import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Workspace {
  id: string
  name: string
}

interface WorkspaceContextType {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace | null) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const WorkspaceContext = WorkspaceContext
