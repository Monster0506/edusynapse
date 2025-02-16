import type React from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

const CreateWorkspaceForm: React.FC = () => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const queryClient = useQueryClient();

	const createWorkspaceMutation = useMutation(
		async (newWorkspace: { name: string; description: string }) => {
			const token = localStorage.getItem("token");
			if (!token) throw new Error("No token found");

			const res = await fetch("/api/workspaces", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(newWorkspace),
			});

			if (!res.ok) throw new Error("Failed to create workspace");

			return res.json();
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries("workspaces");
				setName("");
				setDescription("");
			},
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createWorkspaceMutation.mutate({ name, description });
	};

	return (
		<form onSubmit={handleSubmit} className="bg-background shadow-md rounded-lg p-6">
			<h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
			<div className="mb-4">
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700"
				>
					Name
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					required
				/>
			</div>
			<div className="mb-4">
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700"
				>
					Description
				</label>
				<textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					rows={3}
				></textarea>
			</div>
			<button
				type="submit"
				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
				disabled={createWorkspaceMutation.isLoading}
			>
				{createWorkspaceMutation.isLoading ? "Creating..." : "Create Workspace"}
			</button>
		</form>
	);
};

export default CreateWorkspaceForm;
