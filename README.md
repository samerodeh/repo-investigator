# Repo Investigator

Repo Investigator is a proposed local-first TypeScript system for investigating
software repositories with bounded specialist agents and evidence-backed
reports.

**Current status: architecture only.** This public repository contains the
engineering blueprint; application code, evaluation runs, and benchmark results
have not been produced. The resume entry describes the work as architecture.

The plan uses LangGraph for investigation state and workflow control, LangChain
for model and tool interfaces, and Langfuse for traces and evaluations. The
initial scope is read-only repository analysis, CI evidence, reproducible
scenarios, and citations. Any future code repair or command execution requires
an isolated sandbox and explicit human approval.

See [the architecture](docs/architecture.md) for requirements, system design,
evaluation approach, safety boundaries, and staged implementation roadmap.
