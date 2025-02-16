import type React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
	return (
		<div className="mb-4">
			<label
				className="block text-gray-700 text-sm font-bold mb-2"
				htmlFor={props.id}
			>
				{label}
			</label>
			<input
				className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
					error ? "border-red-500" : ""
				}`}
				{...props}
			/>
			{error && <p className="text-red-500 text-xs italic">{error}</p>}
		</div>
	);
};

export default Input;
