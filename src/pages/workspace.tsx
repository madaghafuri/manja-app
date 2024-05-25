import AuthenticatedNav from '../components/authenticated-nav';
import BaseLayout from '../layouts/base-layout';
import { Project, Task, Workspace as WorkspaceType } from '../schema';

export default function Workspace({
	authId,
	workspace,
	projects = [],
	tasks = [],
}: {
	authId?: number;
	workspace: WorkspaceType;
	projects?: Project[];
	tasks?: Task[];
}) {
	return (
		<BaseLayout authId={authId} navigation={<AuthenticatedNav workspace={workspace} projects={projects}></AuthenticatedNav>}>
			<main class="bg-background border-border min-w-[90rem] border shadow-lg">
				<div class="border-border border-b-[1px] px-6 py-3">
					<h1 class="text-2xl font-bold">{workspace.title}</h1>
				</div>
				<div class="flex gap-5 p-6">
					<div class="border-border min-h-[30rem] w-1/2 rounded-lg border p-3 hover:border-gray-500 hover:shadow-lg">
						<h1 class="text-lg font-bold">Recents</h1>
						<div class="flex flex-col">
							{tasks?.map((task) => {
								return (
									<button
										id={`task-card-${task.id}`}
										hx-get={`/p/${task.project.id}/t/${task.id}`}
										hx-target="body"
										hx-swap="beforeend"
										hx-trigger={`click`}
										type="button"
										class="flex gap-2 rounded px-2 py-1 text-left hover:bg-zinc-200"
									>
										{task.title}
										<p class="opacity-50">in {task.project.title}</p>
									</button>
								);
							})}
						</div>
					</div>
					<div class="border-border min-h-[30rem] w-1/2 rounded-lg border p-3 text-lg font-bold hover:border-gray-500 hover:shadow-lg">
						Recents
					</div>
				</div>
			</main>
		</BaseLayout>
	);
}
