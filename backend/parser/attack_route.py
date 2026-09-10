"""
Attack Route Builder v2
Host・Process・DNS・Network を枝分かれした Attack Graph に変換する。
"""
from parser.entity_extractor import extract_entities


def build_attack_route(events):

    nodes = []
    edges = []

    node_map = {}

    previous_process = None

    for event in events:

        entities = extract_entities(event)

        process_node = None

        # ---------- Node生成 ----------
        for entity in entities:

            node_id = f"{entity['type']}:{entity['value']}"

            if node_id not in node_map:

                node = {
                    "id": node_id,
                    "label": entity["value"],
                    "type": entity["type"],
                    "severity": event["Severity"],
                    "time": event["Time"],
                    "event_id": event["EventID"]
                }

                nodes.append(node)
                node_map[node_id] = node

            # Processノードを保存
            if entity["type"] == "process":
                process_node = node_id

        # ---------- Correlation ----------

        # User → Process
        user = next((e for e in entities if e["type"] == "user"), None)

        if user and process_node:

            edges.append({
                "id": f"user-{user['value']}-{process_node}",
                "source": f"user:{user['value']}",
                "target": process_node,
                "relation": "login"
            })

        # Process → Process（時系列）
        if previous_process and process_node:

            edges.append({
                "id": f"{previous_process}-{process_node}",
                "source": previous_process,
                "target": process_node,
                "relation": "spawn"
            })

        # Process → Target(IP/Domain/File)
        if process_node:

            for entity in entities:

                if entity["type"] in ["ip", "domain", "file"]:

                    edges.append({
                        "id": f"{process_node}-{entity['type']}:{entity['value']}",
                        "source": process_node,
                        "target": f"{entity['type']}:{entity['value']}",
                        "relation": entity["type"]
                    })

        if process_node:
            previous_process = process_node

    return {
        "nodes": nodes,
        "edges": edges
    }
