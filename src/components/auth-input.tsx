export const AuthInput = ({ ...props }: Hono.InputHTMLAttributes) => {
	return <input class="p-3 rounded border border-grey-400 bg-indigo-100" {...props} />;
};
