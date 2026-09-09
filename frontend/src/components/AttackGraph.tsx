import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";

// Pythonから返ってくるノード
interface RouteNode {
  id: string;
  label: string;
  process: string;
  time: string;
  event_id: number;
  severity: string;
  type: string;   
}

// Pythonから返ってくるエッジ
interface RouteEdge {
  id: string;
  source: string;
  target: string;
}

interface AttackGraphProps {
  route: {
    nodes: RouteNode[];
    edges: RouteEdge[];
  };
}

function AttackGraph({ route }: AttackGraphProps) {
  const nodes: Node[] = useMemo(() => {
  return route.nodes.map((node, index) => {
    let color = "#64748B";
  
    if (node.severity === "High") color = "#DC2626";
    else if (node.severity === "Medium") color = "#F59E0B";
    else if (node.severity === "Low") color = "#16A34A";
  
    let x = 250;
    let y = index * 120;
  
    switch (node.type) {
      case "host":
        x = 40;
        y = 250;
        break;
  
      case "process":
        x = 320;
        y = index * 130 + 40;
        break;
  
      case "dns":
        x = 620;
        y = index * 130 + 40;
        break;
  
      case "network":
        x = 900;
        y = index * 130 + 40;
        break;
  
      case "file":
        x = 900;
        y = index * 130 + 220;
        break;
    }
  
    const icon =
      node.type === "host"
        ? "🖥️"
        : node.type === "process"
        ? "⚙️"
        : node.type === "dns"
        ? "🌐"
        : node.type === "network"
        ? "📡"
        : node.type === "file"
        ? "📄"
        : "📍";
  
    return {
      id: node.id,
      position: { x, y },
      data: {
        label: (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px" }}>{icon}</div>
  
            <strong>{node.label}</strong>
  
            <br />
  
            <small>{node.time}</small>
          </div>
        ),
      },
      style: {
        border: `2px solid ${color}`,
        borderRadius: 12,
        width: 170,
        padding: 10,
        background: "#172033",
        color: "white",
      },
    };
  });
  }, [route]);


  const edges: Edge[] = useMemo(() => {
    return route.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: {
        stroke: "#60A5FA",
        strokeWidth: 2,
      },
    }));
  }, [route]);

  return (
    <div style={{ flex: 1, width: "100%"}}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background gap={20} color="#334155" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default AttackGraph;
