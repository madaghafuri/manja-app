import ProjectTab from '../components/project-tab';
import { Project } from '../schema';

export default function ProjectBoard({ project, tab }: { project: Project; tab: 'board' | 'list' | 'calendar' | 'dashboard' }) {
	return (
		<main>
			<ProjectTab project={project} tab={tab} />
			<div id="tab-content" role="tabpanel">
				Board Content
			</div>
		</main>
	);
}
