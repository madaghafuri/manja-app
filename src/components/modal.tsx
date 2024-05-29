import { PropsWithChildren } from 'hono/jsx';
import { cn } from '../helper';

function ModalHeader({ children, className, ...props }: PropsWithChildren<Hono.HTMLAttributes> & { className?: string }) {
	return (
		<div class={cn(className, 'text-xl font-bold')} {...props}>
			{children}
		</div>
	);
}

function ModalContent({ children, className, ...props }: PropsWithChildren<Hono.HTMLAttributes> & { className?: string }) {
	return (
		<div class={cn(className)} {...props}>
			{children}
		</div>
	);
}

function ModalDescription({ children, className, ...props }: PropsWithChildren<Hono.HTMLAttributes> & { className?: string }) {
	return (
		<div class={cn(className, 'text-base text-slate-400')} {...props}>
			{children}
		</div>
	);
}

function ModalClose({ children, className, ...props }: PropsWithChildren<Hono.HTMLAttributes> & { className?: string }) {
	return (
		<button type="button" _="on click trigger closeModal" class={cn(className, 'border-border rounded border px-2 py-1')} {...props}>
			{children || 'Close'}
		</button>
	);
}

export default function Modal({ children, ...props }: PropsWithChildren & Hono.HTMLAttributes) {
	return (
		<div {...props} id="modal" _="on closeModal add .closing then wait for animationend then remove me">
			<div class="modal-underlay" _="on click trigger closeModal"></div>
			<div class="modal-content bg-background relative">{children}</div>
		</div>
	);
}

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Description = ModalDescription;
Modal.Close = ModalClose;
