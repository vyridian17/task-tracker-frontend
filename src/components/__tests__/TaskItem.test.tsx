import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../TaskItem';
import type { Task } from '../../types/task';

describe('TaskItem', () => {
	const mockTask: Task = {
		id: 1,
		title: 'Test task',
		completed: false,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	};

	it('renders task title', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskItem task={mockTask} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Test task')).toBeInTheDocument();
	});

	it('renders checkbox unchecked when task is not completed', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskItem task={mockTask} onToggle={mockToggle} onDelete={mockDelete} />);

		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).not.toBeChecked();
	});

	it('renders checkbox checked when task is completed', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();
		const completedTask = { ...mockTask, completed: true };

		render(<TaskItem task={completedTask} onToggle={mockToggle} onDelete={mockDelete} />);

		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeChecked();
	});

	it('calls onToggle with task id when checkbox is clicked', async () => {
		const user = userEvent.setup();
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskItem task={mockTask} onToggle={mockToggle} onDelete={mockDelete} />);

		const checkbox = screen.getByRole('checkbox');
		await user.click(checkbox);

		expect(mockToggle).toHaveBeenCalledWith(1);
		expect(mockToggle).toHaveBeenCalledTimes(1);
	});

	it('calls onDelete with task id when delete button is clicked', async () => {
		const user = userEvent.setup();
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskItem task={mockTask} onToggle={mockToggle} onDelete={mockDelete} />);

		const deleteButton = screen.getByRole('button', { name: /✕/i });
		await user.click(deleteButton);

		expect(mockDelete).toHaveBeenCalledWith(1);
		expect(mockDelete).toHaveBeenCalledTimes(1);
	});

	it('links label to checkbox via htmlFor', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();

		render(<TaskItem task={mockTask} onToggle={mockToggle} onDelete={mockDelete} />);

		const checkbox = screen.getByRole('checkbox');
		const label = screen.getByLabelText('Test task');

		expect(checkbox.id).toBe('task-1');
		expect(label).toBeInTheDocument();
	});

	it('renders different task titles correctly', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();
		const customTask = { ...mockTask, title: 'Buy groceries' };

		render(<TaskItem task={customTask} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Buy groceries')).toBeInTheDocument();
	});

	it('handles task with special characters in title', () => {
		const mockToggle = vi.fn();
		const mockDelete = vi.fn();
		const specialTask = { ...mockTask, title: 'Task with émojis 🎉 & symbols!' };

		render(<TaskItem task={specialTask} onToggle={mockToggle} onDelete={mockDelete} />);

		expect(screen.getByText('Task with émojis 🎉 & symbols!')).toBeInTheDocument();
	});
});
