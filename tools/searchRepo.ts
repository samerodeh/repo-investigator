import fs from "node:fs/promises";
import path from "node:path";

export async function searchRepo(repoPath: string, query: string) {

    const results: string[] = [];


    async function visit(dir: string) {

        const entries = await fs.readdir(dir);

        for (const entry of entries) {

            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {

                await visit(fullPath);
            } else if (entry.isfile()) {

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


