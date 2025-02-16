import type React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { ReviewItem } from "../types";

interface ChallengeModeProps {
	sessionId: string;
}

const ChallengeMode: React.FC<ChallengeModeProps> = ({ sessionId }) => {
	const [currentItemIndex, setCurrentItemIndex] = useState(0);
	const [userAnswer, setUserAnswer] = useState("");
	const [timeLeft, setTimeLeft] = useState(30);
	const [score, setScore] = useState(0);

	const {
		data: challengeItems,
		isLoading,
		error,
	} = useQuery<ReviewItem[]>(["challengeItems", sessionId], async () => {
		const res = await fetch(
			`/api/review-sessions/${sessionId}/challenge-items`,
		);
		if (!res.ok) throw new Error("Failed to fetch challenge items");
		return res.json();
	});

	const submitAnswerMutation = useMutation(
		async ({
			itemId,
			answer,
			time,
		}: { itemId: string; answer: string; time: number }) => {
			const res = await fetch(
				`/api/review-sessions/${sessionId}/challenge-answer`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ itemId, answer, time }),
				},
			);
			if (!res.ok) throw new Error("Failed to submit answer");
			return res.json();
		},
		{
			onSuccess: (data) => {
				setScore((prevScore) => prevScore + data.points);
				if (currentItemIndex < (challengeItems?.length || 0) - 1) {
					setCurrentItemIndex((prevIndex) => prevIndex + 1);
					setTimeLeft(30);
				}
			},
		},
	);

	useEffect(() => {
		if (!challengeItems || currentItemIndex >= challengeItems.length) return;

		const timer = setInterval(() => {
			setTimeLeft((prevTime) => {
				if (prevTime <= 1) {
					clearInterval(timer);
					submitAnswerMutation.mutate({
						itemId: challengeItems[currentItemIndex].id,
						answer: userAnswer,
						time: 30 - prevTime,
					});
					return 0;
				}
				return prevTime - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [currentItemIndex, challengeItems, submitAnswerMutation]); // Added submitAnswerMutation to dependencies

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!challengeItems) return;

		submitAnswerMutation.mutate({
			itemId: challengeItems[currentItemIndex].id,
			answer: userAnswer,
			time: 30 - timeLeft,
		});
		setUserAnswer("");
	};

	if (isLoading) return <div>Loading challenge...</div>;
	if (error) return <div>Error: {(error as Error).message}</div>;
	if (!challengeItems) return <div>No challenge items available</div>;

	if (currentItemIndex >= challengeItems.length) {
		return (
			<div className="text-center">
				<h3 className="text-2xl font-bold mb-4">Challenge Complete!</h3>
				<p className="text-xl mb-4">Your score: {score}</p>
				<Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
				<Button onClick={() => window.location.reload()}>
					Start New Challenge
				</Button>
			</div>
		);
	}

	const currentItem = challengeItems[currentItemIndex];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-xl font-semibold">Challenge Mode</h3>
				<Badge variant="secondary" className="text-lg">
					Score: {score}
				</Badge>
			</div>
			<Progress value={(timeLeft / 30) * 100} className="w-full" />
			<div className="flex justify-between items-center text-sm text-gray-500">
				<span>Time left: {timeLeft}s</span>
				<span>
					Question {currentItemIndex + 1} of {challengeItems.length}
				</span>
			</div>
			<div className="bg-background shadow-md rounded-lg p-6">
				<h4 className="text-lg font-medium mb-4">{currentItem.question}</h4>
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						value={userAnswer}
						onChange={(e) => setUserAnswer(e.target.value)}
						className="w-full p-2 border rounded mb-4"
						placeholder="Your answer"
					/>
					<Button type="submit" className="w-full">
						Submit Answer
					</Button>
				</form>
			</div>
		</div>
	);
};

export default ChallengeMode;
