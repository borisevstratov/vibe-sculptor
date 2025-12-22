# vibe-sculptor

Experiment for iterative text content generation.

![Concept](./assets/concept.png)

## The problem

Chat interfaces are terrible for state.  
You scroll up, then down, model loses context, you copy-paste. Yuck!

## Running locally

1. Clone the repo

```bash
git clone https://github.com/borisevstratov/vibe-sculptor
```

2. Run the web app

```bash
bun install

bun run dev
```

Set the model and API keys in the settings dialog—it will be stored in browser's local storage.

## Things to be done

- [x] ~~Move away from [token.js](https://github.com/token-js/token.js) since they forgot their github password~~ Replaced with Google Gemini as of now.
- [ ] Support modern LLMs
- [ ] Polish UI
- [ ] Store state and prompt history
- [ ] Allow history forks
- [ ] More keyboard shortcuts
