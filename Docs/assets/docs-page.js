const KNOWN_PAGES = new Set(["nodejs", "intro", "get-started", "codex", "cc-switch", "openclaw"]);

function findTarget(targetId, root = document) {
    if (!targetId) {
        return null;
    }

    try {
        return root.querySelector(`#${CSS.escape(targetId)}`);
    } catch (error) {
        return Array.from(root.querySelectorAll("[id]"))
            .find(node => node.id === targetId) || null;
    }
}

function legacyCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand("copy");
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    } finally {
        textarea.remove();
    }
}

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return legacyCopyText(text);
}

function bindCopyButtons(root = document) {
    root.querySelectorAll("pre").forEach(pre => {
        const container = pre.closest(".vp-adaptive-theme") || pre.parentElement;
        if (!container || container.querySelector(".copy")) {
            return;
        }

        const btn = document.createElement("button");
        btn.className = "copy";
        btn.type = "button";
        btn.textContent = "复制";
        btn.setAttribute("aria-label", "复制代码");
        btn.setAttribute("title", "复制代码");

        if (container === pre) {
            pre.style.position = "relative";
            pre.appendChild(btn);
        } else {
            if (window.getComputedStyle(container).position === "static") {
                container.style.position = "relative";
            }
            container.insertBefore(btn, container.firstChild);
        }
    });

    root.querySelectorAll(".copy").forEach(btn => {
        if (btn.dataset.bound === "true") {
            return;
        }

        btn.dataset.bound = "true";
        btn.type = "button";
        btn.textContent = "复制";

        btn.addEventListener("click", () => {
            const container = btn.closest(".vp-adaptive-theme") || btn.parentElement;
            const codeBlock = container?.querySelector("code") || container?.querySelector("pre");
            if (!codeBlock) {
                return;
            }

            copyText(codeBlock.innerText).then(() => {
                btn.classList.add("copied");
                btn.textContent = "已复制";
                setTimeout(() => {
                    btn.classList.remove("copied");
                    btn.textContent = "复制";
                }, 2000);
            }).catch(() => {
                btn.textContent = "复制失败";
                setTimeout(() => {
                    btn.textContent = "复制";
                }, 2000);
            });
        });
    });
}

function bindAnchors(root = document) {
    root.querySelectorAll("a[href]").forEach(link => {
        if (link.dataset.anchorBound === "true") {
            return;
        }

        link.dataset.anchorBound = "true";
        link.addEventListener("click", event => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) {
                return;
            }

            const targetId = decodeURIComponent(href.slice(1));
            if (!targetId) {
                return;
            }

            const target = findTarget(targetId, root);
            if (target) {
                return;
            }

            if (!KNOWN_PAGES.has(targetId)) {
                return;
            }

            event.preventDefault();
            const nextUrl = new URL(`pages/${encodeURIComponent(targetId)}.html`, document.baseURI);
            window.location.href = nextUrl.href;
        });
    });
}

function initDocsPage(root = document) {
    bindCopyButtons(root);
    bindAnchors(root);
}

window.initDocsPage = initDocsPage;

document.addEventListener("DOMContentLoaded", () => {
    initDocsPage(document);
});
