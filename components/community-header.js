(function attachCommunityHeader(global) {
  function renderNavItems(navItems) {
    return navItems.map(function (item) {
      var activeClass = item.active ? " active" : "";
      return '<a class="subnav-link' + activeClass + '" href="' + item.href + '">' + item.label + "</a>";
    }).join("");
  }

  global.DavinciCommunityHeader = {
    render: function renderCommunityHeader(mountNode, options) {
      if (!mountNode) {
        return;
      }

      var config = options || {};
      var navItems = Array.isArray(config.navItems) ? config.navItems : [];
      var brandHref = config.brandHref || "./community-list.html";

      mountNode.innerHTML = [
        '<header class="topbar" id="topbar">',
        '  <div class="topbar-inner">',
        '    <a href="' + brandHref + '" class="brand">',
        '      <img src="./assets/logo-2.png" alt="Davinci Space logo" class="brand-mark">',
        '      <div class="brand-copy">',
        '        <span class="brand-title">Davinci Space</span>',
        "      </div>",
        "    </a>",
        "  </div>",
        "</header>",
        '<nav class="subnav">',
        '  <div class="subnav-inner">',
        renderNavItems(navItems),
        "  </div>",
        "</nav>"
      ].join("");
    }
  };
})(window);
