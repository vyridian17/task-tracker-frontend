import type { TaskFilter, TaskStats } from "../types/task.ts";

interface TaskFilterButtonsProps {
	currentFilter: TaskFilter;
	stats: TaskStats;
	onFilterChange: (filter: TaskFilter) => void;
}

export function TaskFilterButtons({ currentFilter, stats, onFilterChange }: TaskFilterButtonsProps) {
	return (
		<>
			<button
				style={currentFilter === 'all' ? { color: 'green' } : {}}
				onClick={() => onFilterChange('all')}
				value={'all'}>All {stats.total > 0 && `(${stats.total})`}
			</button>
			<button
				style={currentFilter === 'active' ? { color: 'green' } : {}}
				onClick={() => onFilterChange('active')}
				value={'active'}>Active ({stats.active})
			</button>
			<button
				style={currentFilter === 'completed' ? { color: 'green' } : {}}
				onClick={() => onFilterChange('completed')}
				value={'completed'}>Completed ({stats.completed}) ({stats.completion_rate}%)
			</button>
		</>
	);
}