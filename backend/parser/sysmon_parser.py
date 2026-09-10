import csv
import io

def parse_sysmon(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:
        event_id = int(row.get("EventID", 0))

        severity = "Info"
        if event_id in [1, 4688]:
            severity = "High"
        elif event_id in [3, 22]:
            severity = "Medium"
        elif event_id == 11:
            severity = "Low"

        events.append({
            "Time": row.get("Time") or row.get("UtcTime"),
            "EventID": event_id,
            "Source": "Sysmon",
            "Process": row.get("Process") or row.get("Image", ""),
            "Target": row.get("Target", ""),
            "Host": row.get("Host") or row.get("Computer", ""),
            "User": row.get("User", ""),
            "Severity": severity,
        })

    return events
