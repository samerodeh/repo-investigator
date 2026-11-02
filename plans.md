# Repo Investigator production roadmap

## Mission

Build the best open-source repository investigation agent for developers:
local-first, evidence-grounded, safe by default, extensible, observable, and
honest about uncertainty. The system should help a real user understand an
unfamiliar repository without pretending that search results are proof.

The first production release is read-only. It may inspect repositories and run
explicitly approved validation commands in an isolated environment, but it
must not modify the user's repository, commit, push, deploy, install arbitrary
software, or access secrets.

## Product principles

- Evidence before conclusions: every substantive claim links to source,
  configuration, test, Git, or command evidence.
- Safe by default: repository content is untrusted input, not instructions.
- Least privilege: tools receive only the scope and capabilities they need.
- Explicit uncertainty: distinguish observed, inferred, contradicted,
  incomplete, and unknown.
- Human control: ask focused clarification questions when intent or scope is
  ambiguous; never silently choose a risky interpretation.
- Reproducibility: record repository snapshot, tool calls, model, prompt
  version, command, and result metadata.
- Local-first: source discovery stays local; tell users what excerpts leave
  the machine for hosted model inference.
- Graceful degradation: missing model keys, telemetry, Git metadata, or
  optional indexes produce useful bounded failures rather than crashes.
- Open-source maintainability: documented interfaces, small modules, fixtures,
  deterministic tests, and no provider lock-in in core contracts.

## Current baseline to preserve

- TypeScript, strict mode, ESM, Node.js LTS.
- LangChain tools and LangGraph agent loop.
- Zod schemas at tool boundaries.
- Content search, filename search, safe file reads, directory listing,
  package/config inspection, symbol/test discovery, Git inspection,
  dependency analysis, and an allowlisted command runner.
- Unit tests for each repository tool and a stub-model integration suite.
- Optional Langfuse tracing behind environment-variable checks.

Every phase below must preserve the existing evidence rules and repository
boundary checks. Do not remove a working safety test to make implementation
easier.

## Phase 0 — Define the public contract

### 0.1 Product and threat model

- Write a concise public product specification for supported repositories,
  supported questions, excluded use cases, and known limitations.
- Define the read-only capability model: metadata, filesystem read, text
  search, Git read, static analysis, and approved validation execution.
- Classify repository content, tool output, logs, model responses, and user
  input as untrusted unless produced by a trusted runtime boundary.
- Document threats: prompt injection in source files, path traversal, symlink
  escape, secret exposure, malicious package scripts, resource exhaustion,
  telemetry leakage, stale snapshots, confused-deputy access, and false
  confidence.
- Define severity levels and report language for findings.
- Publish a security contact, supported disclosure process, and dependency
  update policy.

Acceptance criteria:

- A threat model lists assets, trust boundaries, attacks, mitigations, and
  residual risks.
- The public README clearly states what the agent can and cannot do.
- No feature can grant write, network, installation, or secret access merely
  because a repository file requests it.

Verification:

- Review the threat model against the security tests.
- Add adversarial fixtures containing fake system messages, fake approvals,
  secret-like values, and malicious instructions.

### 0.2 Stable schemas and versioning

- Create versioned Zod schemas for investigation requests, repository
  snapshots, tool calls, tool results, evidence, claims, findings, reports,
  clarifications, errors, and usage accounting.
- Use discriminated unions for success, partial, blocked, and failed results.
- Add schema version fields and backward-compatible parsing where practical.
- Define stable citation IDs rather than relying only on line numbers.
- Define redaction metadata so a report can explain that content was omitted.
- Keep provider-specific model response types out of public domain contracts.

Acceptance criteria:

- Invalid input and malformed model output fail with typed errors.
- A report cannot contain an unresolved citation or unsupported status.
- Schema changes have migration notes and fixtures.

## Phase 1 — Make the CLI usable by real people

### 1.1 Portable CLI entrypoint

- Remove the hardcoded Windows repository path from `index.ts`.
- Accept repository path, question, output format, and optional configuration
  through CLI arguments and interactive prompts.
- Support `--repo`, `--question`, `--stdin`, `--json`, `--no-color`,
  `--model`, `--trace`, `--max-turns`, and `--timeout`.
- Resolve and canonicalize the selected repository once.
- Print a safe repository display name, never an unnecessary absolute path in
  model prompts or public reports.
