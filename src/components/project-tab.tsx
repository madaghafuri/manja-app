import { Project } from '../schema';

export default function ProjectTab({ project, tab }: { project: Project; tab: 'board' | 'list' | 'calendar' | 'dashboard' }) {
	return (
		<div class="tab-list border-border border-b-[1px] px-6 py-3 font-semibold" role="tablist">
			<button
				hx-get={`/p/${project.id}/board`}
				class="rounded px-2 py-1 aria-[selected='true']:bg-zinc-300"
				role="tab"
				aria-selected={(tab === 'board').toString()}
				aria-controls="tab-content"
			>
				<i class="fa-solid fa-table-columns mr-1"></i>
				Board
			</button>
			<button
				hx-get={`/p/${project.id}/list`}
				class="rounded px-2 py-1 aria-selected:bg-zinc-300"
				role="tab"
				aria-selected={(tab === 'list').toString()}
				aria-controls="tab-content"
			>
				<i class="fa-solid fa-list-ul mr-1"></i>
				List
			</button>
			<button
				hx-get={`/p/${project.id}/calendar`}
				class="rounded px-2 py-1 aria-selected:bg-zinc-300"
				role="tab"
				aria-selected={(tab === 'calendar').toString()}
				aria-controls="tab-content"
			>
				<i class="fa-regular fa-calendar mr-1"></i>
				Calendar
			</button>
			<button
				hx-get={`/p/${project.id}/dashboard`}
				class="rounded px-2 py-1 aria-selected:bg-zinc-300"
				role="tab"
				aria-selected={(tab === 'dashboard').toString()}
				aria-controls="tab-content"
			>
				<i class="fa-solid fa-chart-column mr-1"></i>
				Dashboard
			</button>
		</div>
	);
}
