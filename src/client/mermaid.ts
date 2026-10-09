const nodes = [...document.querySelectorAll<HTMLElement>(".mermaid")];

if (nodes.length) {
    const sources = new Map(nodes.map((node) => [node, node.textContent ?? ""]));

    try {
        const { default: mermaid } = await import("mermaid");
        let rendering = false;
        let pending = false;
        async function renderDiagrams() {
            if (rendering) {
                pending = true;
                return;
            }
            rendering = true;
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                theme:
                    getComputedStyle(document.documentElement).colorScheme === "dark"
                        ? "dark"
                        : "default",
            });
            for (const node of nodes) {
                node.textContent = sources.get(node) ?? "";
                delete node.dataset.processed;
                node.parentElement?.querySelector(".diagram-error")?.remove();
                try {
                    await mermaid.run({ nodes: [node], suppressErrors: false });
                } catch (error) {
                    node.textContent = sources.get(node) ?? "";
                    const message = document.createElement("figcaption");
                    message.className = "diagram-error";
                    message.textContent = "圖表無法渲染，已保留原始內容。";
                    node.parentElement?.append(message);
                    console.error("Mermaid rendering failed:", error);
                }
            }
            rendering = false;
            if (pending) {
                pending = false;
                await renderDiagrams();
            }
        }
        window.addEventListener("themechange", renderDiagrams);
        await renderDiagrams();
    } catch (error) {
        console.error("Mermaid could not load; source is still visible:", error);
    }
}

export {};
