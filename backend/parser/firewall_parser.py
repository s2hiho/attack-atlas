import csv
import io

def parse_firewall(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:
        ip = row.get("DestinationIp", "")
        port = row.get("DestinationPort", "")

        events.append({
            "Time": row.get("Time"),
            "EventID": 5156,
            "Source": "Firewall",
            "Process": row.get("Application") or row.get("Process", ""),
            "Target": f"{ip}:{port}" if port else ip,
            "Host": row.get("Host", ""),
            "User": row.get("User", ""),
            "Severity": "Medium",
        })

    return events
