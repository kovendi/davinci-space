(function attachAdminSidebar(global) {
  function itemMarkup(item, activeItem) {
    var activeClass = item.label === activeItem ? " active" : "";
    return [
      '<a class="menu-item' + activeClass + '" href="' + item.href + '">',
      item.icon,
      "<span>" + item.label + "</span>",
      "</a>"
    ].join("");
  }

  function groupMarkup(group, activeItem) {
    return [
      '<div class="menu-group">',
      '<p class="menu-group-title">' + group.title + "</p>",
      group.items.map(function (item) {
        return itemMarkup(item, activeItem);
      }).join(""),
      "</div>"
    ].join("");
  }

  var groups = [
    {
      title: "Members",
      items: [
        {
          label: "Members",
          href: "./community-admin-members.html",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="4"></circle><path d="M17 11a4 4 0 0 1 0 8"></path><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path></svg>'
        },
        {
          label: "Cards",
          href: "#",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M7 10h6"></path><path d="M7 14h3"></path><circle cx="17" cy="12" r="2"></circle></svg>'
        },
        {
          label: "Badges",
          href: "./community-admin-badge-manager.html",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="m12 3 2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 15l-4.8 2.6.9-5.3L4.3 8.6l5.3-.8L12 3Z"></path></svg>'
        },
        {
          label: "Tiers",
          href: "./community-admin-tier-manager.html",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M7 17h10"></path><path d="M8 13h8"></path><path d="M9 9h6"></path><path d="M12 4v15"></path><path d="M5 20h14"></path></svg>'
        }
      ]
    },
    {
      title: "Content",
      items: [
        {
          label: "Post Categories",
          href: "#",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M4 6h16"></path><path d="M4 12h10"></path><path d="M4 18h8"></path><circle cx="18" cy="12" r="2"></circle><circle cx="15" cy="18" r="2"></circle></svg>'
        },
        {
          label: "Entrance",
          href: "#",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M4 19h16"></path><path d="M6 19V8l6-4 6 4v11"></path><path d="M9 12h6"></path></svg>'
        }
      ]
    },
    {
      title: "Commerce",
      items: [
        {
          label: "Payments",
          href: "#",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h4"></path></svg>'
        },
        {
          label: "Gate",
          href: "#",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M5 12h8"></path><path d="M11 8l4 4-4 4"></path><path d="M19 5v14"></path></svg>'
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          label: "Theme",
          href: "#",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.28.3.49.65.6 1 .07.2.09.4.09.6s-.02.4-.09.6c-.11.35-.32.7-.6 1Z"></path></svg>'
        }
      ]
    }
  ];

  global.DavinciAdminSidebar = {
    render: function renderAdminSidebar(mountNode, options) {
      if (!mountNode) {
        return;
      }

      var config = options || {};
      var activeItem = config.activeItem || "";

      mountNode.innerHTML = [
        '<aside class="panel menu-card" aria-label="Admin menu">',
        '<p class="menu-title">Administrator</p>',
        '<nav class="menu-list">',
        groups.map(function (group) {
          return groupMarkup(group, activeItem);
        }).join(""),
        "</nav>",
        "</aside>"
      ].join("");
    }
  };
})(window);
