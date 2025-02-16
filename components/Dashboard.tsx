import type React from "react";

interface DashboardData {
	[key: string]: any; // Replace 'any' with the actual type of your data
}

const Dashboard: React.FC<{ dashboardData: DashboardData }> = ({
	dashboardData,
}) => {
	if (!dashboardData || Object.keys(dashboardData).length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<p className="text-xl font-semibold">
					No data available. Start by creating some content!
				</p>
			</div>
		);
	}

	// rest of the code to display dashboard data
	return (
		<div>
			<h1>Dashboard</h1>
			{/* Example: Displaying data */}
			{Object.entries(dashboardData).map(([key, value]) => (
				<div key={key}>
					<h3>{key}:</h3>
					<p>{JSON.stringify(value)}</p>
				</div>
			))}
		</div>
	);
};

export default Dashboard;
