import csv
import io

def parse_security(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:
        event_id = int(row.get("EventID", 0))

        severity = "Info"
        process = "Security Event"
        target = ""

        if event_id == 4625:
            severity = "High"
            process = "Failed Login"
            target = row.get("IpAddress", "")

        elif event_id == 4624:
            severity = "Low"
            process = "Successful Login"
            target = row.get("IpAddress", "")

        elif event_id == 4672:
            severity = "High"
            process = "Privilege Assigned"
            target = row.get("PrivilegeList", "")

        elif event_id == 4688:
            severity = "High"
            process = row.get("NewProcessName", "Process Create")
            target = row.get("CommandLine", "")

        events.append({
            "Time": row.get("TimeCreated") or row.get("Time"),
            "EventID": event_id,
            "Source": "Security",
            "Process": process,
            "Target": target,
            "Host": row.get("Computer", ""),
            "User": row.get("TargetUserName", ""),
            "Severity": severity,
        })

    return events
