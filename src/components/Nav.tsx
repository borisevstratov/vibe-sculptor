import type { FC } from "react";

type Props = {
	onBack: () => void;
	canBack?: boolean;
	onForward: () => void;
	canForward?: boolean;
};

const Nav: FC<Props> = (props) => {
	const { onBack, canBack, onForward, canForward } = props;
	return (
		<div className="flex gap-1">
			<button
				type="button"
				onClick={onBack}
				disabled={!canBack}
				className="px-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-xs select-none transition-colors"
			>
				{"<-"}
			</button>
			<button
				type="button"
				onClick={onForward}
				disabled={!canForward}
				className="px-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-xs select-none transition-colors"
			>
				{"->"}
			</button>
		</div>
	);
};

export default Nav;