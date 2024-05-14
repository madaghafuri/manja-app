import BaseLayout from '../layouts/base-layout';
import { Workspace as WorkspaceType } from '../schema';

export default function Workspace({ authId, workspace }: { authId?: number; workspace: WorkspaceType }) {
	return (
		<BaseLayout authId={authId}>
			<main class="bg-background border-border absolute inset-0 m-auto max-w-[90rem] border shadow-lg">
				<div class="border-border border-b-[1px] px-6 py-3">
					<h1 class="text-2xl font-bold">{workspace.title}</h1>
					<div id="tabs" hx-get={`/w/${workspace.id}/home`} hx-trigger="load delay:100ms" hx-target="#tabs" hx-swap="innerHTML"></div>
				</div>
				<div class="flex gap-5 p-6">
					<div class="border-border min-h-[30rem] w-1/2 rounded-lg border p-3 text-lg font-bold hover:border-gray-500 hover:shadow-lg">
						Recents
					</div>
					<div class="border-border min-h-[30rem] w-1/2 rounded-lg border p-3 text-lg font-bold hover:border-gray-500 hover:shadow-lg">
						Recents
					</div>
				</div>
			</main>
		</BaseLayout>
	);
}
