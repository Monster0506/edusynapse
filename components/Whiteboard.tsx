import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface WhiteboardProps {
	workspaceId: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ workspaceId }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
	const [versions, setVersions] = useState<
		{ id: string; versionNumber: number }[]
	>([]);
	const [currentVersion, setCurrentVersion] = useState<string>("");

	useEffect(() => {
		if (canvasRef.current) {
			const newCanvas = new fabric.Canvas(canvasRef.current, {
				width: 800,
				height: 600,
			});
			setCanvas(newCanvas);

			// Load initial whiteboard content
			loadWhiteboardContent(workspaceId);
		}
	}, [workspaceId]);

	const loadWhiteboardContent = async (workspaceId: string) => {
		const response = await fetch(`/api/workspaces/${workspaceId}/whiteboard`);
		if (response.ok) {
			const data = await response.json();
			if (canvas) {
				canvas.loadFromJSON(data.content, canvas.renderAll.bind(canvas));
			}
			setVersions(data.versions);
			setCurrentVersion(data.currentVersion);
		}
	};

	const saveVersion = async () => {
		if (canvas) {
			const content = JSON.stringify(canvas.toJSON());
			const response = await fetch(
				`/api/workspaces/${workspaceId}/whiteboard/versions`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ content }),
				},
			);
			if (response.ok) {
				const newVersion = await response.json();
				setVersions([...versions, newVersion]);
				setCurrentVersion(newVersion.id);
			}
		}
	};

	const loadVersion = async (versionId: string) => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/whiteboard/versions/${versionId}`,
		);
		if (response.ok) {
			const data = await response.json();
			if (canvas) {
				canvas.loadFromJSON(data.content, canvas.renderAll.bind(canvas));
			}
			setCurrentVersion(versionId);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Button onClick={saveVersion}>Save Version</Button>
				<Select value={currentVersion} onValueChange={loadVersion}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select version" />
					</SelectTrigger>
					<SelectContent>
						{versions.map((version) => (
							<SelectItem key={version.id} value={version.id}>
								Version {version.versionNumber}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<canvas ref={canvasRef} />
		</div>
	);
};

export default Whiteboard;
