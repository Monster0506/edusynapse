import type React from "react";
import Link from "next/link";

interface Workspace {
	id: string;
	name: string;
	description: string;
}

interface WorkspaceListProps {
	workspaces: Workspace[];
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({ workspaces }) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			{workspaces.map((workspace) => (
				<Link key={workspace.id} href={`/workspaces/${workspace.id}`}>
					<div className="bg-background shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
						<h2 className="text-xl font-semibold mb-2">{workspace.name}</h2>
						<p className="text-gray-600">{workspace.description}</p>
					</div>
				</Link>
			))}
		</div>
	);
};

export default WorkspaceList;
