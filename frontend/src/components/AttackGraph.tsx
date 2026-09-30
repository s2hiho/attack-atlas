import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import type { RouteNode, UploadData } from "../types";

interface AttackGraphProps {
  route: UploadData["route"];
}

function AttackGraph({ route }: AttackGraphProps) {
    // クリックされたノードの詳細情報を保持する
  const [height, setHeight] = useState(520);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<RouteNode | null>(null);

  // ノードがクリックされたときの処理
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    const detail = route.nodes.find((n) => n.id === node.id);
    if (detail) setSelectedNode(detail);
  };
  // =============================
  // Backendデータ → ReactFlow Node
  // =============================
  const initialNodes: Node[] = useMemo(() => {
    const columnCount: Record<number, number> = {};

    const columnMap: Record<string, number> = {
      user: 0,
      host: 0,
      process: 1,
      domain: 2,
      ip: 3,
      file: 4,
    };

    return route.nodes.map((node) => {
      const column = columnMap[node.type] ?? 1;
      const order = columnCount[column] ?? 0;
      columnCount[column] = order + 1;

      const COLUMN_GAP = 340; // 横の間隔
      const ROW_GAP = 160;    // 縦の間隔
      
      const x = (columnMap[node.type] ?? 1) * COLUMN_GAP + 60;
      const y = order * ROW_GAP + 80;

      let color = "#64748B";
      let icon = "📍";

      switch (node.type) {
        case "host":
          color = "#DC2626";
          icon = "🖥️";
          break;

        case "user":
          color = "#F59E0B";
          icon = "👤";
          break;

        case "process":
          color = "#EA580C";
          icon = "⚙️";
          break;

        case "domain":
          color = "#2563EB";
          icon = "🌐";
          break;

        case "ip":
          color = "#059669";
          icon = "📡";
          break;

        case "file":
          color = "#9333EA";
          icon = "📄";
          break;
      }

      return {
        id: node.id,
        position: { x, y },
        targetPosition: Position.Left,   // ← 左から受ける
        sourcePosition: Position.Right,  // ← 右へ出す

        draggable: true,
        data: {
          label: (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{icon}</div>

              <strong>{node.label}</strong>

              <br />

              <small>{node.time}</small>
            </div>
          ),
        },
        style: {
          border: `2px solid ${color}`,
          borderRadius: 14,
          padding: 10,
          width: 190,
          background: "#fffaf1",
          color: "#4b3621",
          fontSize: 12,
          overflowWrap: "anywhere",
        },
      };
    });
  }, [route]);

  // =============================
  // Backendデータ → ReactFlow Edge
  // =============================
  const initialEdges: Edge[] = useMemo(() => {
    return route.edges.map((edge, index) => {
      let stroke = "#64748B";

      switch (edge.relation) {
        case "login":
          stroke = "#FACC15"; // 黄
          break;

        case "spawn":
          stroke = "#EF4444"; // 赤
          break;

        case "domain":
          stroke = "#3B82F6"; // 青
          break;

        case "ip":
          stroke = "#10B981"; // 緑
          break;

        case "file":
          stroke = "#A855F7"; // 紫
          break;
      }

      return {
        id: edge.id + ":" + index,
        source: edge.source,
        target: edge.target,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          stroke,
          strokeWidth: 2.5,
        },
      };
    });
  }, [route]);

  // ReactFlow State
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // App remounts this component after each successful upload.
  return (
    <>
      <div className="graph-toolbar">
        <button onClick={() => void flow?.fitView({ padding: 0.18, minZoom: 0.01, duration: 250 })} disabled={!flow}>全体を表示</button>
        <label htmlFor="graph-height">グラフの高さ</label>
        <input id="graph-height" type="range" min="320" max="900" step="20" value={height} onChange={e => setHeight(Number(e.target.value))} />
        <output htmlFor="graph-height">{height} px</output>
      </div>
      <p className="hint">ノードを選択すると詳細を表示します。ドラッグで移動、ホイールで拡大・縮小できます。</p>
      <div className="graph-surface" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
         onNodeClick={handleNodeClick}
        onInit={setFlow}
        fitView
        minZoom={0.01}
        fitViewOptions={{ padding: 0.18, minZoom: 0.01 }}
        deleteKeyCode={null}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} color="#d8b98a" />

        <Controls position="bottom-left" showInteractive={false} fitViewOptions={{ padding: 0.18, minZoom: 0.01 }} />
        {/* 右下のミニマップ */}
        <MiniMap
          position="bottom-right"
          zoomable
          pannable
          nodeColor={(node) => {
            switch (node.id.split(":")[0]) {
              case "user":
                return "#F59E0B";
              case "host":
                return "#DC2626";
              case "process":
                return "#EA580C";
              case "domain":
                return "#2563EB";
              case "ip":
                return "#10B981";
              case "file":
                return "#9333EA";
              default:
                return "#64748B";
            }
          }}
        />
      </ReactFlow>
      </div>
      {selectedNode && (
        <aside className="node-detail" aria-label="ノード詳細">
          <div className="section-heading">
            <h3>ノード詳細</h3>
            <button onClick={() => setSelectedNode(null)} aria-label="ノード詳細を閉じる">閉じる ✕</button>
          </div>
          <dl className="detail-fields">
            <div><dt>ラベル</dt><dd>{selectedNode.label}</dd></div>
            <div><dt>種別</dt><dd>{selectedNode.type}</dd></div>
            {selectedNode.process && <div><dt>プロセス</dt><dd>{selectedNode.process}</dd></div>}
            <div><dt>イベントID</dt><dd>{selectedNode.event_id}</dd></div>
            <div><dt>重要度</dt><dd>{selectedNode.severity}</dd></div>
            <div><dt>時刻</dt><dd>{selectedNode.time}</dd></div>
          </dl>
        </aside>
      )}
    </>
  );
}
export default AttackGraph;
