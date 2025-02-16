import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BreakoutRoom {
	id: string;
	name: string;
	participants: string[];
}

interface BreakoutRoomsProps {
	workspaceId: string;
}

const BreakoutRooms: React.FC<BreakoutRoomsProps> = ({ workspaceId }) => {
	const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
	const [newRoomName, setNewRoomName] = useState("");

	useEffect(() => {
		fetchBreakoutRooms();
	}, []); // Removed unnecessary workspaceId dependency

	const fetchBreakoutRooms = async () => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/breakout-rooms`,
		);
		if (response.ok) {
			const data = await response.json();
			setRooms(data);
		}
	};

	const createBreakoutRoom = async () => {
		if (newRoomName) {
			const response = await fetch(
				`/api/workspaces/${workspaceId}/breakout-rooms`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: newRoomName }),
				},
			);
			if (response.ok) {
				const newRoom = await response.json();
				setRooms([...rooms, newRoom]);
				setNewRoomName("");
			}
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Breakout Rooms</h2>
			<div className="flex space-x-2">
				<Input
					value={newRoomName}
					onChange={(e) => setNewRoomName(e.target.value)}
					placeholder="New room name"
				/>
				<Button onClick={createBreakoutRoom}>Create Room</Button>
			</div>
			<div className="grid grid-cols-2 gap-4">
				{rooms.map((room) => (
					<div key={room.id} className="border p-4 rounded">
						<h3 className="font-bold">{room.name}</h3>
						<p>Participants: {room.participants.length}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default BreakoutRooms;
