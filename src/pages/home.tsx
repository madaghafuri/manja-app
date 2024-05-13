import BaseLayout from '../layouts/base-layout';

export default function Home({ userId }: { userId?: number }) {
	return (
		<BaseLayout authId={userId}>
			<main class="bg-background absolute inset-0 m-auto py-5 md:w-[70rem]">
				<section class="grid grid-cols-[20%,auto,20%,20%]">
					<div>ini</div>
					<div>ini</div>
					<div>ini</div>
					<div>ini</div>
				</section>
			</main>
		</BaseLayout>
	);
}
