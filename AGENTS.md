# Repo Investigator

## Project purpose

This project is a TypeScript repository investigator built with LangChain,
LangGraph, OpenAI, Zod, and Node.js filesystem APIs. Its current goal is to
answer questions about a local repository using evidence from repository tools.

The application should prefer accurate, source-backed answers over guesses.
Search results identify candidates; file contents are required before making
detailed claims.

## Current architecture

The current runtime flow is:

```text
index.ts
  -> investigatorAgent.invoke()
  -> LangGraph agent loop
  -> OpenAI through ChatOpenAI
  -> registered LangChain tool
  -> repository filesystem function
  -> tool result returned to the model
  -> final answer printed by index.ts
```

`createReactAgent` manages an internal message state containing the user
message, model tool calls, tool results, and final response. The custom types
in `state.ts` are not currently connected to the agent. They are reserved for
a future explicit workflow with nodes such as:

```text
plan -> search -> read files -> analyze evidence -> answer
```

## Important files

- `index.ts` is the interactive CLI entry point. It asks the user for a
  question and invokes the investigator agent.
- `agent.ts` defines repository tools, the OpenAI model, and the LangGraph
  agent.
- `prompts.ts` contains the multiline system prompt.
- `state.ts` contains the future custom `InvestigatorState` and `Evidence`
  types.
- `tools/searchRepo.ts` searches file contents.
- `tools/readFile.ts` reads one file after validating that it is inside the
  repository.
- `tools/searchFileName.ts` searches file names.
- `tools/testTools/` contains executable smoke tests for the repository tools.
- `docs/architecture.md` contains the architecture blueprint.

## Tool responsibilities

### `searchRepo`

Signature:

```ts
searchRepo(repoPath: string, query: string): Promise<string[]>
```

It recursively searches file contents and returns matching absolute paths.
It skips `.git`, `node_modules`, and `dist`. It is content search only; it
does not match file names unless the file contents contain the query.

### `readFile`

Signature:

```ts
readFile(repoPath: string, filePath: string): Promise<string>
```

It reads one known file. It normalizes paths with `path.resolve`, calculates
the path relative to the repository root, rejects paths outside the repository,
and reads UTF-8 content with `fs.readFile`.

### `searchFileName`

Signature:

```ts
searchFileName(repoPath: string, query: string): Promise<string[]>
```

It recursively searches file names, returns matching absolute paths, and
skips `.git`, `node_modules`, and `dist`. Use it for questions such as finding
test files by name.

## Agent and tool conventions

Each filesystem function is wrapped as a LangChain tool with `tool(...)`.
Zod schemas describe the arguments the model must provide. Tool names should
be stable, descriptive, and match the system prompt:

- `search_repository`
- `readFile`
- `search_file_name`

The system prompt describes investigation behavior and evidence rules. Tool
schemas define each tool's parameters; do not maintain one giant parameter
list in the prompt.

The agent must:

- Treat the supplied repository path as the investigation boundary.
- Search before reading an unknown file.
- Read relevant files before making detailed claims.
- Distinguish files that create behavior from files that use or document it.
- Never invent file contents, symbols, or line numbers.
- Say when evidence is insufficient.

## Development commands

Install dependencies:

```powershell
npm install
```

Build and type-check:

```powershell
npm run build
```

Run the interactive agent:

```powershell
npm run dev
```

Run tool smoke tests:

```powershell
npx tsx .\tools\testTools\searchRepo.test.ts
npx tsx .\tools\testTools\readFile.test.ts
npx tsx .\tools\testTools\searchFileName.test.ts
```

The OpenAI key is loaded through `dotenv` from `.env`:

```env
OPENAI_API_KEY=...
```

Never commit `.env` or API keys. Generated `dist/` and dependencies in
`node_modules/` are ignored.

## TypeScript and module conventions

The project uses ESM with `module: "nodenext"`. Source imports use emitted
`.js` extensions, for example:

```ts
import { searchRepo } from "./tools/searchRepo.js";
```

Use `async` and `await` for filesystem, network, model, and other promise
operations. Path calculations such as `path.resolve` and `path.relative` are
synchronous and do not use `await`.

Keep production modules free of top-level test execution. Put executable
checks in `tools/testTools/` so importing a tool does not print output or
perform repository scans.

## Commit conventions

Use conventional commit prefixes when appropriate:

- `feat`: new user-facing capability
- `fix`: behavior or bug correction
- `test`: tests or validation
- `docs`: documentation
- `chore`: setup or maintenance
- `refactor`: internal restructuring without behavior change

Keep commits small and chronological. Each commit should represent one
meaningful development step and should build when practical.

