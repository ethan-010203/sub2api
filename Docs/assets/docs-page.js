const KNOWN_PAGES = new Set(["nodejs", "intro", "get-started", "codex", "cc-switch", "openclaw"]);

function findTarget(targetId) {
    if (!targetId) {
        return null;
    }

    try {
        return document.querySelector(`#${CSS.escape(targetId)}`);
    } catch (error) {
        return Array.from(document.querySelectorAll("[id]"))
            .find(node => node.id === targetId) || null;
    }
}

function bindCopyButtons() {
    document.querySelectorAll("pre").forEach(pre => {
        const container = pre.closest(".vp-adaptive-theme") || pre.parentElement;
        if (!container || container.querySelector(".copy")) {
            return;
        }

        const btn = document.createElement("button");
        btn.className = "copy";
        btn.type = "button";
        btn.textContent = "复制";
        btn.setAttribute("aria-label", "Copy Code");

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

    document.querySelectorAll(".copy").forEach(btn => {
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

            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                btn.classList.add("copied");
                btn.textContent = "已复制";
                setTimeout(() => {
                    btn.classList.remove("copied");
                    btn.textContent = "复制";
                }, 2000);
            });
        });
    });
}

function bindAnchors() {
    document.querySelectorAll("a[href]").forEach(link => {
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

            const target = findTarget(targetId);
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

document.addEventListener("DOMContentLoaded", () => {
    bindCopyButtons();
    bindAnchors();
});
