export default function BaseLayout({ children }: { children: JSX.Element }) {
	return (
		<html>
			<head>
				<script
					src="https://unpkg.com/htmx.org@1.9.12"
					integrity="sha384-ujb1lZYygJmzgSwoxRggbCHcjc0rB2XoQrxeTUQyRjrOnlCoYta87iKBWq3EsdM2"
					crossorigin="anonymous"
				></script>
				<script src="https://cdn.tailwindcss.com"></script>
				<title>Manja</title>
			</head>
			<body class="">{children}</body>
		</html>
	);
}
