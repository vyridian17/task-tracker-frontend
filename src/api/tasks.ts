import axios from 'axios';
import type { Task, TaskStats, PaginatedResponse } from "../types/task.ts";

const http = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 5000,
});

export class Tasks {
	get(completed?: boolean): Promise<Task[]> {
		return http.get<PaginatedResponse<Task>>(
			'/tasks', {
				params: completed !== undefined ? { completed } : {}
			}
		).then(res => res.data.results);
	}

	create(title: string): Promise<Task> {
		return http.post<Task>(
			'/tasks/',
			{ title }
		).then(res => res.data);
	}

	update(id: number, data: Partial<Task>): Promise<Task> {
		return http.patch<Task>(
			`/tasks/${ id }/`,
			data
		).then(res => res.data);
	}

	delete(id: number): Promise<void> {
		return http.delete(`/tasks/${ id }/`).then(() => undefined);
	}

	getStats(): Promise<TaskStats> {
		return http.get<TaskStats>(
			'/tasks/stats/'
		).then(res => res.data);
	}
}