"use client";

interface RolePreviewProps {
	selectedRole: "student" | "educator";
	onRoleChange: (role: "student" | "educator") => void;
}

export default function RolePreview({
	selectedRole,
	onRoleChange,
}: RolePreviewProps) {
	return (
		<div className="space-y-6">
			<h3 className="text-xl font-semibold text-gray-800">Choose Your Role</h3>
			<div className="flex space-x-4">
				<button
					className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
						selectedRole === "student"
							? "bg-blue-600 text-white hover:bg-blue-700"
							: "bg-background text-gray-700 border border-gray-300 hover:bg-gray-50"
					}`}
					onClick={() => onRoleChange("student")}
				>
					Student
				</button>
				<button
					className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
						selectedRole === "educator"
							? "bg-blue-600 text-white hover:bg-blue-700"
							: "bg-background text-gray-700 border border-gray-300 hover:bg-gray-50"
					}`}
					onClick={() => onRoleChange("educator")}
				>
					Educator
				</button>
			</div>
			<div className="bg-background border border-gray-200 rounded-lg shadow-sm">
				<div className="p-6">
					<h4 className="text-lg font-semibold text-gray-900 mb-1">
						{selectedRole === "student" ? "Student" : "Educator"} Features
					</h4>
					<p className="text-sm text-gray-600 mb-4">
						Here's what you can expect as a {selectedRole}:
					</p>
					<div>
						{selectedRole === "student" ? (
							<ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
								<li>Personalized learning paths</li>
								<li>Interactive quizzes and assessments</li>
								<li>Progress tracking and analytics</li>
								<li>Collaborative study groups</li>
								<li>Access to a wide range of courses</li>
							</ul>
						) : (
							<ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
								<li>Course creation and management tools</li>
								<li>Student progress monitoring</li>
								<li>Advanced analytics and reporting</li>
								<li>Interactive teaching features</li>
								<li>Curriculum planning assistance</li>
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
