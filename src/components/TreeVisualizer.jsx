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
const observerErrorHandler = (error) => {
  if (
    error.message &&
    error.message.includes("ResizeObserver loop completed")
  ) {
    return;
  }
  console.error(error);
};
window.addEventListener("error", observerErrorHandler);

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
    const t = setTimeout(() => {
      try {
        fitView({ padding: 0.2 });
      } catch {}
    }, 400);
    return () => clearTimeout(t);
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

  const onNodeClick = useCallback(async (_, node) => {
    try {
      await navigator.clipboard.writeText(node.data.path);
      setTooltip({
        visible: true,
        x: window.innerWidth / 2 - 60,
        y: window.innerHeight / 2 - 40,
        text: `✅ Copied: ${node.data.path}`,
      });
      setTimeout(
        () => setTooltip({ visible: false, x: 0, y: 0, text: "" }),
        1000
      );
    } catch {}
  }, []);

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
    const flowWrapper = document.querySelector(".react-flow");
    if (!flowWrapper) return alert("Tree not rendered yet");

    try {
      const rect = flowWrapper.getBoundingClientRect();
      const styleBackup = {
        width: flowWrapper.style.width,
        height: flowWrapper.style.height,
        transform: flowWrapper.style.transform,
      };

      flowWrapper.style.width = `${rect.width * 2}px`;
      flowWrapper.style.height = `${rect.height * 2}px`;
      flowWrapper.style.transform = "scale(1)";

      await new Promise((r) => setTimeout(r, 250));

      const dataUrl = await toPng(flowWrapper, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).getPropertyValue(
          "--bg-color"
        ),
      });
      Object.assign(flowWrapper.style, styleBackup);

      download(dataUrl, "json-tree.png");
    } catch (error) {
      console.error("Download failed:", error);
      alert("⚠️ Couldn't export image properly. Try again.");
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
          <Background color="var(--edge-color)" gap={20} />
          <Controls className="custom-controls" showInteractive={false} />
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
      </div>

      <button onClick={downloadImage} className="download-btn-bottom">
        Download
      </button>
    </div>
  );
}

function formatValue(v) {
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
