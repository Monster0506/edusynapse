import { useRouter } from "next/router"
import { useQuery } from "react-query"
import Whiteboard from "../../components/Whiteboard"
import RoleAssignment from "../../components/RoleAssignment"
import BreakoutRooms from "../../components/BreakoutRooms"
import LivePoll from "../../components/LivePoll"
import SessionSummary from "../../components/SessionSummary"
import QuickAccessToolbar from "../../components/QuickAccessToolbar"
import type React from "react" // Added import for React

const WorkspacePage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query

  const {
    data: workspace,
    isLoading,
    error,
  } = useQuery(
    ["workspace", id],
    async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch(`/api/workspaces/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch workspace")

      return res.json()
    },
    {
      enabled: !!id,
    },
  )

  if (isLoading) return <div>Loading workspace...</div>
  if (error) return <div>Error: {(error as Error).message}</div>
  if (!workspace) return <div>Workspace not found</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <QuickAccessToolbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{workspace.name}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Whiteboard workspaceId={workspace.id} />
            <RoleAssignment workspaceId={workspace.id} />
            <BreakoutRooms workspaceId={workspace.id} />
          </div>
          <div>
            <LivePoll workspaceId={workspace.id} />
            <SessionSummary workspaceId={workspace.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePage

