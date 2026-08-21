export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy({ "neural-capture": "neural-capture" });
  eleventyConfig.addPassthroughCopy({ "ohao-engine": "ohao-engine" });

  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.addWatchTarget("src/js");

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
