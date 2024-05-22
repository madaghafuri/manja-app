import { PropsWithChildren } from 'hono/jsx';
import { cn } from '../helper';

function ContextMenuContent({ children, className }: PropsWithChildren & { className?: string }) {
	return <div class={cn(className, 'bg-background rounded p-3')}>{children}</div>;
}

export default function ContextMenu({ children }: PropsWithChildren<Hono.HTMLAttributes>) {
	return (
		<div id="context-menu" class="absolute inset-0" _="on closeContext add .closing then wait for animationend then remove me">
			<div class="context-underlay -z-1 fixed inset-0 m-auto cursor-auto" _="on click trigger closeContext"></div>
			<div class="context-content absolute right-0 top-10 z-10 ">{children}</div>
		</div>
	);
}

ContextMenu.Content = ContextMenuContent;
