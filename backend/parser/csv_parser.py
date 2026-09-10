import csv
import io

from parser.sysmon_parser import parse_sysmon
from parser.security_parser import parse_security
from parser.dns_parser import parse_dns
from parser.firewall_parser import parse_firewall
from parser.hayabusa_parser import parse_hayabusa
from parser.authlog_parser import parse_authlog


def parse_csv(content: bytes):
    """
    CSVのヘッダを見てログ種類を自動判別する
    """

    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    headers = reader.fieldnames or []

    # DictReaderを一度読んだので元に戻す
    content = content

    # Hayabusaは次に追加
    # Hayabusa Timeline CSV
    if "RuleTitle" in headers and "Timestamp" in headers:
        print("Detected: Hayabusa")
        return parse_hayabusa(content)

    if "UtcTime" in headers or "Image" in headers:
        print("Detected: Sysmon")
        return parse_sysmon(content)

    if "QueryName" in headers:
        print("Detected: DNS")
        return parse_dns(content)

    if "DestinationIp" in headers or "DestinationPort" in headers:
        print("Detected: Firewall")
        return parse_firewall(content)

    if "TargetUserName" in headers or "TimeCreated" in headers:
        print("Detected: Security")
        return parse_security(content)

        # Attack Atlas 共通CSV（今まで使っていた形式）
    if "Time" in headers and "Source" in headers and "Process" in headers:
        print("Detected: Attack Atlas CSV")
        reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
        return list(reader)

    raise ValueError(f"Unknown CSV format. Headers: {headers}")
