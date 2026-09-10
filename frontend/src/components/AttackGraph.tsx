import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
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

      const x = (columnMap[node.type] ?? 1) * 260 + 40;
      const y = order * 120 + 40;

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
        height: "800px",
        background: "#020B2A",
        borderRadius: "16px",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
      >
        <Background gap={22} color="#223155" />

        <Controls />

        <MiniMap
          nodeColor={(node) => {
            switch (node.id.split(":")[0]) {
              case "host":
                return "#DC2626";
              case "user":
                return "#F59E0B";
              case "process":
                return "#EA580C";
              case "domain":
                return "#2563EB";
              case "ip":
                return "#10B981";
              case "file":
                return "#A855F7";
              default:
                return "#64748B";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default AttackGraph;
