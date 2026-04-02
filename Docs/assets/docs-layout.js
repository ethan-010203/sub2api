const DOCS_PAGES = {
    nodejs: {
        title: "Node.js 前置安装",
        href: "pages/nodejs.html",
        icon: '<i class="fa-brands fa-node-js"></i>',
        keywords: ["node", "nodejs", "安装", "环境", "前置"]
    },
    intro: {
        title: "CodexSurf 简介",
        href: "pages/intro.html",
        icon: '<i class="fas fa-rocket"></i>',
        keywords: ["简介", "介绍", "概览", "首页", "codexsurf"]
    },
    "get-started": {
        title: "获取 API Key",
        href: "pages/get-started.html",
        icon: '<i class="fas fa-key"></i>',
        keywords: ["api", "key", "令牌", "密钥", "开始"]
    },
    codex: {
        title: "CodeX 配置",
        href: "pages/codex.html",
        icon: '<i class="fas fa-terminal"></i>',
        keywords: ["codex", "配置", "openai", "cli"]
    },
    "cc-switch": {
        title: "CC-Switch 使用",
        href: "pages/cc-switch.html",
        icon: '<i class="fas fa-toggle-on"></i>',
        keywords: ["cc-switch", "switch", "切换", "供应商"]
    },
    openclaw: {
        title: "OpenClaw 配置",
        href: "pages/openclaw.html",
        icon: '<i class="fas fa-paw"></i>',
        keywords: ["openclaw", "配置", "gateway", "agent"]
    }
};

const DOCS_GROUPS = [
    {
        title: "概览",
        pages: ["intro", "get-started"]
    },
    {
        title: "前置环境",
        pages: ["nodejs"]
    },
    {
        title: "配置教程",
        pages: ["cc-switch", "codex", "openclaw"]
    }
];

function buildSidebar(currentPage) {
    const aside = document.createElement("aside");
    aside.className = "sidebar";

    const groupsHtml = DOCS_GROUPS.map(group => {
        const links = group.pages.map(page => {
            const item = DOCS_PAGES[page];
            const activeClass = page === currentPage ? " active" : "";
            return `<a href="${item.href}" class="nav-link${activeClass}" data-page="${page}">${item.icon}${item.title}</a>`;
        }).join("");

        return `
            <div class="nav-group">
                <div class="nav-group-title">${group.title}</div>
                ${links}
            </div>
        `;
    }).join("");

    aside.innerHTML = `
        <a href="pages/intro.html" class="logo">
            <i class="fas fa-cube"></i>
            <span>CodexSurf</span> 文档
        </a>
        ${groupsHtml}
    `;

    return aside;
}

function buildAmbientBackground() {
    const background = document.createElement("div");
    background.className = "ambient-bg";
    background.innerHTML = `
        <div class="grid-bg"></div>
        <div class="orb orb-blue"></div>
        <div class="orb orb-pink"></div>
        <div class="orb orb-purple"></div>
        <div class="ambient-overlay"></div>
    `;
    return background;
}

function buildFloatingButton() {
    const link = document.createElement("a");
    link.href = "https://codesurf.ccwu.cc/";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "floating-btn";
    link.innerHTML = '<i class="fas fa-external-link-alt"></i> CodexSurf 主站';
    return link;
}

function buildLoadingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "docs-loading-indicator";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-live", "polite");
    indicator.setAttribute("aria-hidden", "true");
    indicator.innerHTML = `
        <span class="docs-loading-spinner" aria-hidden="true"></span>
        <span>加载中</span>
    `;
    return indicator;
}

function bindSidebarPrefetch(root) {
    root.querySelectorAll('a[href^="pages/"]').forEach(link => {
        if (link.dataset.prefetchBound === "true") {
            return;
        }

        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref.startsWith("#")) {
            return;
        }

        link.dataset.prefetchBound = "true";

        const prefetch = () => {
            const absoluteHref = new URL(rawHref, document.baseURI).href;
            if (document.head.querySelector(`link[rel="prefetch"][href="${absoluteHref}"]`)) {
                return;
            }

            const prefetchLink = document.createElement("link");
            prefetchLink.rel = "prefetch";
            prefetchLink.href = absoluteHref;
            document.head.appendChild(prefetchLink);
        };

        link.addEventListener("mouseenter", prefetch, { once: true });
        link.addEventListener("focus", prefetch, { once: true });
        link.addEventListener("touchstart", prefetch, { once: true });
    });
}

let navigationInFlight = false;

function setLoadingState(loading, sourceLink = null) {
    navigationInFlight = loading;
    document.body.classList.toggle("docs-loading", loading);

    const indicator = document.querySelector(".docs-loading-indicator");
    if (indicator) {
        indicator.setAttribute("aria-hidden", loading ? "false" : "true");
    }

    document.querySelectorAll(".nav-link.is-loading").forEach(link => {
        link.classList.remove("is-loading");
        link.removeAttribute("aria-busy");
    });

    if (loading && sourceLink) {
        sourceLink.classList.add("is-loading");
        sourceLink.setAttribute("aria-busy", "true");
    }
}

function updateActiveNav(currentPage) {
    document.querySelectorAll(".nav-link[data-page]").forEach(link => {
        link.classList.toggle("active", link.dataset.page === currentPage);
    });
}

