import { useState } from "react";

interface TaskCreateFormProps {
	onSubmit: (title: string) => void | Promise<void>;
}

export function TaskCreateForm({ onSubmit }: TaskCreateFormProps) {
	const [newTaskTitle, setNewTaskTitle] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newTaskTitle.trim()) return;

		await onSubmit(newTaskTitle);
		setNewTaskTitle("");
	};
	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="new-task">New Task</label>
			<input
				type="text"
				id="new-task"
				placeholder="What needs to be done?"
				value={newTaskTitle}
				onChange={e => setNewTaskTitle(e.target.value)}
			/>
			<button type="submit" disabled={!newTaskTitle.trim()}>
				Add Task
			</button>
		</form>
	);
}

