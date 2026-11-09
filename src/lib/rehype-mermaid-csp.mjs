// Mermaid's SVGs rely on a <style> block and style="" attributes, and the CSP
// blocks both. This removes them. Geometry moves to SVG attributes, which the
// CSP allows. Colours and fonts come from the .mermaid-fig rules in global.css,
// so diagrams follow the theme toggle.

const GEOMETRY = new Set(["stroke-width", "stroke-dasharray", "text-anchor", "font-size"]);

function moveStyleToAttributes(props) {
  for (const declaration of String(props.style).split(";")) {
    const colon = declaration.indexOf(":");
    if (colon < 0) continue;
    const name = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    const none = (name === "fill" || name === "stroke") && value === "none";
    if (GEOMETRY.has(name) || none) props[name] = value;
  }
  delete props.style;
}

function clean(node) {
  node.children = node.children.filter((c) => c.tagName !== "style");
  for (const child of node.children) {
    if (child.type !== "element") continue;
    if ("style" in child.properties) moveStyleToAttributes(child.properties);
    clean(child);
  }
}

function fixSize(svg) {
  const [, , width, height] = String(svg.properties.viewBox).split(/\s+/).map(Number);
  svg.properties.width = Math.ceil(width);
  svg.properties.height = Math.ceil(height);
  delete svg.properties.style;
}

function wrapDiagrams(parent) {
  parent.children = parent.children.map((node) => {
    if (node.type !== "element") return node;
    if (node.tagName !== "svg" || !String(node.properties.id).startsWith("mermaid-")) {
      wrapDiagrams(node);
      return node;
    }
    fixSize(node);
    clean(node);
    // tabindex: wide diagrams scroll sideways, and keyboards need to reach that.
    return {
      type: "element",
      tagName: "figure",
      properties: { className: ["mermaid-fig"], tabIndex: 0 },
      children: [node],
    };
  });
}

export default function rehypeMermaidCsp() {
  return wrapDiagrams;
}
