import csv
import io

def parse_dns(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:
        events.append({
            "Time": row.get("Time"),
            "EventID": 22,
            "Source": "DNS",
            "Process": row.get("Process", ""),
            "Target": row.get("QueryName") or row.get("Target", ""),
            "Host": row.get("Host", ""),
            "User": row.get("User", ""),
            "Severity": "Medium",
        })

    return events
