import type { Task } from "../types/task.ts";

interface TaskItemProps {
	task: Task;
	onToggle: (id: number) => void;
	onDelete: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
	return (
		<li>
			<input
				type="checkbox"
				id={`task-${task.id}`}
				checked={task.completed}
				onChange={() => onToggle(task.id)}
			/>
			<label htmlFor={`task-${task.id}`}>
				{task.title}
			</label>
			<button onClick={() => onDelete(task.id)}>✕</button>
		</li>
	);
}