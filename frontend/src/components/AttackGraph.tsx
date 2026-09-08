import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

// AttackGraph が受け取るデータの型
interface AttackGraphProps {
  events: any[];
}

function AttackGraph({ events }: AttackGraphProps) {
  /*
    CSVのイベント一覧(events)をReact Flowのノード(nodes)へ変換する。
    今回は時系列順に横へ並べるだけ。
  */
  const nodes: Node[] = useMemo(() => {
    return events.map((event, index) => ({
      id: String(index),

      // ノードの中に表示する内容
      data: {
        label: (
          <div>
            <strong>{event.Process}</strong>
            <br />
            <small>{event.Time}</small>
            <br />
            EventID: {event.EventID}
          </div>
        ),
      },

      // 横方向に並べる（Google Mapsのルートのように）
      position: {
        x: index * 220,
        y: 100,
      },

      type: "default",
    }));
  }, [events]);

  /*
    ノード同士を順番につなぐ線（エッジ）を作る。
    Event1 → Event2 → Event3 ...
  */
  const edges: Edge[] = useMemo(() => {
    return events.slice(1).map((_, index) => ({
      id: `e${index}-${index + 1}`,
      source: String(index),
      target: String(index + 1),
      animated: true,
    }));
  }, [events]);

  return (
    <div style={{ width: "100%", height: "420px" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        {/* Google Mapsの背景っぽいグリッド */}
        <Background gap={20} />

        {/* ズーム・パンのコントロール */}
        <Controls />

        {/* 左下のミニマップ */}
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default AttackGraph;
