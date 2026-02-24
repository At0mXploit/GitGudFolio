const fs = require("fs");
const express = require("express");
const { updateHTML } = require("./populate");
const { populateCSS, populateConfig } = require("./build");
const { updateCommand } = require("./update");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.set("views", __dirname + "/views");
app.use(
  express.json({
    limit: "50mb"
  })
);
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true
  })
);
const port = 3000;
const jsdom = require("jsdom").JSDOM,
  options = {
    resources: "usable"
  };
global.DOMParser = new jsdom().window.DOMParser;
const { getBlog, getConfig, outDir } = require("./utils");
const MarkdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItDeflist = require("markdown-it-deflist");
const markdownItTaskLists = require("markdown-it-task-lists");
const markdownItEmoji = require("markdown-it-emoji");
const markdownItMultimdTable = require("markdown-it-multimd-table"); // v3.x CJS-compatible
const markdownItKatex = require("@traptitech/markdown-it-katex");
const markdownParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
  .use(markdownItFootnote)
  .use(markdownItDeflist)
  .use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true })
  .use(markdownItEmoji.full)
  .use(markdownItMultimdTable)
  .use(markdownItKatex);
function normalizeImageExtension(ext) {
  if (!ext || typeof ext !== "string") {
    return null;
  }
  const normalized = ext.toLowerCase() === "jpeg" ? "jpg" : ext.toLowerCase();
  const safeExt = normalized.replace(/[^a-z0-9]/g, "");
  return safeExt || null;
}
function getImageDataFromDataUri(value) {
  if (typeof value !== "string") {
    return null;
  }
  const match = value.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }
  const ext = normalizeImageExtension(match[1]);
  if (!ext) {
    return null;
  }
  return {
    ext,
    base64: match[2]
  };
}
function parseMarkdownToHtml(input) {
  return markdownParser.render(String(input || ""));
}
function createBlog(title, subtitle, folder, topImage, images, content, giscusConfig) {
  if (!fs.existsSync(`${outDir}/blog/`)) {
    fs.mkdirSync(
      `${outDir}/blog/`,
      {
        recursive: true
      },
      err => {}
    );
  }
  if (!fs.existsSync(`${outDir}/blog/${folder}`)) {
    fs.mkdirSync(`${outDir}/blog/${folder}`, {
      recursive: true
    });
  }
  fs.copyFile(
    `${__dirname}/assets/blog/blogTemplate.html`,
    `${outDir}/blog/${folder}/index.html`,
    err => {
      if (err) throw err;
      jsdom
        .fromFile(`${outDir}/blog/${folder}/index.html`, options)
        .then(function(dom) {
          let window = dom.window,
            document = window.document;
          let style = document.createElement("link");
          style.setAttribute("rel", "stylesheet");
          style.setAttribute("href", "../../index.css");
          document.getElementsByTagName("head")[0].appendChild(style);
          document.getElementsByTagName("title")[0].textContent = title;
          document.getElementById("blog_title").textContent = title;
          document.getElementById("blog_sub_title").textContent = subtitle;
          const topImageData = getImageDataFromDataUri(topImage);
          if (topImageData) {
            document.getElementById(
              "background"
            ).style.background = `url('top_image.${topImageData.ext}') center center`;
          }
          if (content != null) {
            var parser = new DOMParser();
            content = parser.parseFromString(content, "text/html");
            const paragraphs = content.getElementsByTagName("p");
            Array.from(paragraphs).forEach(paragraph => {
              const markdownHtml = parseMarkdownToHtml(paragraph.textContent);
              const markdownContainer = content.createElement("div");
              markdownContainer.innerHTML = markdownHtml;
              while (markdownContainer.firstChild) {
                paragraph.parentNode.insertBefore(
                  markdownContainer.firstChild,
                  paragraph
                );
              }
              paragraph.parentNode.removeChild(paragraph);
            });
            document.getElementById("blog").innerHTML = content.body
              ? content.body.innerHTML
              : content.documentElement.innerHTML;
          }
          images = JSON.parse(images || "[]");
          if (!Array.isArray(images)) {
            images = [];
          }
          images.forEach((item, index) => {
            const imageData = getImageDataFromDataUri(item);
            if (!imageData) {
              return;
            }
            fs.writeFile(
              `${outDir}/blog/${folder}/img_${index}.${imageData.ext}`,
              imageData.base64,
              {
                encoding: "base64"
              },
              function(err) {
                if (err) throw err;
              }
            );
          });
          if (
            giscusConfig &&
            giscusConfig.repo &&
            giscusConfig.repoId
          ) {
            const commentsSection = document.getElementById("giscus_comments");
            if (commentsSection) {
              const script = document.createElement("script");
              script.setAttribute("src", "https://giscus.app/client.js");
              script.setAttribute("data-repo", giscusConfig.repo);
              script.setAttribute("data-repo-id", giscusConfig.repoId);
              script.setAttribute("data-category", giscusConfig.category || "General");
              script.setAttribute("data-category-id", giscusConfig.categoryId || "");
              script.setAttribute("data-mapping", "pathname");
              script.setAttribute("data-strict", "0");
              script.setAttribute("data-reactions-enabled", giscusConfig.reactions !== false ? "1" : "0");
              script.setAttribute("data-emit-metadata", "0");
              script.setAttribute("data-input-position", giscusConfig.inputPosition || "bottom");
              script.setAttribute("data-theme", giscusConfig.theme || "preferred_color_scheme");
              script.setAttribute("data-lang", "en");
              script.setAttribute("crossorigin", "anonymous");
              script.setAttribute("async", "");
              commentsSection.appendChild(script);
            }
          }

          fs.writeFile(
            `${outDir}/blog/${folder}/index.html`,
            "<!DOCTYPE html>" + window.document.documentElement.outerHTML,
            async function(error) {
              if (error) throw error;
              const resolvedTopImageData = getImageDataFromDataUri(topImage);
              if (resolvedTopImageData) {
                fs.writeFile(
                  `${outDir}/blog/${folder}/top_image.${resolvedTopImageData.ext}`,
                  resolvedTopImageData.base64,
                  {
                    encoding: "base64"
                  },
                  function(err) {
                    if (err) throw err;
                  }
                );
              }
              let blog_data = {
                url_title: folder,
                title: title,
                sub_title: subtitle,
                top_image: resolvedTopImageData
                  ? `top_image.${resolvedTopImageData.ext}`
                  : "",
                visible: true
              };
              const old_blogs = await getBlog();
              old_blogs.push(blog_data);
              fs.writeFile(
                `${outDir}/blog.json`,
                JSON.stringify(old_blogs, null, " "),
                function(err) {
                  if (err) throw err;
                  console.log(
                    `Blog created successfully at ${outDir}\\blog\\${folder}\n`
                  );
                }
              );
            }
          );
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  );
}
function uiCommand() {
  app.get("/", function(req, res) {
    res.render("index.ejs");
  });
  app.get("/update", function(req, res) {
    if (!fs.existsSync(`${outDir}/config.json`)) {
      return res.send(
        'You need to run build command before using update<br><a href="/">Go Back</a>'
      );
    }
    updateCommand();
    res.redirect("/");
  });
  app.post("/build", function(req, res) {
    let username = req.body.username;
    if (!username) {
      return res.send("username can't be empty");
    }
    let sort = req.body.sort ? req.body.sort : "created";
    let order = req.body.order ? req.body.order : "asc";
    let includeFork = req.body.fork == "true" ? true : false;
    let types = ["owner"];
    let twitter = req.body.twitter ? req.body.twitter : null;
    let linkedin = req.body.linkedin ? req.body.linkedin : null;
    let medium = req.body.medium ? req.body.medium : null;
    let dribbble = req.body.dribbble ? req.body.dribbble : null;
    let background = req.body.background
      ? req.body.background
      : "https://images.unsplash.com/photo-1553748024-d1b27fb3f960?w=1500&q=80";
    let theme = req.body.theme == "on" ? "dark" : "light";
    let limit = req.body.limit ? parseInt(req.body.limit, 10) : null;
    let repos = req.body.repos
      ? req.body.repos.split(",").map(r => r.trim()).filter(Boolean)
      : null;

    const toArray = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
    const socialLabels = toArray(req.body.social_label);
    const socialUrls = toArray(req.body.social_url);
    const customSocials = socialLabels
      .map((label, i) => ({ label: label.trim(), url: (socialUrls[i] || "").trim() }))
      .filter(s => s.label && s.url);

    const friendNames = toArray(req.body.friend_name);
    const friendUrls = toArray(req.body.friend_url);
    const friendBios = toArray(req.body.friend_bio);
    const friends = friendNames
      .map((name, i) => ({
        name: name.trim(),
        url: (friendUrls[i] || "").trim(),
        bio: (friendBios[i] || "").trim() || null
      }))
      .filter(f => f.name && f.url);

    const opts = {
      sort: sort,
      order: order,
      includeFork: includeFork,
      types,
      twitter: twitter,
      linkedin: linkedin,
      medium: medium,
      dribbble: dribbble,
      limit: limit || null,
      repos: repos && repos.length ? repos : null,
      customSocials,
      friends,
      giscusEnabled: req.body.giscus_enabled === "true",
      giscusRepo: req.body.giscus_repo || null,
      giscusRepoId: req.body.giscus_repo_id || null,
      giscusCategory: req.body.giscus_category || null,
      giscusCategoryId: req.body.giscus_category_id || null,
      giscusTheme: req.body.giscus_theme || "preferred_color_scheme",
      giscusReactions: true,
      giscusInputPosition: "bottom"
    };
    updateHTML(username, opts);
    populateCSS({
      background: background,
      theme: theme
    });
    populateConfig(opts);
    res.redirect("/");
  });
  app.get("/blog", function(req, res) {
    if (!fs.existsSync(`${outDir}/config.json`)) {
      return res.send(
        'You need to run build command before accessing blogs<br><a href="/">Go Back</a>'
      );
    }
    fs.readFile(`${outDir}/config.json`, function(err, data) {
      const config = JSON.parse(data);
      const cfg = config[0] || {};
      const giscus = {
        configured: !!cfg.giscusRepo,
        enabled: cfg.giscusEnabled !== false && !!cfg.giscusRepo,
        repo: cfg.giscusRepo || "",
        repoId: cfg.giscusRepoId || "",
        category: cfg.giscusCategory || "",
        categoryId: cfg.giscusCategoryId || "",
        theme: cfg.giscusTheme || "preferred_color_scheme",
        reactions: cfg.giscusReactions !== false,
        inputPosition: cfg.giscusInputPosition || "bottom"
      };
      res.render("blog.ejs", { profile: config, giscus });
    });
  });
  app.post("/createBlog", function(req, res) {
    let title = req.body.title;
    let subtitle = req.body.subtitle;
    let content = req.body.content ? req.body.content : null;
    if (!title) {
      return res.send("title can't be empty");
    }
    if (!subtitle) {
      return res.send("subtitle can't be empty");
    }
    if (!content) {
      return res.send("something isn't working fine, try again :p");
    }
    let folder = title.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "-");
    let topImage = req.body.top_image;
    if (!getImageDataFromDataUri(topImage)) {
      return res.send("top image is required");
    }
    let images = req.body.images || "[]";
    let giscusConfig = null;
    if (req.body.comments_enabled === "true" && req.body.giscus_repo) {
      giscusConfig = {
        repo: req.body.giscus_repo,
        repoId: req.body.giscus_repo_id || "",
        category: req.body.giscus_category || "General",
        categoryId: req.body.giscus_category_id || "",
        theme: req.body.giscus_theme || "preferred_color_scheme",
        reactions: req.body.giscus_reactions !== "false",
        inputPosition: req.body.giscus_input_position || "bottom"
      };
    }
    createBlog(title, subtitle, folder, topImage, images, content, giscusConfig);
    res.redirect("/blog");
  });
  console.log("\nStarting...");
  app.listen(port);
  console.log(
    `The GUI is running on port ${port}, Navigate to http://localhost:${port} in your browser\n`
  );
}
module.exports = {
  uiCommand
};