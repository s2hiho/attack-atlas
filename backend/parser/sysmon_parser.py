import csv
import io
import os

def parse_sysmon(content: bytes):
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:

        event_id = int(row.get("EventID", 0))

        process = os.path.basename(row.get("Image", ""))

        target = ""

        severity = "Info"

        # Event ID 1 : Process Create
        if event_id == 1:
            severity = "High"
            target = row.get("CommandLine", "")

        # Event ID 3 : Network Connection
        elif event_id == 3:
            severity = "Medium"
            ip = row.get("DestinationIp", "")
            port = row.get("DestinationPort", "")
            target = f"{ip}:{port}" if port else ip

        # Event ID 11 : File Create
        elif event_id == 11:
            severity = "Low"
            target = row.get("TargetFilename", "")

        # Event ID 13 : Registry Change
        elif event_id == 13:
            severity = "High"
            target = row.get("TargetObject", "")

        # Event ID 22 : DNS Query
        elif event_id == 22:
            severity = "Medium"
            target = row.get("QueryName", "")

        else:
            target = ""

        events.append({
            "Time": row.get("UtcTime") or row.get("Time"),
            "EventID": event_id,
            "Source": "Sysmon",
            "LogType": "Sysmon",
            "Process": process,
            "Target": target,
            "Host": row.get("Computer", ""),
            "User": row.get("User", ""),
            "Severity": severity,
        })

    return events
