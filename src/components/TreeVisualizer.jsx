import React, { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "./TreeVisualizer.css";
import { buildTreeNodes } from "../utils/treeBuilder";
import { toPng } from "html-to-image";
import download from "downloadjs";

export default function TreeVisualizer({
  jsonData,
  searchTerm,
  highlightPath,
  theme,
}) {
  return (
    <div className="tree-container">
      <ReactFlowProvider>
        <TreeContent
          jsonData={jsonData}
          searchTerm={searchTerm}
          highlightPath={highlightPath}
          theme={theme}
        />
      </ReactFlowProvider>
    </div>
  );
}

function TreeContent({ jsonData, searchTerm, highlightPath, theme }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });
  const { fitView, setViewport } = useReactFlow();

  const { nodes, edges } = useMemo(
    () => buildTreeNodes(jsonData, searchTerm, theme),
    [jsonData, searchTerm, theme]
  );

  useEffect(() => {
    const fit = () => {
      try {
        fitView({ padding: 0.25, duration: 500 });
      } catch {}
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [jsonData, theme, fitView]);

  useEffect(() => {
    if (!highlightPath) return;
    const match = nodes.find((n) => n.data.path === highlightPath);
    if (match) {
      const x =
        -match.position.x + window.innerWidth / 2 - (match.width || 0) / 2;
      const y = -match.position.y + 200;
      setViewport({ x, y, zoom: 1.2 });
    }
  }, [highlightPath, nodes, setViewport]);

  const onNodeClick = useCallback(
    (_, node) => {
      setViewport({
        x: -node.position.x + window.innerWidth / 2,
        y: -node.position.y + 200,
        zoom: 1.2,
      });
      navigator.clipboard?.writeText(node.data.path).catch(() => {});
    },
    [setViewport]
  );

  const onNodeMouseEnter = useCallback((e, node) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      text: `${node.data.path}\nValue: ${formatValue(node.data.value)}`,
    });
  }, []);

  const onNodeMouseLeave = useCallback(
    () => setTooltip({ visible: false, x: 0, y: 0, text: "" }),
    []
  );

  const downloadImage = async () => {
    const flowCanvas = document.querySelector(".react-flow");
    if (!flowCanvas) return alert("Tree not rendered yet");
    try {
      const dataUrl = await toPng(flowCanvas, {
        cacheBust: true,
        pixelRatio: 2,
      });
      download(dataUrl, "json-tree.png");
    } catch (err) {
      console.error(err);
      alert("Failed to export image");
    }
  };

  return (
    <div className="visualizer-container">
      <div className="graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          proOptions={{ hideAttribution: true }}
          style={{ background: "var(--bg-color)" }}
        >
          <Controls showInteractive={false} />
          <Background color="var(--edge-color)" gap={20} />
        </ReactFlow>

        {tooltip.visible && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              background: "var(--tooltip-bg)",
              color: "var(--tooltip-text)",
              padding: "8px 10px",
              borderRadius: 6,
              whiteSpace: "pre-wrap",
              zIndex: 9999,
              fontSize: 12,
            }}
          >
            {tooltip.text}
          </div>
        )}

        <button onClick={downloadImage} className="download-btn-bottom">
          Download Tree
        </button>
      </div>
    </div>
  );
}

function formatValue(v) {
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
