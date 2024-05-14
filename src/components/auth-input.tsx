export const AuthInput = ({ ...props }: Hono.InputHTMLAttributes) => {
	return <input class="border-grey-400 bg-input rounded border p-3" {...props} />;
};
