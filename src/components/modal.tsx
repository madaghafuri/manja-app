import { PropsWithChildren, createContext } from 'hono/jsx';

function ModalHeader({ children, ...props }: PropsWithChildren & Hono.HTMLAttributes) {
	return (
		<div class="text-xl font-bold" {...props}>
			{children}
		</div>
	);
}

function ModalContent({ children, ...props }: PropsWithChildren & Hono.HTMLAttributes) {
	return <div {...props}>{children}</div>;
}

function ModalDescription({ children, ...props }: PropsWithChildren & Hono.HTMLAttributes) {
	return (
		<div class="text-base text-slate-400" {...props}>
			{children}
		</div>
	);
}

function ModalClose({ children, ...props }: PropsWithChildren & Hono.HTMLAttributes) {
	return (
		<button type="button" _="on click trigger closeModal" class="border-border rounded border px-2 py-1" {...props}>
			{children || 'Close'}
		</button>
	);
}

export default function Modal({ children, ...props }: PropsWithChildren & Hono.HTMLAttributes) {
	return (
		<div {...props} id="modal" _="on closeModal add .closing then wait for animationend then remove me">
			<div class="modal-underlay" _="on click trigger closeModal"></div>
			<div class="modal-content bg-background">{children}</div>
		</div>
	);
}

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Description = ModalDescription;
Modal.Close = ModalClose;
