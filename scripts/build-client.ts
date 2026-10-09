import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";

export async function buildClient(): Promise<void> {
    for (const entry of ["theme", "mermaid"]) {
        const result = await build({
            entryPoints: [`src/client/${entry}.ts`],
            outfile: `.generated/${entry}.js`,
            bundle: true,
            platform: "browser",
            format: entry === "theme" ? "iife" : "esm",
            target: "es2022",
            write: false,
            plugins: [
                {
                    name: "local-mermaid",
                    setup(builder) {
                        builder.onResolve({ filter: /^mermaid$/ }, () => ({
                            path: "/assets/vendor/mermaid/mermaid.esm.min.mjs",
                            external: true,
                        }));
                    },
                },
            ],
        });
        for (const file of result.outputFiles) {
            let current: string | undefined;
            try {
                current = await fs.readFile(file.path, "utf8");
            } catch (error) {
                if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
                    throw error;
            }
            // Avoid triggering another watch build when generated content is unchanged.
            if (current === file.text) continue;
            await fs.mkdir(path.dirname(file.path), { recursive: true });
            await fs.writeFile(file.path, file.contents);
        }
    }
}
