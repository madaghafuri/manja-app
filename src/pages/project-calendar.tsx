import ProjectTab from '../components/project-tab';
import { Project } from '../schema';

export default function ProjectCalendar({ project, tab }: { project: Project; tab: 'board' | 'list' | 'calendar' | 'dashboard' }) {
	return (
		<main>
			<ProjectTab project={project} tab={tab} />
			<div
				id="tab-content"
				role="tabpanel"
				class="px-4 py-2"
				x-init="
				const calendarEl = document.getElementById('calendar');
				const calendar = new FullCalendar.Calendar(calendarEl, {
					height: '80%',
					aspectRatio: 1.2
				});
				calendar.render();
			"
			>
				<div id="calendar" class="h-[50rem]"></div>
			</div>
		</main>
	);
}
