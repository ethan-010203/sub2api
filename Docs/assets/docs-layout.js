const DOCS_PAGES = {
    nodejs: {
        title: "Node.js 前置安装",
        href: "pages/nodejs.html",
        icon: '<i class="fa-brands fa-node-js"></i>'
    },
    intro: {
        title: "CodexSurf 简介",
        href: "pages/intro.html",
        icon: '<i class="fas fa-rocket"></i>'
    },
    "get-started": {
        title: "获取 API Key",
        href: "pages/get-started.html",
        icon: '<i class="fas fa-key"></i>'
    },
    codex: {
        title: "CodeX配置",
        href: "pages/codex.html",
        icon: '<i class="fas fa-terminal"></i>'
    },
    "cc-switch": {
        title: "CC-Switch 使用",
        href: "pages/cc-switch.html",
        icon: '<i class="fas fa-toggle-on"></i>'
    },
    openclaw: {
        title: "OpenClaw 配置",
        href: "pages/openclaw.html",
        icon: '<span class="nav-emoji">🦞</span>'
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
    link.className = "floating-btn";
    link.innerHTML = '<i class="fas fa-external-link-alt"></i> CodexSurf 主站';
    return link;
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
});
