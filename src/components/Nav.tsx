import type { FC } from "react";

type Props = {
	onBack: () => void;
	onForward: () => void;
};

const Nav: FC<Props> = (props) => {
	const { onBack, onForward } = props;
	return (
		<div className="flex gap-1">
			<button
				type="button"
				onClick={onBack}
				className="px-2 border border-zinc-300 dark:border-zinc-00 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 text-xs select-none transition-colors"
			>
				{"<-"}
			</button>
			<button
				type="button"
				onClick={onForward}
				className="px-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 text-xs select-none transition-colors"
			>
				{"->"}
			</button>
		</div>
	);
};

export default Nav;
