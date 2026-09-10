import re

FAILED_PATTERN = re.compile(
    r"^(?P<time>\w+\s+\d+\s+\d+:\d+:\d+).*Failed password for (invalid user )?(?P<user>\S+) from (?P<ip>\S+)"
)

ACCEPTED_PATTERN = re.compile(
    r"^(?P<time>\w+\s+\d+\s+\d+:\d+:\d+).*Accepted password for (?P<user>\S+) from (?P<ip>\S+)"
)


def parse_authlog(content: bytes):
    events = []

    text = content.decode("utf-8", errors="ignore")

    for line in text.splitlines():

        failed = FAILED_PATTERN.search(line)
        if failed:
            events.append({
                "Time": failed.group("time"),
                "EventID": 4625,
                "Source": "auth.log",
                "Process": "sshd",
                "Target": failed.group("ip"),
                "Host": "",
                "User": failed.group("user"),
                "Severity": "High",
            })
            continue

        accepted = ACCEPTED_PATTERN.search(line)
        if accepted:
            events.append({
                "Time": accepted.group("time"),
                "EventID": 4624,
                "Source": "auth.log",
                "LogType": "auth.log",
                "Process": "sshd",
                "Target": accepted.group("ip"),
                "Host": "",
                "User": accepted.group("user"),
                "Severity": "Low",
            })

    return events
