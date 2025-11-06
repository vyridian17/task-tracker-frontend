import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFilterButtons } from '../TaskFilterButtons';
import type { TaskStats } from '../../types/task';

describe('TaskFilterButtons', () => {
	const mockStats: TaskStats = {
		total: 10,
		completed: 7,
		completion_rate: 7,
		active: 3,
	};

	it('renders all three filter buttons', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Active/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument();
	});

	it('displays total count in All button when total > 0', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		expect(screen.getByRole('button', { name: /All \(10\)/i })).toBeInTheDocument();
	});

	it('hides total count in All button when total is 0', () => {
		const mockOnFilterChange = vi.fn();
		const emptyStats = { ...mockStats, total: 0 };

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={emptyStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const allButton = screen.getByRole('button', { name: /^All$/i });
		expect(allButton).toBeInTheDocument();
		expect(allButton).not.toHaveTextContent('(0)');
	});

	it('displays active count in Active button', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		expect(screen.getByRole('button', { name: /Active \(3\)/i })).toBeInTheDocument();
	});

	it('displays completed count in Completed button', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		expect(screen.getByRole('button', { name: /Completed \(7\)/i })).toBeInTheDocument();
	});

	it('highlights All button when currentFilter is "all"', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const allButton = screen.getByRole('button', { name: /All/i });
		expect(allButton).toHaveStyle({ color: 'rgb(0, 128, 0)' });
	});

	it('highlights Active button when currentFilter is "active"', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="active"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const activeButton = screen.getByRole('button', { name: /Active/i });
		expect(activeButton).toHaveStyle({ color: 'rgb(0, 128, 0)' });
	});

	it('highlights Completed button when currentFilter is "completed"', () => {
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="completed"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const completedButton = screen.getByRole('button', { name: /Completed/i });
		expect(completedButton).toHaveStyle({ color: 'rgb(0, 128, 0)' });
	});

	it('calls onFilterChange with "all" when All button is clicked', async () => {
		const user = userEvent.setup();
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="active"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const allButton = screen.getByRole('button', { name: /All/i });
		await user.click(allButton);

		expect(mockOnFilterChange).toHaveBeenCalledWith('all');
		expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
	});

	it('calls onFilterChange with "active" when Active button is clicked', async () => {
		const user = userEvent.setup();
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const activeButton = screen.getByRole('button', { name: /Active/i });
		await user.click(activeButton);

		expect(mockOnFilterChange).toHaveBeenCalledWith('active');
		expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
	});

	it('calls onFilterChange with "completed" when Completed button is clicked', async () => {
		const user = userEvent.setup();
		const mockOnFilterChange = vi.fn();

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const completedButton = screen.getByRole('button', { name: /Completed/i });
		await user.click(completedButton);

		expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
		expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
	});

	it('displays zero counts correctly', () => {
		const mockOnFilterChange = vi.fn();
		const zeroStats: TaskStats = {
			total: 0,
			completed: 0,
			completion_rate: 0,
			active: 0,
		};

		render(
			<TaskFilterButtons
				currentFilter="all"
				stats={zeroStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		expect(screen.getByRole('button', { name: /Active \(0\)/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Completed \(0\)/i })).toBeInTheDocument();
	});

	it('updates highlighted button when currentFilter prop changes', () => {
		const mockOnFilterChange = vi.fn();

		const { rerender } = render(
			<TaskFilterButtons
				currentFilter="all"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const allButton = screen.getByRole('button', { name: /All/i });
		expect(allButton).toHaveStyle({ color: 'rgb(0, 128, 0)' });

		// Change filter to active
		rerender(
			<TaskFilterButtons
				currentFilter="active"
				stats={mockStats}
				onFilterChange={mockOnFilterChange}
			/>
		);

		const activeButton = screen.getByRole('button', { name: /Active/i });
		expect(activeButton).toHaveStyle({ color: 'rgb(0, 128, 0)' });
		expect(allButton).not.toHaveStyle({ color: 'rgb(0, 128, 0)' });
	});
});
