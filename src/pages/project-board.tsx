import ProjectTab from '../components/project-tab';
import TaskCard from '../components/task-card';
import { Project, Status, Task } from '../schema';

export type BoardData = {
	id: number;
	title: string;
	created_at: string;
	tasks: Task[];
};

export default function ProjectBoard({
	project,
	tab,
	data = [],
}: {
	project: Project;
	tab: 'board' | 'list' | 'calendar' | 'dashboard';
	data?: BoardData[];
}) {
	return (
		<main>
			<ProjectTab project={project} tab={tab} />
			<div id="tab-content" role="tabpanel" class="flex min-h-[60rem] gap-5 px-8 py-4">
				<section></section>
				{data.map((val) => {
					return (
						<div>
							<section>
								<h1 class="border-border min-w-[15rem] rounded-lg border p-2 text-sm font-semibold uppercase tracking-wide">{val.title}</h1>
							</section>
							<section class="mt-5 flex flex-col gap-2">
								{val.tasks.map((task) => {
									return <TaskCard task={task as Task} />;
								})}
								<button
									class="rounded p-2 hover:bg-zinc-200"
									hx-get={`/p/${project.id}/t?statusId=${val.id}`}
									hx-target="this"
									hx-swap="outerHTML"
								>
									Add Task
								</button>
							</section>
						</div>
					);
				})}
			</div>
		</main>
	);
}
