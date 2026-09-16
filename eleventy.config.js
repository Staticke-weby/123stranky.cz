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
