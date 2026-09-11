import markdownIt from "markdown-it";
import katex from "katex";

function renderTex(tex, displayMode) {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return displayMode
      ? `<pre class="katex-error">${tex}</pre>`
      : `<code class="katex-error">${tex}</code>`;
  }
}

/** markdown-it plugin: \(…\) inline and \[…\] / $$…$$ display, rendered with KaTeX at build time. */
function markdownItKatex(md) {
  md.inline.ruler.before("escape", "math_inline", (state, silent) => {
    const src = state.src;
    const start = state.pos;
    if (src.slice(start, start + 2) !== "\\(") return false;
    let i = start + 2;
    while (i < src.length - 1) {
      if (src[i] === "\\" && src[i + 1] === ")") {
        if (!silent) {
          const token = state.push("math_inline", "math", 0);
          token.content = src.slice(start + 2, i);
          token.markup = "\\(";
        }
        state.pos = i + 2;
        return true;
      }
      i += 1;
    }
    return false;
  });

  md.inline.ruler.before("escape", "math_inline_dollar", (state, silent) => {
    const src = state.src;
    const start = state.pos;
    if (src[start] !== "$" || src[start + 1] === "$") return false;
    // don't treat $$ as inline
    let i = start + 1;
    if (i >= src.length || src[i] === " " || src[i] === "\n") return false;
    while (i < src.length) {
      if (src[i] === "\\" && i + 1 < src.length) {
        i += 2;
        continue;
      }
      if (src[i] === "$") {
        if (!silent) {
          const token = state.push("math_inline", "math", 0);
          token.content = src.slice(start + 1, i);
          token.markup = "$";
        }
        state.pos = i + 1;
        return true;
      }
      i += 1;
    }
    return false;
  });

  md.renderer.rules.math_inline = (tokens, idx) =>
    renderTex(tokens[idx].content, false);

  md.block.ruler.after("blockquote", "math_block", (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(start, max).trim();

    let closer = null;
    let contentStartLine = startLine;
    if (line === "\\[" || line.startsWith("\\[")) {
      closer = "\\]";
      if (line === "\\[") contentStartLine = startLine + 1;
      else {
        // single-line \[ ... \]
        const endIdx = line.indexOf("\\]");
        if (endIdx !== -1) {
          if (silent) return true;
          const tex = line.slice(2, endIdx).trim();
          const token = state.push("math_block", "math", 0);
          token.content = tex;
          token.block = true;
          token.map = [startLine, startLine + 1];
          state.line = startLine + 1;
          return true;
        }
      }
    } else if (line === "$$" || (line.startsWith("$$") && line !== "$$$")) {
      closer = "$$";
      if (line === "$$") contentStartLine = startLine + 1;
      else if (line.endsWith("$$") && line.length > 4) {
        if (silent) return true;
        const tex = line.slice(2, -2).trim();
        const token = state.push("math_block", "math", 0);
        token.content = tex;
        token.block = true;
        token.map = [startLine, startLine + 1];
        state.line = startLine + 1;
        return true;
      }
    } else {
      return false;
    }

    let next = contentStartLine;
    const parts = [];
    if (line.startsWith("\\[") && line !== "\\[") {
      parts.push(line.slice(2));
    }
    if (line.startsWith("$$") && line !== "$$" && !line.endsWith("$$")) {
      parts.push(line.slice(2));
    }

    for (; next < endLine; next++) {
      const s = state.bMarks[next] + state.tShift[next];
      const e = state.eMarks[next];
      const l = state.src.slice(s, e).trim();
      if (next >= contentStartLine && (l === closer || l.endsWith(closer))) {
        if (l !== closer && l.endsWith(closer)) {
          parts.push(l.slice(0, -closer.length));
        }
        if (silent) return true;
        const token = state.push("math_block", "math", 0);
        token.content = parts.join("\n").trim();
        token.block = true;
        token.map = [startLine, next + 1];
        state.line = next + 1;
        return true;
      }
      if (next >= contentStartLine) {
        const s2 = state.bMarks[next] + state.tShift[next];
        const e2 = state.eMarks[next];
        parts.push(state.src.slice(s2, e2));
      }
    }
    return false;
  });

  md.renderer.rules.math_block = (tokens, idx) =>
    `<div class="katex-display-block">${renderTex(tokens[idx].content, true)}</div>\n`;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy({ "neural-capture": "neural-capture" });
  eleventyConfig.addPassthroughCopy({ "ohao-engine": "ohao-engine" });

  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.addWatchTarget("src/js");

  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: false,
  });
  markdownItKatex(md);
  // Journal figures: wrap images in <figure> with figcaption from alt (reading + phone).
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet("src") || "";
    const alt = token.content || token.attrGet("alt") || "";
    const title = token.attrGet("title");
    const esc = (s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    const titleAttr = title ? ` title="${esc(title)}"` : "";
    const caption = alt
      ? `<figcaption class="posts-figcaption">${esc(alt)}</figcaption>`
      : "";
    return `<figure class="posts-figure"><img src="${esc(src)}" alt="${esc(alt)}"${titleAttr} loading="lazy" decoding="async" />${caption}</figure>`;
  };
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addCollection("journal", (api) =>
    api
      .getFilteredByGlob("./src/journal/**/*.md")
      .sort((a, b) => b.date - a.date)
  );

  function asDate(date) {
    if (date instanceof Date) return date;
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  eleventyConfig.addFilter("dateDisplay", (date) => {
    const d = asDate(date);
    if (!d) return String(date ?? "");
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("dateISO", (date) => {
    const d = asDate(date);
    if (!d) return String(date ?? "");
    return d.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));


  eleventyConfig.addTransform("journalTableWrap", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    if (!content.includes("posts-article-body")) return content;
    return content.replace(
      /<table>/g,
      '<div class="posts-table-wrap"><table>'
    ).replace(/<\/table>/g, "</table></div>");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
