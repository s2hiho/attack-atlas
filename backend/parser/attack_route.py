"""
Attack Route Builder v2
Host・Process・DNS・Network を枝分かれした Attack Graph に変換する。
"""

def build_attack_route(events):

    nodes = []
    edges = []

    host_id = "host"

    # Hostノード（1台だけ仮定）
    nodes.append({
        "id": host_id,
        "type": "host",
        "label": "Windows Host",
        "severity": "Info",
    })

    for index, event in enumerate(events):

        event_id = int(event["EventID"])
        node_id = f"event-{index}"

        # イベント種類判定
        if event_id in [1, 4688]:
            category = "process"
            label = event["Process"]

        elif event_id == 22:
            category = "dns"
            label = event["Process"]

        elif event_id == 3:
            category = "network"
            label = event["Process"]

        elif event_id == 11:
            category = "file"
            label = event["Process"]

        else:
            category = "other"
            label = event["Process"]

        severity = {
            "process": "High",
            "dns": "Medium",
            "network": "Medium",
            "file": "Low",
            "other": "Info",
        }[category]

        nodes.append({
            "id": node_id,
            "type": category,
            "label": label,
            "severity": severity,
            "time": event["Time"],
            "event_id": event_id,
        })

        # Host → Event
        edges.append({
            "id": f"{host_id}-{node_id}",
            "source": host_id,
            "target": node_id,
        })

    return {
        "nodes": nodes,
        "edges": edges,
    }
