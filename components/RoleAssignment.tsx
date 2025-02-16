import { useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Member {
	id: string;
	name: string;
	role: string;
}

interface RoleAssignmentProps {
	workspaceId: string;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ workspaceId }) => {
	const [members, setMembers] = useState<Member[]>([]);

	useEffect(() => {
		fetchMembers();
	}, []); // Removed unnecessary workspaceId dependency

	const fetchMembers = async () => {
		const response = await fetch(`/api/workspaces/${workspaceId}/members`);
		if (response.ok) {
			const data = await response.json();
			setMembers(data);
		}
	};

	const updateRole = async (memberId: string, newRole: string) => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/members/${memberId}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role: newRole }),
			},
		);
		if (response.ok) {
			setMembers(
				members.map((member) =>
					member.id === memberId ? { ...member, role: newRole } : member,
				),
			);
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Role Assignments</h2>
			{members.map((member) => (
				<div key={member.id} className="flex items-center justify-between">
					<span>{member.name}</span>
					<Select
						value={member.role}
						onValueChange={(value) => updateRole(member.id, value)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="owner">Owner</SelectItem>
							<SelectItem value="member">Member</SelectItem>
							<SelectItem value="presenter">Presenter</SelectItem>
							<SelectItem value="researcher">Researcher</SelectItem>
						</SelectContent>
					</Select>
				</div>
			))}
		</div>
	);
};

export default RoleAssignment;
