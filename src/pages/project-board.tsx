import { Project } from '../schema';

export default function ProjectBoard({ project }: { project: Project }) {
	return (
		<main>
			<div class="tab-list border-border border-b-[1px] px-6 py-3 font-semibold" role="tablist">
				<button
					hx-get={`/p/${project.id}/board`}
					class="rounded bg-zinc-300 px-2 py-1"
					role="tab"
					aria-selected="true"
					aria-controls="tab-content"
				>
					Board
				</button>
				<button hx-get={`/p/${project.id}/list`} class="rounded px-2 py-1" role="tab" aria-selected="false" aria-controls="tab-content">
					List
				</button>
				<button hx-get={`/p/${project.id}/calendar`} class="rounded px-2 py-1" role="tab" aria-selected="false" aria-controls="tab-content">
					Calendar
				</button>
				<button
					hx-get={`/p/${project.id}/dashboard`}
					class="rounded px-2 py-1"
					role="tab"
					aria-selected="false"
					aria-controls="tab-content"
				>
					Dashboard
				</button>
			</div>
			<div id="tab-content" role="tabpanel">
				Board Content
			</div>
		</main>
	);
}
