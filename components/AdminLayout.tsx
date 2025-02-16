import type React from "react";
import Link from "next/link";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<div className="flex h-screen bg-gray-100">
			<aside className="w-64 bg-background shadow-md">
				<div className="p-4">
					<h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
				</div>
				<nav className="mt-4">
					<Link
						href="/admin/dashboard"
						className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
					>
						Dashboard
					</Link>
					<Link
						href="/admin/users"
						className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
					>
						User Management
					</Link>
					<Link
						href="/admin/content"
						className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
					>
						Content Management
					</Link>
					<Link
						href="/admin/analytics"
						className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
					>
						Analytics
					</Link>
				</nav>
			</aside>
			<main className="flex-1 p-8 overflow-y-auto">{children}</main>
		</div>
	);
};

export default AdminLayout;
