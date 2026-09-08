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

        let x = 240;
        let y = 120;
        
        switch (node.type) {
          case "host":
            x = 20;
            y = 150;
            break;
        
          case "process":
            x = 260;
            y = 20;
            break;
        
          case "dns":
            x = 260;
            y = 150;
            break;
        
          case "network":
            x = 520;
            y = 20;
            break;
        
          case "file":
            x = 520;
            y = 180;
            break;
        
          default:
            x = 260;
            y = 260;
        }
        
      return {
        id: node.id,
        position: { x, y },

        data: {
          label: (
            <div style={{ textAlign: "center" }}>
              <strong>{node.label}</strong>
              <br />
              <small>{node.process}</small>
              <br />
              {node.time}
            </div>
          ),
        },

        style: {
          border: `2px solid ${color}`,
          borderRadius: 12,
          padding: 8,
          width: 160,
          background: "#1E293B",
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
    <div style={{ width: "100%", height: "450px" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background gap={20} color="#334155" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default AttackGraph;
