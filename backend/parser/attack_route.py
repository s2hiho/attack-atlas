"""
Attack Route Builder v2
Host・Process・DNS・Network を枝分かれした Attack Graph に変換する。
"""
def build_attack_route(events):
    nodes = []
    edges = []
    node_map = {}
    edge_count = 0

    # Windowsホストを最初に追加
    host_id = "host"
    nodes.append({
        "id": host_id,
        "label": "Windows Host",
        "process": "",
        "time": "",
        "event_id": 0,
        "severity": "Info",
        "type": "host",
    })

    for event in events:
        process = event.get("Process", "Unknown")
        target = event.get("Target", "")
        source = event.get("Source", "")
        event_id = int(event.get("EventID", 0))
        time = event.get("Time", "")
        severity = event.get("Severity", "Info")

        # Processノード
        process_id = f"process-{process}"
        if process_id not in node_map:
            node_map[process_id] = True
            nodes.append({
                "id": process_id,
                "label": process,
                "process": process,
                "time": time,
                "event_id": event_id,
                "severity": severity,
                "type": "process",
            })

            edges.append({
                "id": f"e{edge_count}",
                "source": host_id,
                "target": process_id,
            })
            edge_count += 1

        # DNSノード
        if source == "DNS":
            dns_id = f"dns-{target}"
            if dns_id not in node_map:
                node_map[dns_id] = True
                nodes.append({
                    "id": dns_id,
                    "label": target,
                    "process": process,
                    "time": time,
                    "event_id": event_id,
                    "severity": severity,
                    "type": "dns",
                })

            edges.append({
                "id": f"e{edge_count}",
                "source": process_id,
                "target": dns_id,
            })
            edge_count += 1

        # Firewall / Networkノード
        elif source == "Firewall":
            network_id = f"net-{target}"
            if network_id not in node_map:
                node_map[network_id] = True
                nodes.append({
                    "id": network_id,
                    "label": target,
                    "process": process,
                    "time": time,
                    "event_id": event_id,
                    "severity": severity,
                    "type": "network",
                })

            edges.append({
                "id": f"e{edge_count}",
                "source": process_id,
                "target": network_id,
            })
            edge_count += 1

        # File Create
        elif event_id == 11:
            file_id = f"file-{target}"
            if file_id not in node_map:
                node_map[file_id] = True
                nodes.append({
                    "id": file_id,
                    "label": target.split("\\")[-1],
                    "process": process,
                    "time": time,
                    "event_id": event_id,
                    "severity": severity,
                    "type": "file",
                })

            edges.append({
                "id": f"e{edge_count}",
                "source": process_id,
                "target": file_id,
            })
            edge_count += 1

    return {
        "nodes": nodes,
        "edges": edges,
    }
