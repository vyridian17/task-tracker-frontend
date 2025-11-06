export interface Task {
	id: number;
	title: string;
	completed: boolean;
	updated_at: string;
	created_at: string;
}

export interface TaskStats {
	total: number;
	complete: number;
	active: number;
	completed: number;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export type TaskFilter = 'all' | 'active' | 'completed';