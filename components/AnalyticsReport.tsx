import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

interface AnalyticsReportProps {
	data: Record<
		string,
		{ topicName: string; totalTimeSpent: number; averageScore: number }
	>;
	setDateRange: (range: {
		startDate: string | null;
		endDate: string | null;
	}) => void;
}

const AnalyticsReport: React.FC<AnalyticsReportProps> = ({
	data,
	setDateRange,
}) => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const handleDateRangeChange = () => {
		setDateRange({ startDate, endDate });
	};

	const chartData = {
		labels: Object.values(data).map((topic) => topic.topicName),
		datasets: [
			{
				label: "Time Spent (minutes)",
				data: Object.values(data).map((topic) => topic.totalTimeSpent),
				backgroundColor: "rgba(75, 192, 192, 0.6)",
			},
			{
				label: "Average Score",
				data: Object.values(data).map((topic) => topic.averageScore),
				backgroundColor: "rgba(153, 102, 255, 0.6)",
			},
		],
	};

	const options = {
		responsive: true,
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	return (
		<div className="bg-background shadow-md rounded-lg p-6">
			<div className="mb-4 flex space-x-4">
				<div>
					<label
						htmlFor="startDate"
						className="block text-sm font-medium text-gray-700"
					>
						Start Date
					</label>
					<input
						type="date"
						id="startDate"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					/>
				</div>
				<div>
					<label
						htmlFor="endDate"
						className="block text-sm font-medium text-gray-700"
					>
						End Date
					</label>
					<input
						type="date"
						id="endDate"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					/>
				</div>
				<div className="flex items-end">
					<button
						onClick={handleDateRangeChange}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
					>
						Apply
					</button>
				</div>
			</div>
			<Bar data={chartData} options={options} />
			<div className="mt-8">
				<h3 className="text-xl font-semibold mb-4">Detailed Report</h3>
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Topic
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Time Spent (minutes)
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Average Score
							</th>
						</tr>
					</thead>
					<tbody className="bg-background divide-y divide-gray-200">
						{Object.entries(data).map(([topicId, topic]) => (
							<tr key={topicId}>
								<td className="px-6 py-4 whitespace-nowrap">
									{topic.topicName}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{topic.totalTimeSpent}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{topic.averageScore.toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AnalyticsReport;
