import type React from "react"
import { useQuery } from "react-query"
import QuickAccessToolbar from "../../components/QuickAccessToolbar"
import WorkspaceList from "../../components/WorkspaceList"
import CreateWorkspaceForm from "../../components/CreateWorkspaceForm"

const WorkspacesPage: React.FC = () => {
  const {
    data: workspaces,
    isLoading,
    error,
  } = useQuery("workspaces", async () => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const res = await fetch("/api/workspaces", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error("Failed to fetch workspaces")

    return res.json()
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Collaborative Workspaces</h1>
        {isLoading ? (
          <p>Loading workspaces...</p>
        ) : error ? (
          <p className="text-red-500">Error: {(error as Error).message}</p>
        ) : (
          <>
            <WorkspaceList workspaces={workspaces} />
            <CreateWorkspaceForm />
          </>
        )}
      </div>
    </div>
  )
}

export default WorkspacesPage

