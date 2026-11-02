1. tool types to implement:


tools/
├── repository/       # Files, folders, search, symbols, tests, snapshots
├── git/              # Status, history, diffs, branches, commits
├── github/           # Repositories, issues, PRs, actions, releases
├── browser/          # Navigation, interaction, DOM extraction
├── vision/           # Screenshots, images, visual reasoning
├── kubernetes/       # Clusters, workloads, pods, logs, events
├── cloud/            # AWS, GCP, Azure resources and deployments
├── database/         # Schemas, queries, migrations, diagnostics
├── observability/    # Logs, traces, metrics, alerts, errors
├── terminal/         # Approved commands and isolated execution
├── documents/        # Markdown, PDF, Word, spreadsheets, slides
├── communication/    # Email, Slack, Discord, notifications
├── calendar/         # Events, schedules, availability
├── storage/          # Local files, S3, Drive, uploads
├── code-analysis/    # AST, dependencies, call graphs, complexity
├── testing/          # Unit, integration, browser, performance tests
├── security/         # Secrets, vulnerabilities, permissions, policies
├── automation/       # Jobs, workflows, webhooks, scheduled tasks
├── memory/           # Facts, preferences, investigation history
├── knowledge/        # Embeddings, graph search, indexed documentation
├── approvals/        # Human approval and restricted operations
├── evaluation/       # Benchmarks, test cases, quality scoring
└── shared/           # Schemas, policies, audit, caching, errors


A strong application structure would be:

src/
├── agent/
├── tools/
├── tool-runtime/
├── permissions/
├── evidence/
├── investigations/
├── snapshots/
├── indexing/
├── storage/
├── observability/
├── evaluation/
├── cli/
└── config/

