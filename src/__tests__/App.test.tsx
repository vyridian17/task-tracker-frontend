import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { Tasks } from '../api/tasks';
import type { Task, TaskStats } from '../types/task';

// Mock the Tasks API class
vi.mock('../api/tasks');

describe('App Component', () => {
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

	const mockStats: TaskStats = {
		total: 2,
		completed: 1,
		complete: 1,
		active: 1,
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup default mock implementations
		vi.mocked(Tasks.prototype.get).mockResolvedValue(mockTasks);
		vi.mocked(Tasks.prototype.getStats).mockResolvedValue(mockStats);
		vi.mocked(Tasks.prototype.create).mockResolvedValue(mockTasks[0]);
		vi.mocked(Tasks.prototype.update).mockResolvedValue(mockTasks[0]);
		vi.mocked(Tasks.prototype.delete).mockResolvedValue(undefined);
	});

	describe('Initial Load', () => {
		it('shows loading spinner on mount', () => {
			render(<App />);

			expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
			expect(screen.getByRole('heading', { name: /Task Tracker/i })).toBeInTheDocument();
		});

		it('loads and displays tasks after initial fetch', async () => {
			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			expect(screen.getByText('Test task 2')).toBeInTheDocument();
			expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
		});

		it('calls get() and getStats() on mount', async () => {
			render(<App />);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalledTimes(1);
			});

			expect(vi.mocked(Tasks.prototype.getStats)).toHaveBeenCalledTimes(1);
		});
	});

	describe('Error Handling', () => {
		it('displays error message when initial fetch fails', async () => {
			vi.mocked(Tasks.prototype.get).mockRejectedValueOnce(new Error('Network error'));

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument();
			});
		});

		it('displays error message when stats fetch fails', async () => {
			vi.mocked(Tasks.prototype.getStats).mockRejectedValueOnce(new Error('Stats error'));

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText(/Failed to load statistics/i)).toBeInTheDocument();
			});
		});

		it('allows dismissing error message', async () => {
			const user = userEvent.setup();
			vi.mocked(Tasks.prototype.get).mockRejectedValueOnce(new Error('Network error'));

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument();
			});

			const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
			await user.click(dismissButton);

			expect(screen.queryByText(/Failed to load tasks/i)).not.toBeInTheDocument();
		});

		it('displays error when create task fails', async () => {
			const user = userEvent.setup();
			vi.mocked(Tasks.prototype.create).mockRejectedValueOnce(new Error('Create failed'));

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const input = screen.getByPlaceholderText(/What needs to be done/i);
			const submitButton = screen.getByRole('button', { name: /Add Task/i });

			await user.type(input, 'New task');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/Failed to create task/i)).toBeInTheDocument();
			});
		});

		it('displays error when toggle task fails', async () => {
			const user = userEvent.setup();
			vi.mocked(Tasks.prototype.update).mockRejectedValueOnce(new Error('Update failed'));

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const checkbox = screen.getAllByRole('checkbox')[0];
			await user.click(checkbox);

			await waitFor(() => {
				expect(screen.getByText(/Failed to update task/i)).toBeInTheDocument();
			});
		});

		it('displays error when delete task fails', async () => {
			const user = userEvent.setup();
			vi.mocked(Tasks.prototype.delete).mockRejectedValueOnce(new Error('Delete failed'));

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const deleteButtons = screen.getAllByRole('button', { name: /✕/i });
			await user.click(deleteButtons[0]);

			await waitFor(() => {
				expect(screen.getByText(/Failed to delete task/i)).toBeInTheDocument();
			});
		});

		it('displays error when filter change fails', async () => {
			const user = userEvent.setup();

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			vi.mocked(Tasks.prototype.get).mockRejectedValueOnce(new Error('Filter failed'));

			const activeButton = screen.getByRole('button', { name: /Active/i });
			await user.click(activeButton);

			await waitFor(() => {
				expect(screen.getByText(/Failed to filter tasks/i)).toBeInTheDocument();
			});
		});

		it('clears error on successful operation after previous error', async () => {
			const user = userEvent.setup();
			vi.mocked(Tasks.prototype.create)
				.mockRejectedValueOnce(new Error('Create failed'))
				.mockResolvedValueOnce(mockTasks[0]);

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const input = screen.getByPlaceholderText(/What needs to be done/i);
			const submitButton = screen.getByRole('button', { name: /Add Task/i });

			// First attempt - fails
			await user.type(input, 'New task');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/Failed to create task/i)).toBeInTheDocument();
			});

			// Second attempt - succeeds
			await user.type(input, 'Another task');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.queryByText(/Failed to create task/i)).not.toBeInTheDocument();
			});
		});
	});

	describe('Task Operations', () => {
		it('creates a new task', async () => {
			const user = userEvent.setup();
			const newTask: Task = {
				id: 3,
				title: 'New task',
				completed: false,
				created_at: '2025-01-03T00:00:00Z',
				updated_at: '2025-01-03T00:00:00Z',
			};
			vi.mocked(Tasks.prototype.create).mockResolvedValueOnce(newTask);

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const input = screen.getByPlaceholderText(/What needs to be done/i);
			const submitButton = screen.getByRole('button', { name: /Add Task/i });

			await user.type(input, 'New task');
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.create)).toHaveBeenCalledWith('New task');
			});

			expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalled();
			expect(vi.mocked(Tasks.prototype.getStats)).toHaveBeenCalled();
		});

		it('toggles task completion', async () => {
			const user = userEvent.setup();

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const checkbox = screen.getAllByRole('checkbox')[0];
			await user.click(checkbox);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.update)).toHaveBeenCalledWith(1, { completed: true });
			});

			expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalled();
			expect(vi.mocked(Tasks.prototype.getStats)).toHaveBeenCalled();
		});

		it('deletes a task', async () => {
			const user = userEvent.setup();

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const deleteButtons = screen.getAllByRole('button', { name: /✕/i });
			await user.click(deleteButtons[0]);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.delete)).toHaveBeenCalledWith(1);
			});

			expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalled();
			expect(vi.mocked(Tasks.prototype.getStats)).toHaveBeenCalled();
		});
	});

	describe('Filtering', () => {
		it('displays all tasks by default', async () => {
			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalledWith();
		});

		it('filters active tasks', async () => {
			const user = userEvent.setup();
			const activeTasks = mockTasks.filter(t => !t.completed);
			vi.mocked(Tasks.prototype.get).mockResolvedValueOnce(activeTasks);

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const activeButton = screen.getByRole('button', { name: /Active/i });
			await user.click(activeButton);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalledWith(false);
			});
		});

		it('filters completed tasks', async () => {
			const user = userEvent.setup();
			const completedTasks = mockTasks.filter(t => t.completed);

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			// Mock the get call for completed tasks AFTER initial load
			vi.mocked(Tasks.prototype.get).mockResolvedValueOnce(completedTasks);

			const completedButton = screen.getByRole('button', { name: /Completed/i });
			await user.click(completedButton);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalledWith(true);
			});
		});

		it('switches back to all tasks', async () => {
			const user = userEvent.setup();

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const completedButton = screen.getByRole('button', { name: /Completed/i });
			await user.click(completedButton);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalledWith(true);
			});

			const allButton = screen.getByRole('button', { name: /All/i });
			await user.click(allButton);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.get)).toHaveBeenCalledWith();
			});
		});
	});

	describe('Stats Display', () => {
		it('displays task statistics in filter buttons', async () => {
			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			expect(screen.getByRole('button', { name: /All \(2\)/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Active \(1\)/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Completed \(1\)/i })).toBeInTheDocument();
		});

		it('updates stats after creating a task', async () => {
			const user = userEvent.setup();
			const updatedStats: TaskStats = {
				total: 3,
				completed: 1,
				complete: 1,
				active: 2,
			};
			vi.mocked(Tasks.prototype.getStats).mockResolvedValueOnce(updatedStats);

			render(<App />);

			await waitFor(() => {
				expect(screen.getByText('Test task 1')).toBeInTheDocument();
			});

			const input = screen.getByPlaceholderText(/What needs to be done/i);
			const submitButton = screen.getByRole('button', { name: /Add Task/i });

			await user.type(input, 'New task');
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(Tasks.prototype.getStats)).toHaveBeenCalledTimes(2);
			});
		});
	});
});
