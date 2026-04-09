(function attachAdminContentShell(global) {
  global.DavinciAdminContentShell = {
    render: function renderAdminContentShell(mountNode, options) {
      if (!mountNode) {
        return;
      }

      var config = options || {};
      var ariaLabel = config.ariaLabel || "Admin content";
      var template = config.templateId ? document.getElementById(config.templateId) : null;

      mountNode.innerHTML = '<section class="panel content-card" aria-label="' + ariaLabel + '"></section>';

      if (!template) {
        return;
      }

      var panel = mountNode.querySelector(".content-card");
      panel.appendChild(template.content.cloneNode(true));
    }
  };
})(window);
