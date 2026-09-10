import csv
import io

def parse_security(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:
        event_id = int(row.get("EventID", 0))

        severity = "Info"
        if event_id in [4625, 4672]:
            severity = "High"
        elif event_id == 4624:
            severity = "Low"

        events.append({
            "Time": row.get("TimeCreated") or row.get("Time"),
            "EventID": event_id,
            "Source": "Security",
            "Process": "Login",
            "Target": row.get("TargetUserName", ""),
            "Host": row.get("Computer", ""),
            "User": row.get("TargetUserName", ""),
            "Severity": severity,
        })

    return events
