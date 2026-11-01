# Repo Investigator

## Project overview

Repo Investigator is a TypeScript CLI that uses LangChain, LangGraph, OpenAI,
Zod, and Node.js filesystem APIs to investigate a local repository. The agent
searches repository contents or file names, reads relevant files, and returns
evidence-based answers.

The current agent uses `createReactAgent`, so LangGraph manages the internal
message and tool-call loop. The custom types in `state.ts` are reserved for a
future explicit graph with separate planning, search, reading, analysis, and
answer nodes.

## Commands

Run commands from the repository root in PowerShell.

Install dependencies:

```powershell
npm install
```

Run the interactive investigator:

```powershell
npm run dev
```

Build and type-check:

```powershell
npm run build
```

Run the repository content-search smoke test:

```powershell
npx tsx .\tools\testTools\searchRepo.test.ts
```

Run the file-reader smoke test:

```powershell
npx tsx .\tools\testTools\readFile.test.ts
```

Run the filename-search smoke test:

```powershell
npx tsx .\tools\testTools\searchFileName.test.ts
```

There is currently no configured full test runner. Do not treat the placeholder
`npm test` script as a passing validation command.

## Repository map

- `index.ts`: interactive CLI entry point; reads a question and invokes the
  investigator agent.
- `agent.ts`: defines LangChain tools, the OpenAI model, and the LangGraph
  agent.
- `prompts.ts`: contains the multiline system prompt.
- `state.ts`: contains future custom `InvestigatorState` and `Evidence` types.
- `tools/searchRepo.ts`: recursively searches file contents.
- `tools/readFile.ts`: safely reads one file inside the repository boundary.
- `tools/searchFileName.ts`: recursively searches file names.
- `tools/testTools/`: executable smoke tests for the repository tools.
- `docs/architecture.md`: architecture reference.
- `package.json`: scripts and dependencies.
- `tsconfig.json`: TypeScript and Node ESM configuration.

## Conventions

- Use TypeScript and preserve the existing ESM `NodeNext` setup.
- Use `.js` extensions in local imports because TypeScript emits JavaScript:

  ```ts
  import { searchRepo } from "./tools/searchRepo.js";
  ```

- Use `async` and `await` for filesystem, network, and model operations.
- Keep synchronous path calculations, such as `path.resolve` and
  `path.relative`, free of unnecessary `await`.
- Keep production tool modules free of top-level test execution. Put executable
  checks in `tools/testTools/`.
- Wrap agent tools with LangChain `tool(...)` and define their inputs with Zod.
- Keep tool schemas authoritative for tool parameters; do not duplicate a
  growing parameter list in the system prompt.
- Preserve the distinction between content search, filename search, and reading
  a known file.
- Search results are candidate evidence. Read relevant files before making
  detailed claims.
- Do not infer that a file creates behavior merely because its name or contents
  contain a search term.

## Testing rules

- Add or update a focused smoke test when changing a repository tool.
- Run the smallest relevant tool test while developing.
- Run all three tool smoke tests and `npm run build` before declaring work
  complete.
- Review the final diff with Git before committing.
- Report the exact validation commands that passed or failed.
- Do not claim that the full agent workflow passed without making a real model
  call; it requires `OPENAI_API_KEY` in the local environment.

## Generated files

- `dist/` is generated JavaScript, declaration, and source-map output from
  `npm run build`. Edit the TypeScript source instead.
- `node_modules/` is installed dependency output. Do not edit or commit it.
- `package-lock.json` is generated and maintained by npm. Update it through npm
  commands when dependencies change.
- `.env` is local configuration and must not be committed.

## Security and safety

- Never commit API keys, credentials, private tokens, or other secrets.
- Load `OPENAI_API_KEY` from the local environment or `.env`; do not hardcode it.
- Treat the user-provided repository path as the investigation boundary.
- Preserve the path validation in `readFile`; never allow reads outside the
  selected repository.
- Continue skipping `.git`, `node_modules`, and `dist` during repository
  traversal unless the user explicitly changes that requirement.
- Do not add unrestricted shell execution or destructive filesystem operations
  without explicit approval and appropriate safeguards.
- Do not weaken validation just to make a test pass.

## Completion criteria

Before considering a change complete:

1. Run the focused test for the changed behavior.
2. Run all repository tool smoke tests.
3. Run `npm run build`.
4. Review the final diff and confirm no secrets or generated files are staged.
5. Summarize the implementation and the validation results.

## Commit and review expectations

Use small, chronological conventional commits where appropriate:

- `feat`: new capability
- `fix`: behavior or bug correction
- `test`: tests or validation
- `docs`: documentation
- `refactor`: internal restructuring
- `chore`: setup or maintenance

Keep each commit focused on one meaningful development step. Do not include
temporary notes, unrelated formatting changes, or generated output.