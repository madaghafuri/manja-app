import { AuthInput } from '../components/auth-input';
import BaseLayout from '../layouts/base-layout';

export default function Register() {
	return (
		<BaseLayout>
			<form
				hx-post="/api/register"
				hx-trigger="submit delay:500ms"
				hx-replace-url="true"
				hx-swap="outerHTML"
				class="absolute inset-0 m-auto max-w-[40rem] max-h-[40rem] py-10 px-20 rounded-lg shadow-2xl flex flex-col gap-5"
			>
				<h1 class="text-center font-bold text-3xl">Sign Up</h1>
				<span class="border w-full"></span>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Email</label>
					<AuthInput type="email" name="email" required placeholder="example@email.com"></AuthInput>
				</div>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Username</label>
					<AuthInput type="text" name="username" required></AuthInput>
				</div>
				<div class="flex flex-col gap-3">
					<label htmlFor="">Password</label>
					<AuthInput type="password" name="password" required></AuthInput>
				</div>
				<span>
					Already have an account?{' '}
					<a href="/login" class="underline text-indigo-500">
						Sign in
					</a>
				</span>
				<button type="submit" class="bg-indigo-400 rounded-lg text-white font-bold text-lg p-3">
					Register
				</button>
			</form>
		</BaseLayout>
	);
}
