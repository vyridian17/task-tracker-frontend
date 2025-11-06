import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task, TaskStats } from '../../types/task';

// Create mocks in hoisted scope (runs before imports)
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
const mockAxiosInstance = {
	get: mockGet,
	post: mockPost,
	patch: mockPatch,
	delete: mockDelete,
};

// Mock axios module before importing Tasks class
vi.mock('axios', () => ({
	default: {
		create: vi.fn(() => mockAxiosInstance),
	},
}));

// Now import the Tasks class (it will use the mocked axios)
const { Tasks } = await import('../tasks');

describe('Tasks API Service', () => {
	let tasksApi: InstanceType<typeof Tasks>;

	beforeEach(() => {
		vi.clearAllMocks();
		tasksApi = new Tasks();
	});

	describe('get()', () => {
		const mockTasks: Task[] = [
			{
				id: 1,
				title: 'Test task 1',
				completed: false,
				created_at: '2025-01-01T00:00:00Z',
				updated_at: '2025-01-01T00:00:00Z',
			},
			{
				id: 2,
				title: 'Test task 2',
				completed: true,
				created_at: '2025-01-02T00:00:00Z',
				updated_at: '2025-01-02T00:00:00Z',
			},
		];

		it('fetches all tasks without filter', async () => {
			mockGet.mockResolvedValue({ data: { results: mockTasks } });

			const result = await tasksApi.get();

			expect(mockGet).toHaveBeenCalledWith('/tasks', {
				params: {},
			});
			expect(result).toEqual(mockTasks);
		});

		it('fetches completed tasks when completed=true', async () => {
			const completedTasks = mockTasks.filter(t => t.completed);
			mockGet.mockResolvedValue({ data: { results: completedTasks } });

			const result = await tasksApi.get(true);

			expect(mockGet).toHaveBeenCalledWith('/tasks', {
				params: { completed: true },
			});
			expect(result).toEqual(completedTasks);
		});

		it('fetches active tasks when completed=false', async () => {
			const activeTasks = mockTasks.filter(t => !t.completed);
			mockGet.mockResolvedValue({ data: { results: activeTasks } });

			const result = await tasksApi.get(false);

			expect(mockGet).toHaveBeenCalledWith('/tasks', {
				params: { completed: false },
			});
			expect(result).toEqual(activeTasks);
		});

		it('handles empty task list', async () => {
			mockGet.mockResolvedValue({ data: { results: [] } });

			const result = await tasksApi.get();

			expect(result).toEqual([]);
		});
	});

	describe('create()', () => {
		it('creates a new task', async () => {
			const newTask: Task = {
				id: 3,
				title: 'New task',
				completed: false,
				created_at: '2025-01-03T00:00:00Z',
				updated_at: '2025-01-03T00:00:00Z',
			};
			mockPost.mockResolvedValue({ data: newTask });

			const result = await tasksApi.create('New task');

			expect(mockPost).toHaveBeenCalledWith('/tasks/', { title: 'New task' });
			expect(result).toEqual(newTask);
		});

		it('creates task with special characters', async () => {
			const taskWithSpecialChars: Task = {
				id: 4,
				title: 'Task with émojis 🎉 & symbols!',
				completed: false,
				created_at: '2025-01-04T00:00:00Z',
				updated_at: '2025-01-04T00:00:00Z',
			};
			mockPost.mockResolvedValue({ data: taskWithSpecialChars });

			const result = await tasksApi.create('Task with émojis 🎉 & symbols!');

			expect(mockPost).toHaveBeenCalledWith('/tasks/', {
				title: 'Task with émojis 🎉 & symbols!',
			});
			expect(result).toEqual(taskWithSpecialChars);
		});
	});

	describe('update()', () => {
		it('updates task completion status', async () => {
			const updatedTask: Task = {
				id: 1,
				title: 'Test task',
				completed: true,
				created_at: '2025-01-01T00:00:00Z',
				updated_at: '2025-01-01T12:00:00Z',
			};
			mockPatch.mockResolvedValue({ data: updatedTask });

			const result = await tasksApi.update(1, { completed: true });

			expect(mockPatch).toHaveBeenCalledWith('/tasks/1/', { completed: true });
			expect(result).toEqual(updatedTask);
		});

		it('updates task title', async () => {
			const updatedTask: Task = {
				id: 1,
				title: 'Updated title',
				completed: false,
				created_at: '2025-01-01T00:00:00Z',
				updated_at: '2025-01-01T12:00:00Z',
			};
			mockPatch.mockResolvedValue({ data: updatedTask });

			const result = await tasksApi.update(1, { title: 'Updated title' });

			expect(mockPatch).toHaveBeenCalledWith('/tasks/1/', {
				title: 'Updated title',
			});
			expect(result).toEqual(updatedTask);
		});

		it('updates multiple fields', async () => {
			const updatedTask: Task = {
				id: 1,
				title: 'New title',
				completed: true,
				created_at: '2025-01-01T00:00:00Z',
				updated_at: '2025-01-01T12:00:00Z',
			};
			mockPatch.mockResolvedValue({ data: updatedTask });

			const result = await tasksApi.update(1, {
				title: 'New title',
				completed: true,
			});

			expect(mockPatch).toHaveBeenCalledWith('/tasks/1/', {
				title: 'New title',
				completed: true,
			});
			expect(result).toEqual(updatedTask);
		});
	});

	describe('delete()', () => {
		it('deletes a task', async () => {
			mockDelete.mockResolvedValue({ data: null });

			await tasksApi.delete(1);

			expect(mockDelete).toHaveBeenCalledWith('/tasks/1/');
		});

		it('returns void (Promise<void>)', async () => {
			mockDelete.mockResolvedValue({ data: null });

			const result = await tasksApi.delete(1);

			expect(result).toBeUndefined();
		});
	});

	describe('getStats()', () => {
		it('fetches task statistics', async () => {
			const mockStats: TaskStats = {
				total: 10,
				completed: 7,
				active: 3,
				completion_rate: 70.0,
			};
			mockGet.mockResolvedValue({ data: mockStats });

			const result = await tasksApi.getStats();

			expect(mockGet).toHaveBeenCalledWith('/tasks/stats/');
			expect(result).toEqual(mockStats);
		});

		it('handles zero tasks', async () => {
			const emptyStats: TaskStats = {
				total: 0,
				completed: 0,
				active: 0,
				completion_rate: 0.0,
			};
			mockGet.mockResolvedValue({ data: emptyStats });

			const result = await tasksApi.getStats();

			expect(result).toEqual(emptyStats);
		});

		it('handles 100% completion', async () => {
			const fullStats: TaskStats = {
				total: 5,
				completed: 5,
				active: 0,
				completion_rate: 100.0,
			};
			mockGet.mockResolvedValue({ data: fullStats });

			const result = await tasksApi.getStats();

			expect(result).toEqual(fullStats);
			expect(result.completion_rate).toBe(100.0);
		});
	});

	describe('error handling', () => {
		it('propagates errors from get()', async () => {
			const error = new Error('Network error');
			mockGet.mockRejectedValue(error);

			await expect(tasksApi.get()).rejects.toThrow('Network error');
		});

		it('propagates errors from create()', async () => {
			const error = new Error('Validation error');
			mockPost.mockRejectedValue(error);

			await expect(tasksApi.create('Test')).rejects.toThrow('Validation error');
		});

		it('propagates errors from update()', async () => {
			const error = new Error('Not found');
			mockPatch.mockRejectedValue(error);

			await expect(tasksApi.update(999, { completed: true })).rejects.toThrow(
				'Not found'
			);
		});

		it('propagates errors from delete()', async () => {
			const error = new Error('Not found');
			mockDelete.mockRejectedValue(error);

			await expect(tasksApi.delete(999)).rejects.toThrow('Not found');
		});

		it('propagates errors from getStats()', async () => {
			const error = new Error('Server error');
			mockGet.mockRejectedValue(error);

			await expect(tasksApi.getStats()).rejects.toThrow('Server error');
		});
	});
});
