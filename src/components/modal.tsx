export default function Modal() {
	return (
		<div id="modal" _="on closeModal add .closing then wait for animationend then remove me">
			<div class="modal-underlay" _="on click trigger closeModal"></div>
			<div class="modal-content bg-background">
				<h1>Modal Dialog</h1>
				Testing this one
				<br />
				<br />
				<button _="on click trigger closeModal">Close</button>
			</div>
		</div>
	);
}
