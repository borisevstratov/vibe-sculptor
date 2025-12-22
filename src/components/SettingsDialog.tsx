import { forwardRef, type RefObject } from "react";
import type { Config } from "../App";
import { GeminiModels } from "../lib/gemini";

type Props = {
	config: Config;
	setConfig: (config: Config) => void;
};

const SettingsDialog = forwardRef<HTMLDialogElement, Props>((props, ref) => {
	const { config, setConfig } = props;

	const update = <K extends keyof Config>(key: K, value: Config[K]) =>
		setConfig({ ...config, [key]: value });

	return (
		<dialog
			ref={ref}
			className="fixed inset-0 m-auto bg-white dark:bg-[#0d0d0d] border border-zinc-300 dark:border-zinc-800 p-6 rounded-sm shadow-2xl backdrop:backdrop-blur-sm backdrop:bg-black/20 dark:backdrop:bg-black/50 text-zinc-900 dark:text-zinc-400 font-mono w-[90vw] max-w-md outline-none"
		>
			<div className="flex flex-col gap-4">
				<header className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
					<span className="text-[10px] uppercase tracking-widest opacity-50">
						config_settings
					</span>
					<button
						type="button"
						onClick={() =>
							(ref as RefObject<HTMLDialogElement | null>)?.current?.close()
						}
						className="hover:text-red-500"
					>
						×
					</button>
				</header>

				{/* Provider */}
				<div className="flex flex-col gap-1">
					<label htmlFor="provider" className="text-[9px] uppercase opacity-40">
						provider
					</label>
					<input
						disabled
						className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs"
						value="gemini"
					/>
				</div>

				{/* Model */}
				<div className="flex flex-col gap-1">
					<label htmlFor="model" className="text-[9px] uppercase opacity-40">
						model
					</label>
					<select
						className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs"
						value={config.model}
						onChange={(e) => update("model", e.target.value)}
					>
						{GeminiModels.map((m: string) => (
							<option key={m} value={m}>
								{m}
							</option>
						))}
					</select>
				</div>

				{/* API key */}
				<div className="flex flex-col gap-1">
					<label htmlFor="apiKey" className="text-[9px] uppercase opacity-40">
						api_key
					</label>
					<input
						type="text"
						className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs"
						placeholder="sk-..."
						value={config.apiKey}
						onChange={(e) => update("apiKey", e.target.value)}
					/>
				</div>

				<button
					type="button"
					onClick={() =>
						(ref as RefObject<HTMLDialogElement | null>)?.current?.close()
					}
					className="mt-2 bg-zinc-900 dark:bg-zinc-200 text-white dark:text-black py-2 text-xs uppercase tracking-tighter"
				>
					save and close
				</button>
			</div>
		</dialog>
	);
});

SettingsDialog.displayName = "SettingsDialog";
export default SettingsDialog;
