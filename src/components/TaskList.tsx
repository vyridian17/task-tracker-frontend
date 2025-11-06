import { TaskItem } from "./TaskItem.tsx";
import type { Task } from "../types/task.ts";

interface TaskListProps {
	tasks: Task[];
	onToggle: (id: number) => void;
	onDelete: (id: number) => void;
}

export function TaskList({tasks, onToggle, onDelete}: TaskListProps) {
	return (
		<>
			<ul>
				{tasks.map(task => (
					<TaskItem
						key={task.id}
						task={task}
						onToggle={onToggle}
						onDelete={onDelete}
					/>
				))}
			</ul>
			<p>{tasks.length >= 1 ? `Tasks: ${tasks.length}` : "No tasks here. Let's get started!"}</p>
		</>
	);
}