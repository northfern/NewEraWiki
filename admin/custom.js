/* --- Admonition (admonition) --- */
CMS.registerEditorComponent({
  id: "admonition",
  label: "Блок-примечание",
  fields: [
    { name: "type", label: "Тип", widget: "select",
      options: ["note","abstract","info","tip","success","question",
                "warning","failure","danger","bug","example","quote"] },
    { name: "title", label: "Заголовок", widget: "string", required: false },
    { name: "content", label: "Содержимое", widget: "markdown" }
  ],
  pattern: /^!!! ([a-z]+)(?: "([^"]*)")?\n((?: {4}[^\n]*\n?)+)/,
  fromBlock: (m) => ({ type: m[1], title: (m[2]||"").trim(),
                       content: m[3].replace(/^ {4}/gm,"").trim() }),
  toBlock: (o) => `!!! ${o.type}${o.title ? ` "${o.title}"` : ""}\n` +
    o.content.split("\n").map(l => l ? `    ${l}` : "    ").join("\n"),
  toPreview: (o) => `<div class="admonition ${o.type}">
    <p class="admonition-title">${o.title||o.type}</p><div>${o.content}</div></div>`
});

/* --- Сворачиваемый блок (pymdownx.details) --- */
CMS.registerEditorComponent({
  id: "details",
  label: "Спойлер (details)",
  fields: [
    { name: "type", label: "Тип", widget: "select",
      options: ["note","info","tip","warning","danger","example","quote"] },
    { name: "title", label: "Заголовок", widget: "string", required: false },
    { name: "open", label: "Раскрыт по умолчанию", widget: "boolean", default: false },
    { name: "content", label: "Содержимое", widget: "markdown" }
  ],
  pattern: /^\?\?\?(\+)? ([a-z]+)(?: "([^"]*)")?\n((?: {4}[^\n]*\n?)+)/,
  fromBlock: (m) => ({ open: !!m[1], type: m[2], title: (m[3]||"").trim(),
                       content: m[4].replace(/^ {4}/gm,"").trim() }),
  toBlock: (o) => `???${o.open ? "+" : ""} ${o.type}${o.title ? ` "${o.title}"` : ""}\n` +
    o.content.split("\n").map(l => l ? `    ${l}` : "    ").join("\n"),
  toPreview: (o) => `<details${o.open?" open":""}><summary>${o.title||o.type}</summary>
    <div>${o.content}</div></details>`
});

/* --- Вкладки (pymdownx.tabbed) --- */
CMS.registerEditorComponent({
  id: "tabs",
  label: "Вкладки",
  fields: [
    { name: "tabs", label: "Вкладки", widget: "list",
      fields: [
        { name: "title", label: "Заголовок вкладки", widget: "string" },
        { name: "content", label: "Содержимое", widget: "markdown" }
      ] }
  ],
  pattern: /^((?:=== "[^"\n]+"\n(?: {4}[^\n]*\n?| *\n?)+)+)/,
  fromBlock: (m) => {
    const tabs = []; const re = /=== "([^"\n]+)"\n([\s\S]*?)(?=\n=== "|$)/g; let t;
    while ((t = re.exec(m[1])))
      tabs.push({ title: t[1], content: t[2].replace(/^ {4}/gm,"").trim() });
    return { tabs };
  },
  toBlock: (o) => o.tabs.map(t => `=== "${t.title}"\n` +
    t.content.split("\n").map(l => l ? `    ${l}` : "    ").join("\n")).join("\n\n"),
  toPreview: (o) => o.tabs.map(t => `<h4>▸ ${t.title}</h4><div>${t.content}</div>`).join("")
});

/* --- Диаграммы (superfences + mermaid) --- */
CMS.registerEditorComponent({
  id: "mermaid",
  label: "Диаграмма Mermaid",
  fields: [{ name: "code", label: "Код диаграммы", widget: "text" }],
  pattern: /^```mermaid\n([\s\S]*?)```/m,
  fromBlock: (m) => ({ code: m[1].trim() }),
  toBlock: (o) => "```mermaid\n" + o.code + "\n```",
  toPreview: (o) => `<pre class="mermaid">${o.code}</pre>`
});

/* --- Вики-ссылки (obsidian-support / roamlinks) --- */
CMS.registerEditorComponent({
  id: "wikilink",
  label: "Вики-ссылка [[…]]",
  fields: [
    { name: "page", label: "Страница", widget: "string" },
    { name: "alias", label: "Текст ссылки", widget: "string", required: false }
  ],
  pattern: /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/,
  fromBlock: (m) => ({ page: m[1].trim(), alias: (m[2]||"").trim() }),
  toBlock: (o) => `[[${o.page}${o.alias ? `|${o.alias}` : ""}]]`,
  toPreview: (o) => `<a href="#">🔗 ${o.alias||o.page}</a>`
});

/* --- Вставка файла (pymdownx.snippets) --- */
CMS.registerEditorComponent({
  id: "snippet",
  label: "Вставка файла (snippet)",
  fields: [{ name: "path", label: "Путь к файлу", widget: "string" }],
  pattern: /^--8<-- +["']?([^"'\n]+)["']? *$/m,
  fromBlock: (m) => ({ path: m[1].trim() }),
  toBlock: (o) => `--8<-- "${o.path}"`,
  toPreview: (o) => `<em>📄 Вставка: ${o.path}</em>`
});

/* --- Превью в стиле Material --- */
CMS.registerPreviewStyle(`
  .admonition{border-left:.25rem solid #448aff;padding:.6rem 1rem;margin:.8rem 0;
    background:rgba(68,138,255,.08);border-radius:4px}
  .admonition.warning,.admonition.danger,.admonition.failure{border-color:#ff5252;
    background:rgba(255,82,82,.08)}
  .admonition.success,.admonition.tip{border-color:#00c853;background:rgba(0,200,83,.08)}
  .admonition-title{font-weight:700;margin:0 0 .4rem}
  .mermaid{background:#f5f5f5;padding:1rem;text-align:center;font-family:monospace}
`, { raw: true });
