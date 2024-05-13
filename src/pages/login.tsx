import BaseLayout from '../layouts/base-layout';

export default function Login() {
	return (
		<BaseLayout>
			<form
				hx-post="/auth/login"
				hx-target-error="#error-result"
				class="absolute inset-0 m-auto flex max-h-[40rem] max-w-[40rem] flex-col gap-5 rounded-lg px-20 py-10 shadow-2xl"
			>
				<h1 class="text-center text-3xl font-bold">Welcome Back</h1>
				<span class="w-full border"></span>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Email</label>
					<input type="email" name="email" required class="rounded border border-gray-400 bg-indigo-100 p-3" />
				</div>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Password</label>
					<input type="password" name="password" required class="rounded border border-gray-400 bg-indigo-100 p-3" />
				</div>
				<div id="error-result"></div>
				<button type="submit" class="rounded-lg bg-indigo-400 p-3 text-xl font-bold text-white">
					Log in
				</button>
				<p>
					Don't have an account?{' '}
					<a href="/register" class="text-indigo-500 underline">
						Sign up
					</a>
				</p>
			</form>
		</BaseLayout>
	);
}
