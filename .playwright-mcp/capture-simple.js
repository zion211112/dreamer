async (page) => {
  return await page.evaluate(() => {
    const keySelectors = [
      "header", "aside", "nav", "main", "section", "footer",
      ".studio-shell", ".studio-sidebar", ".studio-main",
      ".studio-topbar", ".studio-sidebar-heading", ".studio-sidebar-bottom",
      ".studio-mobile-drawer", "[role=banner]", "[role=navigation]", "[role=complementary]"
    ];
    const seen = new Set();
    const elements = [];
    for (const sel of keySelectors) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          const style = getComputedStyle(el);
          const tag2 = el.tagName.toLowerCase();
          const role = el.getAttribute("role");
          const id = el.id ? "#" + el.id : (tag2 + ":" + Array.from(el.parentElement?.children || []).filter(c => c.tagName === el.tagName).indexOf(el) + 1);
          elements.push({
            id,
            selector: id,
            tag: tag2,
            role,
            label: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80) || void 0,
            interactive: ["a", "button", "input", "select"].includes(tag2) || role ? true : false,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            style: {
              display: style.display,
              position: style.position,
              flexDirection: style.flexDirection,
              alignItems: style.alignItems,
              justifyContent: style.justifyContent,
              padding: {
                top: parseFloat(style.paddingTop) || 0,
                right: parseFloat(style.paddingRight) || 0,
                bottom: parseFloat(style.paddingBottom) || 0,
                left: parseFloat(style.paddingLeft) || 0
              },
              margin: {
                top: parseFloat(style.marginTop) || 0,
                right: parseFloat(style.marginRight) || 0,
                bottom: parseFloat(style.marginBottom) || 0,
                left: parseFloat(style.marginLeft) || 0
              },
              rowGap: parseFloat(style.rowGap) || 0,
              columnGap: parseFloat(style.columnGap) || 0,
              borderRadius: {
                topLeft: { horizontal: parseFloat(style.borderTopLeftRadius) || 0, vertical: parseFloat(style.borderTopLeftRadius) || 0 },
                topRight: { horizontal: parseFloat(style.borderTopRightRadius) || 0, vertical: parseFloat(style.borderTopRightRadius) || 0 },
                bottomRight: { horizontal: parseFloat(style.borderBottomRightRadius) || 0, vertical: parseFloat(style.borderBottomRightRadius) || 0 },
                bottomLeft: { horizontal: parseFloat(style.borderBottomLeftRadius) || 0, vertical: parseFloat(style.borderBottomLeftRadius) || 0 }
              },
              backgroundColor: style.backgroundColor,
              boxShadow: style.boxShadow
            }
          });
        }
      } catch(e) {}
    }
    const variable = (node, name) => getComputedStyle(node).getPropertyValue?.(name)?.trim() ?? "";
    const densityScope = [document.documentElement, document.body, document.querySelector(".ds")].find(n => Boolean(n && variable(n, "--layout-density")));
    const density = (() => {
      if (!densityScope) return void 0;
      const spacing2 = variable(densityScope, "--spacing");
      const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const amount = Number.parseFloat(spacing2);
      const unit = !Number.isFinite(amount) ? void 0 : /^[\d.]+rem$/.test(spacing2) ? amount * rootSize : /^[\d.]+px$/.test(spacing2) ? amount : void 0;
      return {
        mode: variable(densityScope, "--layout-density").slice(0, 20),
        source: variable(densityScope, "--layout-density-source").slice(0, 20) || void 0,
        unit
      };
    })();
    return {
      name: "viewport-" + window.innerWidth,
      title: document.title.trim().slice(0, 160) || void 0,
      density,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      elements
    };
  });
}
