let nodeId = 0;

export function buildTreeNodes(data, searchTerm, theme) {
  nodeId = 0;
  const nodes = [];
  const edges = [];

  const styles = getComputedStyle(document.body);
  const colors = {
    object: styles.getPropertyValue("--object-color").trim(),
    array: styles.getPropertyValue("--array-color").trim(),
    primitive: styles.getPropertyValue("--primitive-color").trim(),
  };

  buildRecursive(data, "$", null, 0, nodes, edges, searchTerm, colors);

  const levelSpacing = 160;
  const nodeSpacing = 260;
  const levelMap = {};

  nodes.forEach((n) => {
    const lvl = n.data.level;
    if (!levelMap[lvl]) levelMap[lvl] = [];
    levelMap[lvl].push(n);
  });

  Object.keys(levelMap).forEach((lvlStr) => {
    const lvl = Number(lvlStr);
    const list = levelMap[lvl];
    const startX = -((list.length - 1) * nodeSpacing) / 2;
    list.forEach((node, i) => {
      node.position = { x: startX + i * nodeSpacing, y: lvl * levelSpacing };
    });
  });

  return { nodes, edges };
}

function buildRecursive(
  value,
  path,
  parentId,
  level,
  nodes,
  edges,
  searchTerm,
  colors
) {
  const id = `${nodeId++}`;
  const type =
    typeof value === "object" && value !== null
      ? Array.isArray(value)
        ? "array"
        : "object"
      : "primitive";

  const lastSegment =
    path
      .split(/[.\[\]]/)
      .filter(Boolean)
      .pop() || "$";

  const label =
    type === "primitive"
      ? `${lastSegment}: ${String(value)}`
      : type === "array"
      ? `${lastSegment} [Array]`
      : `${lastSegment} {Object}`;

  const normPath = normalize(path);
  const normSearch = normalize(searchTerm);
  const isHighlighted =
    searchTerm &&
    (normPath === normSearch ||
      normPath.startsWith(normSearch + ".") ||
      normPath.startsWith(normSearch + "["));

  nodes.push({
    id,
    data: { label, path, type, value, level },
    style: {
      border: `2px solid ${isHighlighted ? "#ef4444" : colors[type]}`,
      backgroundColor: isHighlighted ? "var(--highlight-bg)" : "var(--node-bg)",
      color: "var(--text-color)",
      borderRadius: 8,
      padding: 8,
      minWidth: 100,
      textAlign: "center",
      boxShadow: isHighlighted
        ? "0 0 15px rgba(239, 68, 68, 0.6)"
        : "0 4px 10px rgba(0,0,0,0.08)",
      transition: "all 0.25s ease",
    },
  });

  if (parentId !== null) {
    edges.push({
      id: `e${parentId}-${id}`,
      source: parentId,
      target: id,
      animated: false,
      style: { stroke: "var(--edge-color)", strokeWidth: 1.5 },
    });
  }

  if (type === "object") {
    for (const key of Object.keys(value)) {
      buildRecursive(
        value[key],
        `${path}.${key}`,
        id,
        level + 1,
        nodes,
        edges,
        searchTerm,
        colors
      );
    }
  } else if (type === "array") {
    for (let i = 0; i < value.length; i++) {
      buildRecursive(
        value[i],
        `${path}[${i}]`,
        id,
        level + 1,
        nodes,
        edges,
        searchTerm,
        colors
      );
    }
  }
}
function normalize(p) {
  if (!p) return "";
  return p.replace(/^\$\./, "").replace(/\s+/g, "").toLowerCase();
}
