import { AuthInput } from '../components/auth-input';
import BaseLayout from '../layouts/base-layout';

export default function Register() {
	return (
		<BaseLayout>
			<form
				hx-post="/auth/register"
				hx-swap="innerHTML"
				hx-target="#error-result"
				class="absolute inset-0 m-auto flex max-h-[40rem] max-w-[40rem] flex-col gap-5 rounded-lg px-20 py-10 shadow-2xl"
			>
				<h1 class="text-center text-3xl font-bold">Sign Up</h1>
				<span class="w-full border"></span>
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
				<div id="error-result"></div>
				<span>
					Already have an account?{' '}
					<a href="/login" class="text-indigo-500 underline">
						Sign in
					</a>
				</span>
				<button type="submit" class="rounded-lg bg-indigo-400 p-3 text-lg font-bold text-white">
					Register
				</button>
			</form>
		</BaseLayout>
	);
}
