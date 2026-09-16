module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  eleventyConfig.addFilter("absoluteUrl", function (url, base) {
    try {
      return new URL(url, base).toString();
    } catch (e) {
      return url;
    }
  });

  eleventyConfig.addFilter("year", function () {
    return new Date().getFullYear();
  });

  eleventyConfig.addFilter("isoDate", function (date) {
    var d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("initials", function (name) {
    return String(name || "")
      .replace(/(Ing\.|Mgr\.|Bc\.|MUDr\.|JUDr\.|PhDr\.)/g, "")
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map(function (word) {
        return word.charAt(0);
      })
      .join("")
      .toUpperCase();
  });

  // Interní odkazy se v šablonách píšou root-relative ("/kontakt/").
  // Aby web fungoval i z podadresáře (staticke-weby.github.io/123stranky.cz/),
  // přepíšeme je při buildu na relativní podle hloubky stránky. Na kořeni
  // domény (www.123stranky.cz) i lokálně dopadnou relativní odkazy stejně.
  eleventyConfig.addTransform("relativeLinks", function (content) {
    var outputPath = (this.page && this.page.outputPath) || "";
    if (!/\.html$/.test(outputPath)) return content;

    // Hloubku bereme z URL: "/cenik/" -> "../", "/webove-stranky/slany/" -> "../../",
    // soubor v kořeni ("/ukazky.html") -> "./".
    var url = (this.page && this.page.url) || "/";
    var segments = url.split("/").filter(Boolean).length;
    var depth = /\/$/.test(url) ? segments : Math.max(segments - 1, 0);
    var prefix = depth === 0 ? "./" : "../".repeat(depth);

    return content
      .replace(/srcset="([^"]*)"/g, function (match, list) {
        return 'srcset="' + list.replace(/(^|,\s*)\/(?!\/)/g, "$1" + prefix) + '"';
      })
      .replace(/(\s(?:href|src|poster|action|data-src)=")\/(?!\/)/g, "$1" + prefix)
      .replace(/(\scontent="0;\s*url=)\/(?!\/)/g, "$1" + prefix);
  });

  eleventyConfig.addCollection("sitemapPages", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((item) => item.url && !item.data.sitemap_exclude)
      .sort((a, b) => a.url.localeCompare(b.url));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
