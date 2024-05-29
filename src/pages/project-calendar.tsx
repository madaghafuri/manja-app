import ProjectTab from '../components/project-tab';
import { Project, Task } from '../schema';

export default function ProjectCalendar({
	project,
	tab,
	tasks,
}: {
	project: Project;
	tab: 'board' | 'list' | 'calendar' | 'dashboard';
	tasks?: string;
}) {
	return (
		<main>
			<ProjectTab project={project} tab={tab} />
			<div
				id="tab-content"
				role="tabpanel"
				class="px-4 py-2"
				x-init={`
				const calendarEl = document.getElementById('calendar');
				const calendar = new FullCalendar.Calendar(calendarEl, {
					height: '80%',
					aspectRatio: 1.2,
					events: ${tasks},
				});
				calendar.render();
			`}
			>
				<div id="calendar" class="h-[50rem]"></div>
			</div>
		</main>
	);
}
