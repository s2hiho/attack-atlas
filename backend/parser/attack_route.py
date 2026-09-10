"""
Attack Route Builder v2
Host・Process・DNS・Network を枝分かれした Attack Graph に変換する。
"""
def build_attack_route(events):
    nodes = []
    edges = []

    node_ids = set()

    # Hostノードを1つ作る
    nodes.append({
        "id": "host",
        "label": "Windows Host",
        "process": "",
        "time": "",
        "event_id": 0,
        "severity": "Info",
        "type": "host",
    })

    node_ids.add("host")

    previous_process = None

    for event in events:

        process = event.get("Process", "Unknown")
        target = event.get("Target", "")
        event_id = event.get("EventID", 0)

        # -------- ノードタイプ判定 --------
        if event["Source"] == "Security":
            node_type = "process"

        elif event["Source"] == "auth.log":
            node_type = "process"

        elif event_id == 22:
            node_type = "dns"

        elif event_id == 3:
            node_type = "network"

        elif event_id == 11:
            node_type = "file"

        else:
            node_type = "process"

        process_id = f"process-{len(node_ids)}"

        nodes.append({
            "id": process_id,
            "label": process,
            "process": process,
            "time": event["Time"],
            "event_id": event_id,
            "severity": event["Severity"],
            "type": node_type,
        })

        # Host → 最初のイベントだけ
        if previous_process is None:
            edges.append({
                "id": "host-start",
                "source": "host",
                "target": process_id,
            })

        # イベント同士を時系列で接続
        if previous_process is not None:
            edges.append({
                "id": f"{previous_process}-{process_id}",
                "source": previous_process,
                "target": process_id,
            })

        previous_process = process_id

        # Target(IP・DNS・File)ノードを追加
        if target:
            target_id = f"target-{target}"

            if target_id not in node_ids:
                target_type = "network"

                if "." in target and ":" not in target:
                    target_type = "dns"

                if "\\" in target:
                    target_type = "file"

                nodes.append({
                    "id": target_id,
                    "label": target,
                    "process": "",
                    "time": "",
                    "event_id": 0,
                    "severity": "Info",
                    "type": target_type,
                })

                node_ids.add(target_id)

            edges.append({
                "id": f"{process_id}-{target_id}",
                "source": process_id,
                "target": target_id,
            })

    return {"nodes": nodes, "edges": edges}
