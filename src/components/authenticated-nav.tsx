import { Project, Workspace } from '../schema';

export default function AuthenticatedNav({
	workspace,
	projects,
	project,
}: {
	workspace: Workspace;
	projects?: Project[];
	project?: Project;
}) {
	return (
		<div class="first:border-border flex flex-col">
			<h1 class="border-border border p-3 text-xl font-medium tracking-tight">{workspace.title}</h1>
			<div class="border-border border-b-2 p-2">
				<a href={`/w/${workspace.id}`} class="rounded px-2 py-1 hover:bg-indigo-100">
					Home
				</a>
			</div>
			<div class="p-2">
				<div class="flex items-center justify-between px-2 py-1">
					<h1 class=" text-sm font-bold text-slate-600">Projects</h1>
					<button
						class="rounded px-2 py-1 hover:outline hover:outline-1"
						hx-get={`/w/${workspace.id}/p/create`}
						hx-target="body"
						hx-swap="beforeend"
					>
						<i class="fa-solid fa-plus"></i>
					</button>
				</div>
				<div id="project-list" class="flex flex-col gap-1" hx-get={`/w/${workspace.id}/p`} hx-trigger="projectCreated from:body">
					{projects?.map((val) => {
						return (
							<a
								href={`/w/${workspace.id}/p/${val.id}`}
								aria-selected={val.id === project?.id}
								key={val.id}
								class="rounded px-2 py-1 text-sm aria-[selected=true]:bg-zinc-200"
							>
								{val.title}
							</a>
						);
					})}
				</div>
			</div>
		</div>
	);
}
