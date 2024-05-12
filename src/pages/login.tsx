import BaseLayout from '../layouts/base-layout';

export default function Login() {
	return (
		<BaseLayout>
			<form
				hx-post="/api/login"
				hx-swap="outerHTML"
				hx-trigger="submit"
				hx-replace-url="true"
				class="absolute inset-0 m-auto max-w-[40rem] max-h-[40rem] rounded-lg shadow-2xl py-10 px-20 flex flex-col gap-5"
			>
				<h1 class="text-center text-3xl font-bold">Welcome Back</h1>
				<span class="border w-full"></span>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Email</label>
					<input type="email" name="email" required class="p-3 rounded bg-indigo-100 border border-gray-400" />
				</div>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Password</label>
					<input type="password" name="password" required class="p-3 rounded bg-indigo-100 border border-gray-400" />
				</div>
				<div id="error-result"></div>
				<button type="submit" class="rounded-lg bg-indigo-400 text-white font-bold text-xl p-3">
					Log in
				</button>
				<p>
					Don't have an account?{' '}
					<a href="/register" class="underline text-indigo-500">
						Sign up
					</a>
				</p>
			</form>
		</BaseLayout>
	);
}
