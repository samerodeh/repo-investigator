import fs from "node:fs/promises";
import path from "node:path";

export async function searchRepo(repoPath: string, query: string) {
    // Store the paths of files whose contents contain the search query.
    const results: string[] = [];
    const ignoredFileNames = new Set([
        ".env",
        ".env.local",
        ".env.development",
        ".env.production",
        ".env.test",
        "id_rsa",
        "id_dsa",
        "id_ecdsa",
        "id_ed25519",
    ]);

    // Traverse the repository and inspect files in each directory.
    async function visit(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (
                entry.isDirectory() &&
                entry.name !== "node_modules" &&
                entry.name !== ".git" &&
                entry.name !== "dist"
            ) {
                // Continue searching inside allowed subdirectories.
                await visit(fullPath);
            } else if (entry.isFile() && !ignoredFileNames.has(entry.name)) {
                // Read the file and record it when the query is present.
                const content = await fs.readFile(fullPath, "utf8");

                if (content.toLowerCase().includes(query.toLowerCase())) {
                    results.push(fullPath);
                }
            }
        }
    }

    await visit(repoPath);
    return results;
}
