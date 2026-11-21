// Combined, locally rendered index of both public Substack publications.
(() => {
  const list = document.getElementById("blog-list");
  if (!list) return;

  const showMessage = (message) => {
    const state = document.createElement("p");
    state.className = "blog-state mono";
    state.textContent = message;
    list.replaceChildren(state);
    list.setAttribute("aria-busy", "false");
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently published";
    return new Intl.DateTimeFormat("en", {
      day: "numeric", month: "long", year: "numeric"
    }).format(date);
  };

  const makeArticleCard = (post, index) => {
    const card = document.createElement("article");
    card.className = "blog-entry";

    const content = document.createElement("div");
    content.className = "blog-entry-content";

    const meta = document.createElement("p");
    meta.className = "blog-entry-meta mono";
    meta.textContent = formatDate(post.published);

    const source = document.createElement("span");
    source.className = "blog-publication mono";
    source.textContent = post.publication;

    const heading = document.createElement("h3");
    heading.textContent = post.title;

    const summary = document.createElement("p");
    summary.className = "blog-entry-subtitle";
    summary.textContent = post.summary || "";

    const link = document.createElement("a");
    link.className = "blog-entry-link mono";
    link.href = "article.html?id=" + encodeURIComponent(post.id);
    link.textContent = "read article ↗";
    link.setAttribute("aria-label", "Read " + post.title);

    content.append(meta, source, heading);
    if (post.summary) content.append(summary);
    card.append(content, link);
    card.dataset.articleNumber = String(index + 1);
    return card;
  };

  const loadArticles = async () => {
    try {
      const response = await fetch("data/substack-posts.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Article index returned " + response.status);
      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts.slice() : [];
      posts.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));

      if (!posts.length) {
        showMessage("The publications are syncing. Please check back shortly.");
        return;
      }

      list.replaceChildren(...posts.map(makeArticleCard));
      list.setAttribute("aria-busy", "false");
    } catch (error) {
      console.error("Unable to load Substack articles:", error);
      showMessage("Articles could not be loaded right now. Please try again shortly.");
    }
  };

  loadArticles();
})();