- Return stable process exit codes for success, partial answer, invalid input,
  missing configuration, and internal failure.
- Add Ctrl+C cancellation and cleanup.

Acceptance criteria:

- A new user can install the package, run one documented command, and get an
  evidence-grounded answer against any supported local repository.
- The CLI works on macOS, Linux, and Windows.
- Interactive and non-interactive usage produce equivalent investigation
  behavior.

Verification:

- Cross-platform path fixtures.
- CLI tests for argument parsing, stdin, cancellation, exit codes, and
  missing repository paths.

### 1.2 Configuration and secrets

- Load `.env` only for local development; never read or display secret values.
- Validate configuration at startup with actionable messages.
- Support environment variables and a user config file with documented
  precedence.
- Separate model credentials, telemetry credentials, and repository settings.
- Add configurable provider/model adapters while keeping OpenAI as the first
  supported provider.
- Add an offline/mock mode for demos and CI.

Acceptance criteria:

- The application starts in mock mode without model credentials.
- Real mode fails clearly when required credentials are absent.
- Secrets are excluded from logs, reports, traces, test snapshots, and error
  messages.

## Phase 2 — Harden repository ingestion and retrieval

### 2.1 Immutable repository snapshots

- Create an import step that records a snapshot ID, root metadata, file
  manifest, file hashes, sizes, encodings, and exclusions.
- Exclude `.git`, `node_modules`, `dist`, build output, binaries, sockets,
  environment files, private keys, and oversized files by policy.
- Reject symlinks initially or record them as excluded; never follow a symlink
  outside the selected root.
- Detect files changing during ingestion and retry or mark the snapshot
  inconsistent.
- Support explicit include/exclude rules and package/subdirectory scope.
- Make snapshot reads immutable for the duration of an investigation.
- Add configurable file-count, byte, depth, and per-file limits.

Acceptance criteria:

- Every evidence record identifies a snapshot and content hash.
- No retrieval operation escapes the snapshot.
- Exclusions are visible to the user and included in coverage metadata.

Verification:

- Traversal, symlink, race, oversized-file, binary, encoding, and permission
  fixtures.
- Property tests proving normalized paths remain inside the snapshot.

### 2.2 Retrieval quality

- Replace unbounded recursive reads with bounded, cancellable traversal.
- Return relative paths, line numbers, snippets, match counts, truncation
  flags, and ignored-path explanations.
- Add literal search first, optional safe regular expressions later.
- Add glob/path filtering, extension filtering, case sensitivity, and
  pagination.
- Deduplicate overlapping search results.
- Add incremental indexes for path, text, imports, exports, symbols, and tests.
- Use TypeScript compiler APIs or ts-morph for declarations and references.
- Mark dynamic imports, generated code, reflection, and unresolved symbols as
  coverage limitations.
- Cache by snapshot hash and normalized query.

Acceptance criteria:

- Search results are deterministic for the same snapshot and query.
- Large repositories return bounded results without hanging the agent.
- Tool output explicitly states truncation and omitted areas.

## Phase 3 — Improve the investigation agent

### 3.1 Planning and clarification

- Add a lightweight investigation plan in agent state: objective, scope,
  hypotheses, planned checks, completed checks, and stopping reason.
- Ask a clarification question when repository scope, target behavior, desired
  depth, branch/snapshot, or output format is materially ambiguous.
- Ask at most one focused question at a time and explain why it matters.
- Support user answers as a resumable state transition.
- Avoid clarification for low-risk defaults that are documented and reversible.
- Detect requests that are impossible with available evidence and state what
  would unblock them.

Acceptance criteria:

- Ambiguous questions pause with a structured clarification request.
- The agent never invents user intent or silently broadens scope.
- Resuming after clarification preserves completed evidence.

### 3.2 Better investigation loop

- Route simple questions directly to the minimum specialized tool.
- For broad questions, run a bounded survey: structure, package/configuration,
  source symbols, tests, Git state, and targeted reads.
- Require reading relevant files after discovery before causal claims.
- Compare competing explanations and seek one discriminating check.
- Stop on sufficient evidence, no-progress repetition, budget exhaustion,
  cancellation, or deadline.
- Add deterministic tool-call deduplication and query normalization.
- Maintain a coverage summary: inspected paths, excluded paths, failed tools,
  and unexamined alternatives.

Acceptance criteria:

