import { Task } from '../schema';

export default function TaskCard({ task }: { task: Task }) {
	return <div class="border-border rounded-lg border p-2 text-sm shadow">{task.title}</div>;
}
