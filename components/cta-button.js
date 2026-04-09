(function attachCTAButton(global) {
  var STYLE_ID = "davinci-cta-button-styles";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".ui-cta-button {",
      "  appearance: none;",
      "  -webkit-appearance: none;",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  gap: 8px;",
      "  min-height: 40px;",
      "  padding: 0 var(--ui-cta-padding-x, 18px);",
      "  border: 0;",
      "  border-radius: 14px;",
      "  font-family: inherit;",
      "  font-size: 0.88rem;",
      "  font-weight: 800;",
      "  line-height: 1;",
      "  white-space: nowrap;",
      "  text-decoration: none;",
      "  vertical-align: middle;",
      "  cursor: pointer;",
      "  transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, color 140ms ease;",
      "}",
      ".ui-cta-button-icon {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  flex: 0 0 auto;",
      "}",
      ".ui-cta-button-icon svg {",
      "  width: 16px;",
      "  height: 16px;",
      "  stroke: currentColor;",
      "  stroke-width: 2;",
      "  fill: none;",
      "  stroke-linecap: round;",
      "  stroke-linejoin: round;",
      "}",
      ".ui-cta-button.is-contained {",
      "  border: 1px solid var(--brand-2);",
      "  background: var(--brand-2);",
      "  color: #fff;",
      "  box-shadow: 0 10px 24px rgba(201, 162, 79, 0.22);",
      "}",
      ".ui-cta-button.is-contained:hover {",
      "  background: var(--brand-2-dark);",
      "  border-color: var(--brand-2-dark);",
      "  box-shadow: 0 12px 26px rgba(181, 140, 52, 0.26);",
      "}",
      ".ui-cta-button.is-outlined {",
      "  border: 1px solid var(--brand-2);",
      "  background: transparent;",
      "  color: var(--ui-cta-color, var(--brand-2));",
      "  box-shadow: none;",
      "}",
      ".ui-cta-button.is-outlined:hover {",
      "  border-color: var(--brand-2-dark);",
      "  background: var(--ui-cta-hover-bg, rgba(181, 140, 52, 0.1));",
      "  color: var(--ui-cta-hover-color, var(--brand-2-dark));",
      "}",
      ".ui-cta-button.is-text {",
      "  min-height: 40px;",
      "  padding: 0 var(--ui-cta-padding-x, 18px);",
      "  border: 0;",
      "  border-radius: 14px;",
      "  background: transparent;",
      "  color: var(--ui-cta-color, var(--brand-2));",
      "  box-shadow: none;",
      "}",
      ".ui-cta-button.is-text:hover {",
      "  background: var(--ui-cta-hover-bg, rgba(201, 162, 79, 0.12));",
      "  color: var(--ui-cta-hover-color, var(--brand-2-dark));",
      "  box-shadow: none;",
      "}"
    ].join("\n");

    document.head.appendChild(style);
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderAttributes(config) {
    var attributes = [];
    var inlineStyles = [];

    if (config.id) {
      attributes.push(' id="' + escapeAttribute(config.id) + '"');
    }

    if (config.type) {
      attributes.push(' type="' + escapeAttribute(config.type) + '"');
    }

    if (config.href) {
      attributes.push(' href="' + escapeAttribute(config.href) + '"');
    }

    if (config.xPadding !== undefined && config.xPadding !== null) {
      inlineStyles.push("--ui-cta-padding-x: " + escapeAttribute(config.xPadding));
    }

    if (config.color) {
      inlineStyles.push("--ui-cta-color: " + escapeAttribute(config.color));
    }

    if (config.hoverColor) {
      inlineStyles.push("--ui-cta-hover-color: " + escapeAttribute(config.hoverColor));
    }

    if (config.hoverBackground) {
      inlineStyles.push("--ui-cta-hover-bg: " + escapeAttribute(config.hoverBackground));
    }

    if (config.attributes) {
      Object.keys(config.attributes).forEach(function (key) {
        attributes.push(" " + escapeAttribute(key) + '="' + escapeAttribute(config.attributes[key]) + '"');
      });
    }

    if (inlineStyles.length) {
      attributes.push(' style="' + inlineStyles.join("; ") + '"');
    }

    return attributes.join("");
  }

  global.DavinciCTAButton = {
    render: function renderCTAButton(options) {
      ensureStyles();

      var config = options || {};
      var label = config.label || "Action";
      var variant = config.variant || "contained";
      var extraClass = config.className ? " " + config.className : "";
      var icon = config.icon || "";
      var tag = config.tag || "a";
      var iconMarkup = icon
        ? '<span class="ui-cta-button-icon" aria-hidden="true">' + icon + "</span>"
        : "";

      return "<" + tag + ' class="ui-cta-button is-' + escapeAttribute(variant) + extraClass + '"' + renderAttributes(config) + ">" +
        iconMarkup +
        escapeAttribute(label) +
        "</" + tag + ">";
    }
  };
})(window);
