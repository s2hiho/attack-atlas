import csv
import io

def parse_firewall(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:
        ip = row.get("DestinationIp", "")
        port = row.get("DestinationPort", "")
        action = row.get("Action", "")

        target = f"{ip}:{port}" if port else ip

        severity = "Medium"
        if action.upper() == "BLOCK":
            severity = "Low"

        events.append({
            "Time": row.get("Time"),
            "EventID": 5156,
            "Source": "Firewall",
            "LogType": "Firewall",
            "Process": row.get("Application") or row.get("Process", ""),
            "Target": target,
            "Host": row.get("Host", ""),
            "User": row.get("User", ""),
            "Severity": severity,
        })

    return events
