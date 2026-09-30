import { useEffect, useMemo, useState } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";

// -----------------------------
// Backendから返ってくる型
// -----------------------------
interface RouteNode {
  id: string;
  label: string;
  process?: string;
  time: string;
  event_id: number;
  severity: string;
  type: string;
}

interface RouteEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

interface AttackGraphProps {
  route: {
    nodes: RouteNode[];
    edges: RouteEdge[];
  };
}

function AttackGraph({ route }: AttackGraphProps) {
    // クリックされたノードの詳細情報を保持する
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
    const typeCount: Record<string, number> = {};

    const columnMap: Record<string, number> = {
      user: 0,
      host: 0,
      process: 1,
      domain: 2,
      ip: 3,
      file: 4,
    };

    return route.nodes.map((node) => {
      typeCount[node.type] = (typeCount[node.type] || 0) + 1;
      const order = typeCount[node.type] - 1;

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
          background: "#1E293B",
          color: "white",
          fontSize: 12,
        },
      };
    });
  }, [route]);

  // =============================
  // Backendデータ → ReactFlow Edge
  // =============================
  const initialEdges: Edge[] = useMemo(() => {
    return route.edges.map((edge) => {
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
        id: edge.id,
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ログを再アップロードしたらGraph更新
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        background: "#020B2A",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
         onNodeClick={handleNodeClick}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} color="#223155" />

        <Controls position="bottom-left" />
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
      {/* ノード詳細パネル */}
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 260,
            background: "#0F172A",
            border: "1px solid #475569",
            borderRadius: 12,
            padding: 16,
            color: "white",
            fontSize: 13,
            zIndex: 1000,
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <strong style={{ fontSize: 14 }}>ノード詳細</strong>
            <span
              onClick={() => setSelectedNode(null)}
              style={{ cursor: "pointer", color: "#94A3B8" }}
            >
              ✕
            </span>
          </div>

          <p><strong>Label:</strong> {selectedNode.label}</p>
          <p><strong>Type:</strong> {selectedNode.type}</p>
          {selectedNode.process && (
            <p><strong>Process:</strong> {selectedNode.process}</p>
          )}
          <p><strong>Event ID:</strong> {selectedNode.event_id}</p>
          <p><strong>Severity:</strong> {selectedNode.severity}</p>
          <p><strong>Time:</strong> {selectedNode.time}</p>
        </div>
      )}
    </div>
  );
}

export default AttackGraph;
