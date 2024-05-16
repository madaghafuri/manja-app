import AuthenticatedNav from '../components/authenticated-nav';
import BaseLayout from '../layouts/base-layout';
import { Project as ProjectType, Workspace } from '../schema';

export default function Project({
	authId,
	workspace,
	projects,
	project,
}: {
	authId: number;
	workspace: Workspace;
	projects: ProjectType[];
	project: ProjectType;
}) {
	return (
		<BaseLayout authId={authId} navigation={<AuthenticatedNav workspace={workspace} projects={projects}></AuthenticatedNav>}>
			<main class="bg-background border-border min-w-[90rem] border shadow-lg">
				<section class="border-border border-b-[1px] px-6 py-3">
					<h1>{project.title}</h1>
				</section>
				<section
					id="tabs"
					hx-get={`/p/${project.id}/board`}
					hx-trigger="load delay:100ms"
					hx-target="#tabs"
					hx-swap="innerHTML"
					class=""
				></section>
				<section>content</section>
			</main>
		</BaseLayout>
	);
}
