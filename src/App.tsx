import './App.css';

import { Tasks } from "./api/tasks.ts";
import { useEffect, useState } from 'react';
import type { Task, TaskFilter, TaskStats } from './types/task';
import { TaskCreateForm } from "./components/TaskCreateForm.tsx";
import { TaskList } from "./components/TaskList.tsx";
import { TaskFilterButtons } from "./components/TaskFilterButtons.tsx";

const taskApi = new Tasks();

function App() {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
	const [taskStats, setTaskStats] = useState<TaskStats>({
		active: 0,
		completed: 0,
		completion_rate: 0,
		total: 0
	});

	const fetchTasks = async () => {
		setLoading(true);
		setError(null);
		try {
			const fetchedTasks = await taskApi.get();
			setTasks(fetchedTasks);
		} catch (e) {
			console.error('Failed to fetch tasks:', e);
			setError('Failed to load tasks. Please try refreshing the page.');
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		setLoading(true);
		setError(null);
		try {
			const fetchedStats = await taskApi.getStats();
			setTaskStats(fetchedStats);
		} catch (e) {
			console.error('Failed to fetch stats:', e);
			setError('Failed to load statistics.');
		} finally {
			setLoading(false);
		}
	};

	const onFilterChange = async (filter: TaskFilter) => {
		setTaskFilter(filter);
		setError(null);

		try {
			let fetchedTasks;

			if (filter === 'all') {
				fetchedTasks = await taskApi.get();
			} else if (filter === 'active') {
				fetchedTasks = await taskApi.get(false);
			} else {
				fetchedTasks = await taskApi.get(true);
			}

			setTasks(fetchedTasks);
		} catch (e) {
			console.error('Failed to filter tasks', e);
			setError('Failed to filter tasks. Please try again.');
		}
	};

	useEffect(() => {
		fetchTasks().then();
		fetchStats().then();
	}, []);

	const handleToggleTask = async (id: number) => {
		try {
			setError(null);
			const taskToToggle = tasks.find(task => task.id === id);
			if (!taskToToggle) return;

			await taskApi.update(id, { completed: !taskToToggle.completed });
			await fetchTasks();
			await fetchStats();
		} catch (error) {
			console.error('Failed to toggle task:', error);
			setError('Failed to update task. Please try again.');
		}
	};

	const handleDeleteTask = async (id: number) => {
		try {
			setError(null);
			await taskApi.delete(id);
			await fetchTasks();
			await fetchStats();
		} catch (error) {
			console.error('Failed to delete task:', error);
			setError('Failed to delete task. Please try again.');
		}
	};

	const handleCreateTask = async (title: string) => {
		try {
			setError(null);
			await taskApi.create(title);
			await fetchTasks();
			await fetchStats();
		} catch (err) {
			console.error('Failed to create task:', err);
			setError('Failed to create task. Please try again.');
		}
	};

	return (
		<>
			<h1>Task Tracker</h1>
			<div>
				<TaskCreateForm onSubmit={handleCreateTask}/>
				<TaskFilterButtons
					currentFilter={taskFilter}
					stats={taskStats}
					onFilterChange={onFilterChange}
				/>

				{error && (
					<div className="error-message">
						<p>{error}</p>
						<button onClick={() => setError(null)}>Dismiss</button>
					</div>
				)}

				{loading ? (
					<div className="loading-spinner">
						<div className="spinner"></div>
						<p>Loading tasks...</p>
					</div>
				) : (
					<TaskList
						tasks={tasks}
						onToggle={handleToggleTask}
						onDelete={handleDeleteTask}
					/>
				)}
			</div>
		</>
	);
}

export default App;
