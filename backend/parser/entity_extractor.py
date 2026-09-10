import re

def extract_entities(event):
    """
    共通フォーマットイベントから Entity を抽出する。
    """

    entities = []

    # Host
    if event.get("Host"):
        entities.append({
            "type": "host",
            "value": event["Host"]
        })

    # User
    if event.get("User"):
        entities.append({
            "type": "user",
            "value": event["User"]
        })

    # Process
    if event.get("Process"):
        entities.append({
            "type": "process",
            "value": event["Process"]
        })

    target = event.get("Target", "")

    if target:

        # IPアドレス
        ip_pattern = r"(?:\\d{1,3}\\.){3}\\d{1,3}"

        if re.fullmatch(ip_pattern, target.split(":")[0]):
            entities.append({
                "type": "ip",
                "value": target
            })

        # ファイルパス
        elif "\\" in target or target.endswith(".exe"):
            entities.append({
                "type": "file",
                "value": target
            })

        # ドメイン
        elif "." in target:
            entities.append({
                "type": "domain",
                "value": target
            })

    return entities