function shouldHandleInternalLink(link, event) {
    if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank" ||
        link.hasAttribute("download")
    ) {
        return false;
    }

    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#")) {
        return false;
    }

    const nextUrl = new URL(link.href, document.baseURI);
    const docsPagesRoot = new URL("pages/", document.baseURI).href;
    return nextUrl.href.startsWith(docsPagesRoot);
}

async function loadDocPage(url) {
    try {
        const response = await fetch(url.href, { credentials: "same-origin" });
        if (!response.ok) {
            throw new Error(`Failed to load ${url.href}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const nextDocument = parser.parseFromString(html, "text/html");
        const nextContent = nextDocument.querySelector(".doc-page");

        if (!nextContent) {
            throw new Error("Missing .doc-page in response");
        }

        return {
            title: nextDocument.title,
            content: nextContent
        };
    } catch (error) {
        return loadDocPageFromFrame(url);
    }
}

function loadDocPageFromFrame(url) {
    return new Promise((resolve, reject) => {
        const frame = document.createElement("iframe");
        frame.style.position = "fixed";
        frame.style.width = "0";
        frame.style.height = "0";
        frame.style.opacity = "0";
        frame.style.pointerEvents = "none";
        frame.style.border = "0";
        frame.setAttribute("aria-hidden", "true");

        const cleanup = () => {
            frame.onload = null;
            frame.onerror = null;
            if (frame.parentNode) {
                frame.parentNode.removeChild(frame);
            }
        };

        frame.onload = () => {
            try {
                const nextDocument = frame.contentDocument;
                const nextContent = nextDocument?.querySelector(".doc-page");
                if (!nextDocument || !nextContent) {
                    cleanup();
                    reject(new Error("Missing .doc-page in frame response"));
                    return;
                }

                resolve({
                    title: nextDocument.title,
                    content: nextContent
                });
                cleanup();
            } catch (error) {
                cleanup();
                reject(error);
            }
        };

        frame.onerror = () => {
            cleanup();
            reject(new Error(`Failed to load ${url.href} in iframe`));
        };

        document.body.appendChild(frame);
        frame.src = url.href;
    });
}

function swapDocPage(content, url, title, options = {}) {
    const currentContent = document.querySelector(".doc-page");
    if (!currentContent) {
        window.location.href = url.href;
        return;
    }

    const imported = document.importNode(content, true);
    currentContent.replaceWith(imported);

    if (title) {
        document.title = title;
    }

    updateActiveNav(imported.dataset.page || "intro");
    bindSidebarPrefetch(document);

    if (typeof window.initDocsPage === "function") {
        window.initDocsPage(imported);
    }

    if (!options.replaceState) {
        history.pushState({ href: url.href }, "", url.href);
    }

    if (url.hash) {
        const targetId = decodeURIComponent(url.hash.slice(1));
        const target = imported.querySelector(`#${CSS.escape(targetId)}`) || imported.querySelector(`[id="${targetId}"]`);
        if (target) {
            target.scrollIntoView({ block: "start", behavior: "smooth" });
            return;
        }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

async function navigateToDocPage(url, options = {}) {
    try {
        setLoadingState(true, options.sourceLink || null);
        const nextPage = await loadDocPage(url);
        swapDocPage(nextPage.content, url, nextPage.title, options);
        setLoadingState(false);
    } catch (error) {
        setLoadingState(false);
        window.location.href = url.href;
    }
}

function bindInternalNavigation() {
    document.addEventListener("click", event => {
        const link = event.target.closest("a[href]");
        if (!shouldHandleInternalLink(link, event)) {
            return;
        }

        const nextUrl = new URL(link.href, document.baseURI);
        if (
            nextUrl.pathname === window.location.pathname &&
            nextUrl.search === window.location.search &&
            nextUrl.hash === window.location.hash
        ) {
            return;
        }

        if (navigationInFlight) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        navigateToDocPage(nextUrl, { sourceLink: link });
    });

    window.addEventListener("popstate", () => {
        const nextUrl = new URL(window.location.href);
        navigateToDocPage(nextUrl, { replaceState: true });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector(".doc-page");
    if (!content || document.body.dataset.docsLayoutReady === "true") {
        return;
    }

    document.body.dataset.docsLayoutReady = "true";

    const currentPage = content.dataset.page || "intro";
    const ambient = buildAmbientBackground();
    const wrap = document.createElement("div");
    wrap.className = "content-wrap";

    const layout = document.createElement("div");
    layout.className = "layout-wrapper";

    const sidebar = buildSidebar(currentPage);
    const main = document.createElement("main");
    main.className = "main-content";

    const container = document.createElement("div");
    container.className = "content-container";

    document.body.insertBefore(ambient, content);
    document.body.insertBefore(wrap, content);

    main.appendChild(container);
    container.appendChild(content);

    layout.appendChild(buildFloatingButton());
    layout.appendChild(sidebar);
    layout.appendChild(main);
    wrap.appendChild(layout);
    wrap.appendChild(buildLoadingIndicator());

    bindSidebarPrefetch(sidebar);
    bindInternalNavigation();
    history.replaceState({ href: window.location.href }, "", window.location.href);
    document.body.classList.add("docs-layout-ready");
});
