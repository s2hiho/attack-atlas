import csv
import io

def parse_hayabusa(content: bytes):
    """
    Hayabusa Timeline CSV を Attack Atlas 共通形式へ変換
    """

    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    events = []

    for row in reader:

        # Severity変換
        level = row.get("Level", "").lower()

        severity = "Info"

        if level in ["critical", "high"]:
            severity = "High"
        elif level == "medium":
            severity = "Medium"
        elif level == "low":
            severity = "Low"

        events.append({
            "Time": row.get("Timestamp"),
            "EventID": int(row.get("EventID", 0)),
            "Source": row.get("Channel", "Hayabusa"),
            "Process": row.get("RuleTitle", ""),
            "Target": row.get("Details", ""),
            "Host": row.get("Computer", ""),
            "User": "",
            "Severity": severity,
        })

    return events
