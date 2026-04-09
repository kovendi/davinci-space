(function attachUserCard(global) {
  var ICONS = {
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-3.5 7-10V5l-7-2-7 2v6c0 6.5 7 10 7 10Z"></path><path d="M9.5 12.5l1.8 1.8 3.7-4"></path></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 2.4 5 5.6.8-4 3.9.9 5.6-4.9-2.7-4.9 2.7.9-5.6-4-3.9 5.6-.8L12 4Z"></path></svg>',
    crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h14"></path><path d="m6 9 3 3 3-6 3 6 3-3 1 9H5l1-9Z"></path></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V16l10.6-10.6a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3L8 20H4Z"></path><path d="M13.5 6.5l4 4"></path></svg>'
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderBadge(item) {
    var config = item || {};
    var variantClass = config.variant === "accent" ? " is-accent" : "";
    var body = "";

    if (config.text) {
      variantClass += " is-text";
      body = escapeHtml(config.text);
    } else if (config.icon) {
      body = config.icon;
    } else if (config.iconName && ICONS[config.iconName]) {
      body = ICONS[config.iconName];
    }

    return '<span class="davinci-user-card-badge' + variantClass + '" title="' + escapeHtml(config.label || "") + '" aria-label="' + escapeHtml(config.label || "") + '">' + body + "</span>";
  }

  function renderMeta(metaItems) {
    if (!Array.isArray(metaItems) || !metaItems.length) {
      return "";
    }

    return '<div class="davinci-user-card-meta">' + metaItems.map(function (item) {
      return "<div><strong>" + escapeHtml(item.label || "") + "</strong><span>" + escapeHtml(item.value || "") + "</span></div>";
    }).join("") + "</div>";
  }

  global.DavinciUserCard = {
    icons: ICONS,
    render: function renderUserCard(options) {
      var config = options || {};
      var image = config.image || "./assets/membership-1.png";
      var alt = config.alt || "User card";
      var width = config.width || "190px";
      var badgeItems = Array.isArray(config.badges) ? config.badges : [];
      var className = config.className ? " " + config.className : "";
      var style = '--davinci-user-card-width: ' + escapeHtml(width) + ';';

      return [
        '<div class="davinci-user-card' + className + '" style="' + style + '">',
        '  <div class="davinci-user-card-media">',
        '    <img class="davinci-user-card-image" src="' + escapeHtml(image) + '" alt="' + escapeHtml(alt) + '">',
        badgeItems.length ? '    <div class="davinci-user-card-stack">' + badgeItems.map(renderBadge).join("") + "</div>" : "",
        "  </div>",
        renderMeta(config.meta),
        "</div>"
      ].join("");
    }
  };
})(window);
