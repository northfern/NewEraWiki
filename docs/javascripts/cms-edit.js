(function () {
  "use strict";

  // Базовый путь сайта (как в mkdocs.yml site_url)
  var BASE_PATH = "/NewEraWiki";
  
  // Путь к админке CMS
  var CMS = "/NewEraWiki/admin/";

  // "replace" — заменить кнопку GitHub на CMS
  // "third"   — добавить кнопку CMS рядом
  var MODE = "replace";

  var ROUTES = [
    { prefix: ["organisations", "authory"],     collection: "authory" },
    { prefix: ["organisations", "goverments"],  collection: "goverments" },
    { prefix: ["organisations", "military"],    collection: "military" },
    { prefix: ["organisations", "parties"],     collection: "parties" },
    { prefix: ["organisations", "unions"],      collection: "unions" },
    { prefix: ["termins", "flaseologisms"],     collection: "flaseologisms" },
    { prefix: ["termins", "ideology"],          collection: "ideology" },
    { prefix: ["termins", "terms"],             collection: "terms" },
    { prefix: ["events", "occasions"],          collection: "occasions" },
    { prefix: ["events", "wars"],               collection: "wars" },
    { prefix: ["books"],                        collection: "books" },
    { prefix: ["cities"],                       collection: "cities" },
    { prefix: ["documents"],                    collection: "documents" },
    { prefix: ["personas"],                     collection: "personas" },
    { prefix: ["symbols"],                      collection: "symbols" }
  ];

  // Использовать fallback на коллекцию main для страниц из docs/
  var MAIN_FALLBACK = true;

  // Страницы, которые НЕ должны попадать в main fallback
  var EXCLUDE_FROM_MAIN = ["blog", "tags", "categories", "search", "archive", "404.html"];

  function normalizePath(pathname) {
    var path = pathname.replace(/index\.html$/i, "");

    // Убираем BASE_PATH, если он задан и присутствует в начале пути
    if (BASE_PATH) {
      var bp = BASE_PATH.replace(/\/+$/, "");
      if (bp && path.indexOf(bp) === 0) {
        path = path.slice(bp.length);
      }
    }

    // Также пробуем убрать путь из <base href>, если он есть
    var base = document.querySelector("base");
    if (base && base.href) {
      try {
        var basePath = new URL(base.href).pathname.replace(/\/+$/, "");
        if (basePath && basePath !== "" && path.indexOf(basePath) === 0) {
          path = path.slice(basePath.length);
        }
      } catch (e) {
        // ignore
      }
    }

    return path;
  }

  function getParts() {
    return normalizePath(location.pathname).split("/").filter(Boolean);
  }

  function findRoute(parts) {
    var routes = ROUTES.slice().sort(function (a, b) {
      return b.prefix.length - a.prefix.length;
    });

    for (var i = 0; i <= parts.length; i++) {
      for (var j = 0; j < routes.length; j++) {
        var prefix = routes[j].prefix;
        if (i + prefix.length > parts.length) continue;

        var ok = true;
        for (var k = 0; k < prefix.length; k++) {
          if (parts[i + k] !== prefix[k]) {
            ok = false;
            break;
          }
        }

        if (ok) {
          return {
            collection: routes[j].collection,
            index: i,
            length: prefix.length
          };
        }
      }
    }

    return null;
  }

  function isExcludedFromMain(parts) {
    for (var i = 0; i < parts.length; i++) {
      for (var j = 0; j < EXCLUDE_FROM_MAIN.length; j++) {
        if (parts[i] === EXCLUDE_FROM_MAIN[j]) return true;
      }
    }
    return false;
  }

  function getSlug(parts, route) {
    var slugParts;

    if (!route) {
      slugParts = parts;
    } else if (route.index === -1) {
      slugParts = parts;
    } else {
      slugParts = parts.slice(route.index + route.length);
    }

    if (!slugParts.length) {
      return "index"; // главная страница → docs/index.md
    }

    return slugParts
      .map(function (part) {
        try {
          return encodeURIComponent(decodeURIComponent(part));
        } catch (e) {
          return encodeURIComponent(part);
        }
      })
      .join("/");
  }

  function getButtons() {
    var edit = null;
    var view = null;

    document.querySelectorAll("a.md-content__button").forEach(function (btn) {
      var href = btn.getAttribute("href") || btn.href || "";
      if (href.indexOf("/edit/") !== -1) {
        edit = btn;
      } else if (href.indexOf("/raw/") !== -1 || href.indexOf("/blob/") !== -1) {
        view = btn;
      }
    });

    return { edit: edit, view: view };
  }

  function apply() {
    // Защита от дублирования
    if (document.querySelector("a.md-content__button[data-cms-edit]")) {
      return;
    }

    var parts = getParts();
    var route = findRoute(parts);

    // Fallback на main для страниц из docs/
    if (!route) {
      if (!MAIN_FALLBACK) return;
      if (isExcludedFromMain(parts)) return;
      route = { collection: "main", index: -1, length: 0 };
    }

    var slug = getSlug(parts, route);
    if (!slug) return;

    var buttons = getButtons();
    var baseButton = buttons.edit || buttons.view;
    if (!baseButton) return;

    var cmsBase = CMS.replace(/\/+$/, "");
    var link = cmsBase + "/#/collections/" + route.collection + "/entries/" + slug;

    if (MODE === "replace") {
      baseButton.href = link;
      baseButton.title = "Редактировать в CMS";
      baseButton.setAttribute("data-cms-edit", "1");
      return;
    }

    if (MODE === "third") {
      var btn = baseButton.cloneNode(true);
      btn.href = link;
      btn.title = "Редактировать в CMS";
      btn.setAttribute("data-cms-edit", "1");
      baseButton.parentNode.insertBefore(btn, baseButton);
    }
  }

  function safeApply() {
    if (window.requestAnimationFrame) {
      requestAnimationFrame(apply);
    } else {
      setTimeout(apply, 0);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeApply);
  } else {
    setTimeout(safeApply, 0);
  }

  if (window.document$ && typeof document$.subscribe === "function") {
    document$.subscribe(safeApply);
  }

  var originalPush = history.pushState;
  history.pushState = function () {
    originalPush.apply(this, arguments);
    setTimeout(safeApply, 50);
  };

  var originalReplace = history.replaceState;
  history.replaceState = function () {
    originalReplace.apply(this, arguments);
    setTimeout(safeApply, 50);
  };

  window.addEventListener("popstate", safeApply);
})();
