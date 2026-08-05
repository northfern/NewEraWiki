(function () {
  var CMS = "/NewEraWiki/admin/";          
  var SECTIONS = {                          
    books: "books", characters: "characters", cities: "cities",
    documents: "documents", events: "events", organisations: "organisations",
    symbols: "symbols", termins: "termins"
    // news: "news"
  };
  var MODE = "replace";                     // "replace" | "third"

  function apply() {
    var parts = location.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    var i = parts.findIndex(function (p) { return SECTIONS[p]; });
    if (i === -1) return;                                   
    var slug = parts.slice(i + 1).join("/");                
    if (!slug) return;                                      

    var edit = null, view = null;
    document.querySelectorAll("a.md-content__button").forEach(function (b) {
      var href = b.getAttribute("href") || "";
      if (href.indexOf("/edit/") !== -1) edit = b;          
      else if (href.indexOf("/blob/") !== -1) view = b;     
    });
    if (!edit && !view) return;

    var link = CMS + "#/edit/" + SECTIONS[parts[i]] + "/" + slug;
    if (MODE === "replace" && edit) {
      edit.href = link;
      edit.title = "Редактировать в CMS";
    } else if (MODE === "third") {
      var base = edit || view;
      var btn = base.cloneNode(true);
      btn.href = link;
      btn.title = "Редактировать в CMS";
      base.parentNode.insertBefore(btn, base);
    }
  }

  document.addEventListener("DOMContentLoaded", apply);

  var push = history.pushState;
  history.pushState = function () { push.apply(this, arguments); setTimeout(apply, 50); };
})();
