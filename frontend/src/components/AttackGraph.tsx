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
  //typeごとに何個目のノードか数える
  const typeCount: Record<string, number> = {};
  return route.nodes.map((node) => {
    typeCount[node.type] = (typeCount[node.type] || 0) + 1;
    const order = typeCount[node.type] - 1;
    let color = "#64748B";
    
    switch (node.type) {
      case "host":
        color = "#DC2626";
        break;
    
      case "process":
        color = "#EA580C";
        break;
    
      case "dns":
        color = "#2563EB";
        break;
    
      case "network":
        color = "#059669";
        break;
    
      case "file":
        color = "#9333EA";
        break;
    }
  
    let x = 260;
    let y = 50;
    
    switch (node.type) {
    
      case "host":
        x = 40;
        y = 280;
        break;
    
      case "process":
        x = 260;
        y = 40 + order * 120;
        break;
    
      case "dns":
        x = 520;
        y = 60 + order * 140;
        break;
    
      case "network":
        x = 800;
        y = 60 + order * 140;
        break;
    
      case "file":
        x = 800;
        y = 420 + order * 120;
        break;
    
      default:
        x = 260;
        y = 40 + order * 120;
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
        borderRadius: 14,
        padding: 10,
        width: 190,
        background: "#1E293B",
        color: "#FFFFFF",
        fontSize: 12,
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
    <div style={{ width: "100%", height: "700px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}	
      >
        <Background gap={20} color="#334155" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default AttackGraph;