- Final answers distinguish facts, inferences, recommendations, and gaps.
- The agent does not claim exhaustive analysis unless it actually completed
  the declared scope.
- Repeated identical searches do not consume unlimited model turns.

### 3.3 Structured reports

- Generate reports with summary, direct answer, evidence table, reasoning,
  confidence, alternatives, limitations, and suggested next checks.
- Link every material claim to one or more evidence IDs.
- Preserve source locations and snapshot identity in citations.
- Add JSON output for automation and Markdown output for humans.
- Add a machine-readable investigation receipt with model, prompt, tool,
  timing, token, and stopping metadata.
- Never expose hidden chain-of-thought; expose concise reasoning summaries and
  evidence references only.

## Phase 4 — Tool safety and command execution

### 4.1 Tool capability gateway

- Centralize tool registration, authorization, input validation, timeouts,
  output limits, redaction, audit events, and error normalization.
- Assign each tool a capability class and permitted snapshot scope.
- Reject unknown arguments and unexpected output shapes.
- Add cancellation via `AbortSignal`.
- Add per-tool concurrency and total call budgets.
- Prevent tools from accepting arbitrary shell, SQL, URLs, or filesystem roots.

Acceptance criteria:

- Every tool call is validated, bounded, auditable, and cancellable.
- Capability policy is enforced outside the prompt.
- Tool failures are explicit and never converted into successful-looking data.

### 4.2 Safe validation runner

- Keep repository analysis read-only by default.
- Replace command strings with named command profiles and structured arguments.
- Run validation in a disposable isolated copy, not the user's checkout.
- Disable network, secrets, host mounts, Docker socket, and credential access.
- Enforce non-root execution, CPU/memory/PID/disk/time limits, and process-tree
  cleanup.
- Record argv, working directory, environment names (not values), image/runtime
  digest, exit code, signal, timeout, stdout/stderr artifact hashes, and
  resource usage.
- Require explicit user approval for every execution profile.
- Make `npm test` and package installation warnings prominent because they can
  execute arbitrary repository code.

Acceptance criteria:

- No command can mutate the original repository.
- A timed-out process tree is fully cleaned up.
- Validation results are tied to the exact snapshot and profile.

## Phase 5 — Production architecture

### 5.1 Separate application layers

- Extract domain contracts, repository ingestion, retrieval, agent orchestration,
  report generation, observability, and CLI adapters into clear modules.
- Introduce dependency injection for model, clock, filesystem, Git, storage,
  and telemetry.
- Keep the CLI thin and testable.
- Define interfaces that permit hosted service and local CLI frontends.
- Avoid creating empty packages; add boundaries with a vertical feature.

### 5.2 Durable investigations

- Add persistent investigation records and resumable checkpoints.
- Persist status, plan, evidence, tool calls, clarifications, report versions,
  cancellation, usage, and stopping reason.
- Use idempotency keys for launches and result publication.
- Add leases, heartbeats, fencing tokens, and stale-worker recovery if a
  worker process is introduced.
- Ensure completion order cannot change merged state.
- Support resume after process crash without duplicate side effects.

Acceptance criteria:

- A killed investigation resumes from durable state.
- Duplicate requests do not start duplicate billable runs.
- Partial results remain available after timeout or cancellation.

### 5.3 Optional service mode

- Add a local HTTP API only after the CLI contracts are stable.
- Bind local service to loopback by default.
- Add authenticated sessions, strict origin checks, CSRF protection, bounded
  request bodies, and rate limits.
- Stream progress through versioned SSE events.
- Never expose model keys, database credentials, absolute host paths, or raw
  hidden reasoning to clients.
- Add a minimal web UI for question, scope, progress, report, evidence, and
  clarification—not a decorative multi-agent dashboard.

## Phase 6 — Observability, cost, and operations

- Create one trace per investigation with nested model, tool, retrieval,
  validation, clarification, and report spans.
- Record model ID, prompt version/hash, schema version, snapshot hash, token
  categories, latency, retries, cost estimate, and stopping reason.
- Redact secrets and cap trace payload sizes.
- Add structured local logs with correlation IDs.
- Add metrics for investigations, tool latency, error rate, truncation,
  clarification rate, cache hit rate, token/cost usage, and cancellation.
- Make Langfuse optional and non-blocking; telemetry outages must not break
  investigations.
