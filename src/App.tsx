/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { Editor, type EditorProps } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

import { useEffect, useRef, useState } from "react";
import { useDarkMode, useLocalStorage } from "usehooks-ts";
import Nav from "./components/Nav";
import SettingsDialog from "./components/SettingsDialog";
import { GeminiModels, generateContentStream } from "./lib/gemini";

export type Config = {
	provider: string;
	model: string;
	apiKey: string;
};

export default function VibeSculptor() {
	const { isDarkMode } = useDarkMode();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const stateEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const promptEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const [state, setState] = useState("// state_0\n// sculpt the vibe here");
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationTime, setGenerationTime] = useState<number | null>(null);
	const [totalOutputTokens, setTotalOutputTokens] = useState<number | null>(null);

	const [config, setConfig] = useLocalStorage<Config>(
		"vibe-sculptor_settings",
		{
			provider: "gemini",
			model: GeminiModels[1],
			apiKey: "",
		},
	);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === ",") {
				e.preventDefault();
				dialogRef.current?.showModal();
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const handleSend = async (instruction?: string) => {
		const liveState = stateEditorRef.current?.getValue() ?? state;
		const finalPrompt = instruction ?? prompt;
		if (!finalPrompt.trim() || isGenerating) {
			return;
		}

		setIsGenerating(true);
		setPrompt("");
		setGenerationTime(null);
		setTotalOutputTokens(null);

		const startTime = performance.now();

		try {
			const response = await generateContentStream(config, liveState, finalPrompt);

			let accumulatedResponse = "";

			for await (const chunk of response) {
				const content = chunk.text;
				accumulatedResponse += content;
				setState(accumulatedResponse);

				if (chunk.usageMetadata?.totalTokenCount) {
					setTotalOutputTokens(chunk.usageMetadata.totalTokenCount);
				}
			}

			const endTime = performance.now();
			setGenerationTime(endTime - startTime);
		} catch (error) {
			setTotalOutputTokens(null);
			console.error("Sculpting failed:", error);
			setState((prev) => prev + "\n\n// Error: Failed to connect to provider.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleEditorDidMount: EditorProps["onMount"] = (editor, monaco) => {
		promptEditorRef.current = editor;

		editor.addAction({
			id: "custom-command-enter",
			label: "Submit request",
			keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
			run: async () => {
				const value = editor.getValue();
				handleSend(value);
			},
		});
	};

	const generationTimeInSeconds = generationTime !== null ? generationTime / 1000 : null;
	const tokensPerSecond =
		generationTimeInSeconds !== null && totalOutputTokens !== null && generationTimeInSeconds > 0
			? totalOutputTokens / generationTimeInSeconds
			: null;


	return (
		<div className="h-screen w-screen bg-[#f4f4f4] dark:bg-[#0a0a0a] p-4 font-mono flex flex-col gap-4 transition-colors duration-300">
			<SettingsDialog ref={dialogRef} config={config} setConfig={setConfig} />

			<div className="flex-1 flex gap-4 border border-zinc-300 dark:border-zinc-800 p-4 rounded-sm relative overflow-hidden">
				{/* State Panel (66.7% width) */}
				<div className="flex-[2] flex flex-col gap-2 min-w-0">
					<div className="flex justify-between items-center px-1">
						<span className="text-[10px] uppercase tracking-widest opacity-50">
							state_history
						</span>
						<Nav onBack={() => { }} onForward={() => { }} />
					</div>
					<div className="flex-1 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#0d0d0d] overflow-hidden">
						<Editor
							onMount={(editor) => {
								stateEditorRef.current = editor;
							}}
							theme={isDarkMode ? "vs-dark" : "light"}
							height="100%"
							defaultLanguage="markdown"
							value={state}
							onChange={(v) => setState(v || "")}
							options={{
								minimap: { enabled: false },
								scrollbar: { vertical: "hidden", horizontal: "hidden" },
								padding: { top: 20 },
								wordWrap: "on",
							}}
						/>
					</div>
				</div>

				{/* Prompt Panel (33.3% width) */}
				<div className="flex-1 flex flex-col gap-2 min-w-0">
					<div className="flex justify-between items-center px-1">
						<span className="text-[10px] uppercase tracking-widest opacity-50">
							instruction_log
						</span>
						<Nav onBack={() => { }} onForward={() => { }} />
					</div>
					<div className="flex-1 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#0d0d0d] overflow-hidden">
						<Editor
							theme={isDarkMode ? "vs-dark" : "light"}
							height="100%"
							defaultLanguage="markdown"
							value={prompt}
							onMount={handleEditorDidMount}
							onChange={(v) => setPrompt(v || "")}
							options={{
								minimap: { enabled: false },
								scrollbar: { vertical: "hidden", horizontal: "hidden" },
								padding: { top: 20 },
								lineNumbers: "off",
								quickSuggestions: false,
								// Control specific types of suggestions within the 'suggest' object
								suggest: {
									showWords: false, // Disables word-based suggestions
									showKeywords: false, // Disables language keywords
									showProperties: false, // Disables properties in JSON/TS/JS
									// You can also add more options here like showMethods, showFunctions, etc.
								},
								// Other related options to control
								parameterHints: {
									enabled: false, // Disables parameter hints/signatures
								},
								suggestOnTriggerCharacters: false, // Prevents suggestions from appearing when typing trigger characters (like '.')
								acceptSuggestionOnEnter: "off", // Prevents accepting suggestions with the Enter key
								tabCompletion: "off", // Prevents accepting suggestions with the Tab key
								wordBasedSuggestions: "off", // Disables suggestions based on words already in the document
								wordWrap: "on",
							}}
						/>

						<div className="absolute bottom-4 right-4 flex items-center gap-3">
							<button
								type="button"
								onClick={() => handleSend()}
								className="border border-zinc-900 dark:border-zinc-500 px-3 py-1 text-xs text-zinc-900 dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black transition-colors"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-between items-center text-[10px] font-mono tracking-[0.15em] border-t border-zinc-300 dark:border-zinc-800 pt-3 px-1">
				{/* Left Section: Branding */}
				<div className="flex items-center gap-4">
					<span className="font-bold uppercase text-zinc-600 dark:text-zinc-400">
						vibe-sculptor
					</span>

					<div className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-800" />

					<div className="flex gap-2 text-zinc-600 dark:text-zinc-400">
						<span className="uppercase opacity-60">MODEL:</span>
						<span className="uppercase">{config.provider}</span>
						<span className="opacity-60">/</span>
						<span className="uppercase">{config.model}</span>
						{generationTimeInSeconds !== null && (
							<span className="opacity-60">
								({generationTimeInSeconds.toFixed(2)} s
								{tokensPerSecond !== null && ` | ${tokensPerSecond.toFixed(2)} t/s`})
							</span>
						)}
					</div>
				</div>

				{/* Right Section: Actions */}
				<div className="flex items-center gap-6">
					<button
						type="button"
						onClick={() => dialogRef.current?.showModal()}
						className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase cursor-pointer"
					>
						[ settings ]
					</button>

					<div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500">
						<span className="uppercase opacity-60">theme:</span>
						<span className="uppercase">
							{isDarkMode ? "dark_mode" : "light_mode"}
						</span>
					</div>

					{/* Status Indicator */}
					<div className="flex items-center gap-2">
						<div
							className={`w-1.5 h-1.5 rounded-full ${isGenerating ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
						/>
						<span className="opacity-60 uppercase">
							{isGenerating ? "sculpting" : "ready"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
