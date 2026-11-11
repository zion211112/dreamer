async (page) => {
  return await page.evaluate(() => {
    const maxElements = 1500;
    const candidates3 = Array.from(document.querySelectorAll("body *"));
    const hiddenByAncestor = (element) => {
      const visible2 = element.checkVisibility?.({
        opacityProperty: true,
        visibilityProperty: true,
        contentVisibilityAuto: true
      });
      if (visible2 !== void 0) return !visible2;
      for (let node4 = element; node4; node4 = node4.parentElement) {
        if (Number(getComputedStyle(node4).opacity) === 0) return true;
      }
      return false;
    };
    const visible = candidates3.filter((element) => {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
      if (hiddenByAncestor(element)) return false;
      if (element.parentElement?.closest("[inert]")) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0;
    }).slice(0, maxElements);
    const ids = new Map();
    const selectorFor = (element, index3) => {
      const explicit = element.getAttribute("data-bd-inspect-id");
      if (explicit) return explicit;
      if (element.id) return "#" + element.id;
      const tag2 = element.tagName.toLowerCase();
      const parent = element.parentElement;
      if (!parent) return tag2 + ":" + (index3 + 1);
      const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
      return tag2 + ":nth-of-type(" + (siblings.indexOf(element) + 1) + ")@" + (index3 + 1);
    };
    visible.forEach((element, index3) => ids.set(element, selectorFor(element, index3)));
    const number4 = (value) => {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const edges = (style, prefix) => ({
      top: number4(style[prefix + "Top"]),
      right: number4(style[prefix + "Right"]),
      bottom: number4(style[prefix + "Bottom"]),
      left: number4(style[prefix + "Left"])
    });
    const resolvedLength = (value, size) => {
      const trimmed = value.trim();
      if (!trimmed.startsWith("calc(") || !trimmed.endsWith(")")) {
        return trimmed.endsWith("%") ? number4(trimmed) * size / 100 : number4(trimmed);
      }
      const expression = trimmed.slice(5, -1).trim();
      const term = /\s*([+-]?)\s*((?:\d+(?:\.\d*)?|\.\d+))(px|%)/gy;
      let total = 0;
      let cursor = 0;
      while (cursor < expression.length) {
        term.lastIndex = cursor;
        const match2 = term.exec(expression);
        if (!match2) return 0;
        const sign5 = match2[1] === "-" ? -1 : 1;
        const amount = Number(match2[2]);
        total += sign5 * (match2[3] === "%" ? amount * size / 100 : amount);
        cursor = term.lastIndex;
      }
      return total;
    };
    const radiusComponents = (value) => {
      const parts = [];
      let depth2 = 0;
      let current2 = "";
      for (const character of value.trim()) {
        if (/\s/.test(character) && depth2 === 0) {
          if (current2) parts.push(current2);
          current2 = "";
          continue;
        }
        if (character === "(") depth2 += 1;
        if (character === ")") depth2 -= 1;
        current2 += character;
      }
      if (current2) parts.push(current2);
      return parts;
    };
    const cornerRadius = (value, rect) => {
      const [horizontal = "0", vertical = horizontal] = radiusComponents(value);
      return {
        horizontal: resolvedLength(horizontal, rect.width),
        vertical: resolvedLength(vertical, rect.height)
      };
    };
    const attribute2 = (element, name18) => element.getAttribute(name18) || void 0;
    const alignmentEdge = (value) => value === "left" || value === "right" || value === "top" || value === "bottom" || value === "center-x" || value === "center-y" ? value : void 0;
    const symmetry = (value) => value === "horizontal" || value === "vertical" || value === "both" ? value : void 0;
    const compareSize = (value) => value === "width" || value === "height" || value === "both" ? value : void 0;
    const interactiveRoles = new Set(["button", "checkbox", "combobox", "link", "menuitem", "radio", "slider", "switch", "tab"]);
    const interactiveTags = new Set(["a", "button", "input", "select", "summary", "textarea"]);
    const lineBoxes = (element) => {
      const tops = [];
      const boxes = [];
      let sawText = false;
      const walk2 = (node4) => {
        for (const child of Array.from(node4.childNodes)) {
          if (child.nodeType === 3) {
            if (!(child.textContent || "").trim()) continue;
            sawText = true;
            const range2 = document.createRange();
            range2.selectNodeContents(child);
            for (const box of Array.from(range2.getClientRects())) {
              if (box.width <= 0 || box.height <= 0) continue;
              boxes.push(box);
              if (!tops.some((top) => Math.abs(top - box.top) <= 1)) tops.push(box.top);
            }
            continue;
          }
          if (child.nodeType !== 1) continue;
          const childElement = child;
          const childStyle = getComputedStyle(childElement);
          if (childStyle.position === "absolute" || childStyle.position === "fixed") continue;
          if (childStyle.display === "none" || childStyle.visibility === "hidden") continue;
          if (childStyle.display !== "inline" && childStyle.display !== "contents") continue;
          walk2(childElement);
        }
      };
      walk2(element);
      if (!sawText || !tops.length) return void 0;
      const firstTop = Math.min(...tops);
      const firstLine = boxes.filter((box) => Math.abs(box.top - firstTop) <= 1);
      const first2 = {
        top: firstTop,
        height: Math.max(...firstLine.map((box) => box.height)),
        left: Math.min(...firstLine.map((box) => box.left)),
        right: Math.max(...firstLine.map((box) => box.right))
      };
      return { count: tops.length, first: first2 };
    };
    const context5 = document.createElement("canvas").getContext?.("2d");
    const fontMetrics = new Map();
    const measureFont = (style) => {
      const font = style.fontStyle + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
      if (!fontMetrics.has(font)) {
        let measured;
        if (context5) {
          context5.font = font;
          const capital = context5.measureText("H");
          const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent, actualBoundingBoxAscent: capHeight } = capital;
          if ([ascent, descent, capHeight].every((value) => Number.isFinite(value) && value > 0)) measured = { ascent, descent, capHeight };
        }
        fontMetrics.set(font, measured);
      }
      return fontMetrics.get(font);
    };
    const textMetrics = (style, first2) => {
      const metrics = measureFont(style);
      if (!metrics) return void 0;
      const baseline = first2.top + (first2.height - metrics.ascent - metrics.descent) / 2 + metrics.ascent;
      return { baseline, capHeight: metrics.capHeight, fontSize: number4(style.fontSize), left: first2.left, right: first2.right };
    };
    const glyphBounds = (element) => {
      if (element.tagName.toLowerCase() !== "svg") return void 0;
      const marks = Array.from(element.querySelectorAll("path, circle, ellipse, rect, line, polyline, polygon, use, text")).filter((mark) => !mark.closest("defs, clipPath, mask, symbol, pattern, marker"));
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      for (const mark of marks) {
        const box = mark.getBoundingClientRect();
        if (box.width <= 0 && box.height <= 0) continue;
        left = Math.min(left, box.left);
        top = Math.min(top, box.top);
        right = Math.max(right, box.right);
        bottom = Math.max(bottom, box.bottom);
      }
      return Number.isFinite(left) ? { x: left, y: top, width: right - left, height: bottom - bottom } : void 0;
    };
    const controlType = (element) => {
      if (element instanceof HTMLSelectElement) return element.multiple || element.size > 1 ? "select-multiple" : "select-one";
      if (element instanceof HTMLInputElement) return element.type;
      return void 0;
    };
    const elements2 = visible.map((element) => {
      const html3 = element;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const tag2 = element.tagName.toLowerCase();
      const role = attribute2(element, "role");
      const parentId = element.parentElement ? ids.get(element.parentElement) : void 0;
      const tabIndex = html3.tabIndex;
      const interactive = interactiveTags.has(tag2) || interactiveRoles.has(role || "") || tabIndex >= 0;
      const explicitLabel = attribute2(element, "data-bd-inspect-label") || attribute2(element, "aria-label");
      const shownText = tag2 === "img" ? attribute2(element, "alt") : interactive || /^h[1-6]$/.test(tag2) || role === "heading" ? element.textContent : void 0;
      const text7 = (explicitLabel || shownText || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const id = ids.get(element);
      const lines2 = lineBoxes(element);
      const reach = (edge, start, inner) => Math.max(
        inner,
        ...Array.from(element.querySelectorAll("*")).filter((node4) => !node4.closest("[inert]")).map((node4) => node4.getBoundingClientRect()[edge] - start)
      );
      const inertCrop = Array.from(element.children).some((child) => child.hasAttribute("inert")) ? {
        width: reach("right", rect.left + html3.clientLeft, html3.clientWidth),
        height: reach("bottom", rect.top + html3.clientTop, html3.clientHeight)
      } : void 0;
      return {
        id,
        selector: id,
        tag: tag2,
        role,
        label: text7 || void 0,
        parentId,
        groupId: attribute2(element, "data-bd-group"),
        alignmentGroup: attribute2(element, "data-bd-align-group"),
        alignmentEdge: alignmentEdge(attribute2(element, "data-bd-align-edge")),
        expectedSymmetry: symmetry(attribute2(element, "data-bd-symmetry")),
        compareSize: compareSize(attribute2(element, "data-bd-compare-size")),
        interactive,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        style: {
          display: style.display,
          position: style.position,
          flexDirection: style.flexDirection,
          flexWrap: style.flexWrap,
          alignItems: style.alignItems,
          alignSelf: style.alignSelf,
          justifyContent: style.justifyContent,
          textAlign: style.textAlign,
          rowGap: number4(style.rowGap),
          columnGap: number4(style.columnGap),
          padding: edges(style, "padding"),
          margin: edges(style, "margin"),
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          textOverflow: style.textOverflow,
          borderRadius: {
            topLeft: cornerRadius(style.borderTopLeftRadius, rect),
            topRight: cornerRadius(style.borderTopRightRadius, rect),
            bottomRight: cornerRadius(style.borderBottomRightRadius, rect),
            bottomLeft: cornerRadius(style.borderBottomLeftRadius, rect)
          },
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          boxShadow: style.boxShadow
        },
        lineCount: lines2?.count,
        textMetrics: lines2 && textMetrics(style, lines2.first),
        glyphBounds: glyphBounds(element),
        inputType: controlType(element),
        clientWidth: html3.clientWidth,
        clientHeight: html3.clientHeight,
        scrollWidth: html3.scrollWidth,
        scrollHeight: html3.scrollHeight,
        inertCrop
      };
    });
    const variable = (node4, name18) => getComputedStyle(node4).getPropertyValue?.(name18)?.trim() ?? "";
    const densityScope = [document.documentElement, document.body, document.querySelector(".ds")].find((node4) => Boolean(node4 && variable(node4, "--layout-density")));
    const density = (() => {
      if (!densityScope) return void 0;
      const spacing2 = variable(densityScope, "--spacing");
      const rootSize = number4(getComputedStyle(document.documentElement).fontSize) || 16;
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
      elements: elements2
    };
  });
}
