import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Poll {
	id: string;
	question: string;
	options: string[];
	votes: Record<string, number>;
}

interface LivePollProps {
	workspaceId: string;
}

const LivePoll: React.FC<LivePollProps> = ({ workspaceId }) => {
	const [polls, setPolls] = useState<Poll[]>([]);
	const [newQuestion, setNewQuestion] = useState("");
	const [newOptions, setNewOptions] = useState<string[]>(["", ""]);
	const [selectedOption, setSelectedOption] = useState<string>("");

	useEffect(() => {
		fetchPolls();
	}, []); // Removed workspaceId from dependencies

	const fetchPolls = async () => {
		const response = await fetch(`/api/workspaces/${workspaceId}/polls`);
		if (response.ok) {
			const data = await response.json();
			setPolls(data);
		}
	};

	const createPoll = async () => {
		if (newQuestion && newOptions.every((option) => option.trim() !== "")) {
			const response = await fetch(`/api/workspaces/${workspaceId}/polls`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: newQuestion, options: newOptions }),
			});
			if (response.ok) {
				const newPoll = await response.json();
				setPolls([...polls, newPoll]);
				setNewQuestion("");
				setNewOptions(["", ""]);
			}
		}
	};

	const vote = async (pollId: string, option: string) => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/polls/${pollId}/vote`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ option }),
			},
		);
		if (response.ok) {
			const updatedPoll = await response.json();
			setPolls(polls.map((poll) => (poll.id === pollId ? updatedPoll : poll)));
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Live Polls</h2>
			<div className="space-y-2">
				<Input
					value={newQuestion}
					onChange={(e) => setNewQuestion(e.target.value)}
					placeholder="Poll question"
				/>
				{newOptions.map((option, index) => (
					<Input
						key={index}
						value={option}
						onChange={(e) => {
							const updatedOptions = [...newOptions];
							updatedOptions[index] = e.target.value;
							setNewOptions(updatedOptions);
						}}
						placeholder={`Option ${index + 1}`}
					/>
				))}
				<Button onClick={() => setNewOptions([...newOptions, ""])}>
					Add Option
				</Button>
				<Button onClick={createPoll}>Create Poll</Button>
			</div>
			{polls.map((poll) => (
				<div key={poll.id} className="border p-4 rounded space-y-2">
					<h3 className="font-bold">{poll.question}</h3>
					<RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
						{poll.options.map((option, index) => (
							<div key={index} className="flex items-center space-x-2">
								<RadioGroupItem
									value={option}
									id={`option-${poll.id}-${index}`}
								/>
								<Label htmlFor={`option-${poll.id}-${index}`}>{option}</Label>
								<span>({poll.votes[option] || 0} votes)</span>
							</div>
						))}
					</RadioGroup>
					<Button onClick={() => vote(poll.id, selectedOption)}>Vote</Button>
				</div>
			))}
		</div>
	);
};

export default LivePoll;
