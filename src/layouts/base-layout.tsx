import { html } from 'hono/html';
import { PropsWithChildren, memo } from 'hono/jsx';

export default function BaseLayout({ children, authId, navigation }: PropsWithChildren & { authId?: number; navigation?: JSX.Element }) {
	return (
		<html>
			<head>
				<script
					src="https://unpkg.com/htmx.org@1.9.12/dist/htmx.js"
					integrity="sha384-qbtR4rS9RrUMECUWDWM2+YGgN3U4V4ZncZ0BvUcg9FGct0jqXz3PUdVpU1p0yrXS"
					crossorigin="anonymous"
				></script>
				<script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
				<script src="https://cdn.tailwindcss.com"></script>
				<script src="https://kit.fontawesome.com/032f179500.js" crossorigin="anonymous"></script>
				{html`
					<style type="text/tailwindcss">
						@layer base {
							:root {
								--background: 0 0% 100%;
								--foreground: 222.2 84% 4.9%;

								--card: 0 0% 100%;
								--card-foreground: 222.2 84% 4.9%;

								--popover: 0 0% 100%;
								--popover-foreground: 222.2 84% 4.9%;

								--primary: 222.2 47.4% 11.2%;
								--primary-foreground: 210 40% 98%;

								--secondary: 210 40% 96.1%;
								--secondary-foreground: 222.2 47.4% 11.2%;

								--muted: 210 40% 96.1%;
								--muted-foreground: 215.4 16.3% 46.9%;

								--accent: 210 40% 96.1%;
								--accent-foreground: 222.2 47.4% 11.2%;

								--destructive: 0 84.2% 60.2%;
								--destructive-foreground: 210 40% 98%;

								--border: 214.3 31.8% 91.4%;
								--input: 226 100% 94%;
								--ring: 222.2 84% 4.9%;

								--radius: 0.5rem;
							}

							.dark {
								--background: 0 0% 13%;
								--foreground: 210 40% 98%;

								--card: 222.2 84% 4.9%;
								--card-foreground: 210 40% 98%;

								--popover: 222.2 84% 4.9%;
								--popover-foreground: 210 40% 98%;

								--primary: 210 40% 98%;
								--primary-foreground: 222.2 47.4% 11.2%;

								--secondary: 217.2 32.6% 17.5%;
								--secondary-foreground: 210 40% 98%;

								--muted: 217.2 32.6% 17.5%;
								--muted-foreground: 215 20.2% 65.1%;

								--accent: 217.2 32.6% 17.5%;
								--accent-foreground: 210 40% 98%;

								--destructive: 0 62.8% 30.6%;
								--destructive-foreground: 210 40% 98%;

								--border: 0 0% 25%;
								--input: 217.2 32.6% 17.5%;
								--ring: 212.7 26.8% 83.9%;
							}

							@media (prefers-color-scheme: dark) {
								.dark {
								}
							}
						}

						@layer base {
							* {
								@apply border-border;
								::-webkit-scrollbar {
									width: 10px;
									height: 10px;
								}
								::-webkit-scrollbar-track {
									@apply bg-zinc-800;
									border-radius: 10px;
								}
								::-webkit-scrollbar-thumb {
									border-radius: 10px;
									box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
									@apply bg-zinc-800;
								}
							}
							body {
								@apply bg-background text-foreground;
							}
						}

						#modal {
							/* Underlay covers entire screen. */
							position: fixed;
							top: 0px;
							bottom: 0px;
							left: 0px;
							right: 0px;
							background-color: rgba(0, 0, 0, 0.5);
							z-index: 1000;

							/* Flexbox centers the .modal-content vertically and horizontally */
							display: flex;
							flex-direction: column;
							align-items: center;

							/* Animate when opening */
							animation-name: fadeIn;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#modal > .modal-underlay {
							/* underlay takes up the entire viewport. This is only
	required if you want to click to dismiss the popup */
							position: absolute;
							z-index: -1;
							top: 0px;
							bottom: 0px;
							left: 0px;
							right: 0px;
						}

						#modal > .modal-content {
							/* Position visible dialog near the top of the window */
							margin-top: 10vh;

							/* Display properties for visible dialog*/
							border: solid 1px #999;
							border-radius: 8px;
							box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.3);

							/* Animate when opening */
							animation-name: zoomIn;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#modal.closing {
							/* Animate when closing */
							animation-name: fadeOut;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#modal.closing > .modal-content {
							/* Animate when closing */
							animation-name: zoomOut;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#task-form {
							animation-name: fadeIn;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#task-form.closing {
							animation-name: fadeOut;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#context-menu {
							animation-name: fadeIn;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#context-menu > .context-content {
							animation-name: zoomIn;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						#context-menu.closing {
							/* Animate when closing */
							animation-name: fadeOut;
							animation-duration: 150ms;
							animation-timing-function: ease;
						}

						@keyframes fadeIn {
							0% {
								opacity: 0;
							}
							100% {
								opacity: 1;
							}
						}

						@keyframes fadeOut {
							0% {
								opacity: 1;
							}
							100% {
								opacity: 0;
							}
						}

						@keyframes zoomIn {
							0% {
								transform: scale(0.9);
							}
							100% {
								transform: scale(1);
							}
						}

						@keyframes zoomOut {
							0% {
								transform: scale(1);
							}
							100% {
								transform: scale(0.9);
							}
						}
					</style>

					<script>
						tailwind.config = {
							theme: {
								extend: {
									colors: {
										background: 'hsl(var(--background))',
										foreground: 'hsl(var(--foreground))',
										border: 'hsl(var(--border))',
										input: 'hsl(var(--input))',
										secondary: 'hsl(var(--secondary))',
										primary: 'hsl(var(--primary))',
										muted: 'hsl(var(--muted))',
									},
								},
							},
						};
					</script>
				`}

				<title>Manja</title>
			</head>
			<body _="on changeTheme toggle .dark on me">
				<div class="flex h-full flex-row">
					<nav class="bg-secondary border-border w-[15%] border">{navigation}</nav>
					<div class="grow">
						<nav class="bg-background flex justify-end gap-3 px-10 py-3">
							{authId && (
								<button class="border-border rounded border bg-indigo-600 px-3 py-1 text-white" hx-post="/auth/logout">
									Logout
								</button>
							)}
							<button class="border-border rounded border px-3 py-1 hover:bg-indigo-500 hover:text-white" _="on click trigger changeTheme">
								Theme
							</button>
						</nav>
						{children}
					</div>
				</div>
			</body>
		</html>
	);
}

BaseLayout.Navigation = <div></div>;