- Add configurable budgets for model calls, tokens, cost, wall time, file
  count, bytes, and tool attempts.
- Report unknown provider usage rather than fabricating cost.
- Add operational runbooks for provider outage, corrupted cache, stuck worker,
  telemetry outage, and snapshot cleanup.

## Phase 7 — Testing and evaluation

### 7.1 Deterministic automated testing

- Keep focused unit tests for every tool and policy helper.
- Add integration tests for complete agent tool loops with stub models.
- Add property tests for path containment, budgets, redaction, citations,
  idempotency, and deterministic result merging.
- Add adversarial tests for prompt injection, fake tool output, malformed model
  calls, path traversal, symlinks, secrets, oversized files, and command
  escape.
- Add fault tests for timeouts, cancellation, provider errors, telemetry
  failure, malformed output, and worker restart.
- Add fixture repositories covering TypeScript, JavaScript, monorepos, missing
  Git, generated files, large files, and contradictory evidence.
- Add snapshot tests only for stable public output, not implementation details.

### 7.2 Quality benchmark

- Build a versioned evaluation set of realistic investigation questions.
- Include code-path explanation, regression analysis, configuration mismatch,
  test discovery, change impact, healthy repositories, and insufficient
  evidence.
- Keep expected answers/evidence labels outside the agent-visible repository.
- Compare deterministic retrieval, single-agent, and planned/delegated modes
  under equal budgets.
- Score answer correctness, citation validity, evidence precision, coverage,
  appropriate abstention, safety violations, tool efficiency, latency, and
  cost.
- Repeat runs and report distributions, not one flattering result.
- Review failures and judge disagreements manually.
- Never market proposed targets as measured results.

### 7.3 Required quality gates

- TypeScript build and strict type-check.
- Unit, integration, security, and property tests.
- Dependency audit and secret scan.
- Formatting and lint checks.
- Reproducible mock-mode CLI smoke test.
- Clean-install test from a fresh checkout.
- No generated output, credentials, or local paths committed.

## Phase 8 — Open-source readiness

- Expand README with installation, quickstart, supported platforms, examples,
  configuration, security model, privacy/model-data behavior, limitations,
  troubleshooting, and development commands.
- Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`, and
  issue/feature request templates.
- Add a changelog and semantic versioning policy.
- Document architecture decisions and public extension points.
- Provide mock fixtures so contributors can run tests without model keys.
- Add a reproducible release workflow with signed or provenance-attested
  artifacts where practical.
- Pin CI action revisions and use least-privilege CI token permissions.
- Publish support policy and compatibility matrix for Node.js and providers.
- Make all examples safe to copy: placeholders only, no live credentials.

## Phase 9 — Release checklist

Before calling a release production-ready:

- [ ] Fresh install succeeds on every supported OS.
- [ ] CLI accepts a repository path without source edits.
- [ ] Mock mode works without external credentials.
- [ ] Real provider setup and privacy notice are documented.
- [ ] Snapshot boundaries and symlink behavior are tested.
- [ ] No repository content can override trusted policy.
- [ ] No command runs outside an approved isolated profile.
- [ ] Original repositories remain unmodified.
- [ ] Every report claim has resolvable evidence or an explicit uncertainty.
- [ ] Clarification and cancellation work.
- [ ] Resume after interruption works.
- [ ] Budgets and deadlines stop work reliably.
- [ ] Secrets are absent from logs, reports, traces, and artifacts.
- [ ] Telemetry failure does not break core investigations.
- [ ] Unit, integration, security, property, build, and clean-install checks
      pass.
- [ ] Evaluation results include denominators, limitations, and failed cases.
- [ ] Documentation matches implemented behavior.
- [ ] Git diff contains only intentional source, test, and documentation
      changes.

## Recommended implementation order

1. Portable CLI and configuration.
2. Versioned contracts and typed errors.
3. Immutable snapshots and hardened retrieval.
4. Tool gateway, budgets, cancellation, and redaction.
5. Planning, clarification, coverage, and structured reports.
6. Safe isolated validation runner.
7. Durable state and resumable investigations.
8. Evaluation fixtures and security/property tests.
9. Observability, cost controls, and operational runbooks.
10. Optional service/UI mode.
11. Open-source documentation and release automation.

Do not implement repair, automatic patch application, unrestricted shell
execution, remote GitHub actions, or autonomous deployment until the read-only
release has passed its security and evaluation gates.
