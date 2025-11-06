import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../TaskList';
import type { Task } from '../../types/task';

describe('TaskList', () => {
	const mockTasks: Task[] = [
		{
			id: 1,
			title: 'First task',
			completed: false,
			created_at: '2025-01-01T00:00:00Z',
			updated_at: '2025-01-01T00:00:00Z',
		},
		{
			id: 2,
			title: 'Second task',
			completed: true,
			created_at: '2025-01-02T00:00:00Z',
			updated_at: '2025-01-02T00:00:00Z',
		},
	];

	it('renders empty state message when no tasks', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskList tasks={[]} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText("No tasks here. Let's get started!")).toBeInTheDocument();
	});

	it('renders task count when tasks exist', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Tasks: 2')).toBeInTheDocument();
	});

	it('renders all tasks', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('First task')).toBeInTheDocument();
		expect(screen.getByText('Second task')).toBeInTheDocument();
	});

	it('renders correct number of TaskItem components', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		const listItems = screen.getAllByRole('listitem');
		expect(listItems).toHaveLength(2);
	});

	it('passes onToggle to TaskItem components', async () => {
		const user = userEvent.setup();
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		// Click the first checkbox
		const checkboxes = screen.getAllByRole('checkbox');
		await user.click(checkboxes[0]);

		expect(mockToggle).toHaveBeenCalledWith(1);
	});

	it('passes onDelete to TaskItem components', async () => {
		const user = userEvent.setup();
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		// Click the first delete button
		const deleteButtons = screen.getAllByRole('button', { name: /✕/i });
		await user.click(deleteButtons[0]);

		expect(mockDelete).toHaveBeenCalledWith(1);
	});

	it('renders single task correctly', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();
		const singleTask = [mockTasks[0]];

		render(<TaskList tasks={singleTask} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Tasks: 1')).toBeInTheDocument();
		expect(screen.getByText('First task')).toBeInTheDocument();
	});

	it('renders many tasks correctly', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();
		const manyTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
			id: i + 1,
			title: `Task ${i + 1}`,
			completed: false,
			created_at: '2025-01-01T00:00:00Z',
			updated_at: '2025-01-01T00:00:00Z',
		}));

		render(<TaskList tasks={manyTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Tasks: 10')).toBeInTheDocument();
		const listItems = screen.getAllByRole('listitem');
		expect(listItems).toHaveLength(10);
	});

	it('updates when tasks prop changes', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		const { rerender } = render(
			<TaskList tasks={[mockTasks[0]]} onToggle={mockToggle} onDelete={mockDelete} />
		);

		expect(screen.getByText('Tasks: 1')).toBeInTheDocument();

		// Update with more tasks
		rerender(<TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Tasks: 2')).toBeInTheDocument();
	});
});
