import ProjectTab from '../components/project-tab';
import { Project } from '../schema';

export default function ProjectCalendar({ project, tab }: { project: Project; tab: 'board' | 'list' | 'calendar' | 'dashboard' }) {
	return (
		<main>
			<ProjectTab project={project} tab={tab} />
			<div id="tab-content" role="tabpanel" class="px-4 py-2">
				Calendar Content
			</div>
		</main>
	);
}
