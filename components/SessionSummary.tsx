import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Summary {
	id: string;
	content: string;
	createdAt: string;
}

interface SessionSummaryProps {
	workspaceId: string;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ workspaceId }) => {
	const [summaries, setSummaries] = useState<Summary[]>([]);
	const [newSummary, setNewSummary] = useState("");

	useEffect(() => {
		fetchSummaries();
	}, []); // Removed unnecessary workspaceId dependency

	const fetchSummaries = async () => {
		const response = await fetch(`/api/workspaces/${workspaceId}/summaries`);
		if (response.ok) {
			const data = await response.json();
			setSummaries(data);
		}
	};

	const createSummary = async () => {
		if (newSummary.trim()) {
			const response = await fetch(`/api/workspaces/${workspaceId}/summaries`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: newSummary }),
			});
			if (response.ok) {
				const createdSummary = await response.json();
				setSummaries([...summaries, createdSummary]);
				setNewSummary("");
			}
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Session Summaries</h2>
			<div className="space-y-2">
				<Textarea
					value={newSummary}
					onChange={(e) => setNewSummary(e.target.value)}
					placeholder="Write a session summary..."
					rows={4}
				/>
				<Button onClick={createSummary}>Save Summary</Button>
			</div>
			{summaries.map((summary) => (
				<div key={summary.id} className="border p-4 rounded">
					<p>{summary.content}</p>
					<p className="text-sm text-gray-500 mt-2">
						Created at: {new Date(summary.createdAt).toLocaleString()}
					</p>
				</div>
			))}
		</div>
	);
};

export default SessionSummary;
