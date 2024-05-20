export default function StatusInput({ ...props }: Hono.InputHTMLAttributes) {
	return (
		<div>
			<input {...props} class="rounded border border-zinc-500 px-2 py-1 font-light uppercase tracking-wide shadow-lg" />
		</div>
	);
}
