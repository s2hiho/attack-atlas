"""
Attack Route Builder

CSVイベントから
React Flow用の nodes / edges を生成する。
"""

def build_attack_route(events):
    nodes = []
    edges = []

    # EventIDを攻撃カテゴリへ変換する辞書
    event_types = {
        1: "Process Create",
        3: "Network Connection",
        11: "File Create",
        22: "DNS Query",
        4688: "Process Create",
    }

    # Severity辞書
    severity = {
        1: "High",
        4688: "High",
        3: "Medium",
        22: "Medium",
        11: "Low",
    }

    # ノードを作る
    for index, event in enumerate(events):
        event_id = int(event["EventID"])

        nodes.append({
            "id": str(index),

            "label": event_types.get(event_id, "Unknown"),

            "process": event["Process"],

            "time": event["Time"],

            "event_id": event_id,

            "severity": severity.get(event_id, "Info"),
        })

    # 時系列順に線を引く
    for index in range(len(nodes) - 1):
        edges.append({
            "id": f"e{index}-{index+1}",
            "source": str(index),
            "target": str(index + 1),
        })

    return {
        "nodes": nodes,
        "edges": edges,
    }
