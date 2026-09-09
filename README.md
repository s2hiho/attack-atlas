# attack-atlas
Attack Atlas - MWS Cup Hackathon DFIR Visualization Tool

# 🛡️ Attack Atlas

**Attack Atlas** は MWS（Malware/DFIR Workshop）向けに開発している **DFIRログ可視化プラットフォーム** です。

複数種類のログを統合し、攻撃の流れを **Google Maps のように経路として可視化** することを目標にしています。

---

## 🎯 プロジェクト概要

DFIRでは Sysmon・Security Event Log・DNS・Firewall など複数のログを横断して分析する必要があります。

Attack Atlas はそれらのログから攻撃に関係するイベントをまとめ、以下のような情報を一つの画面で表示します。

* 📂 ログアップロード
* 📊 インシデント概要（Incident Summary）
* 🕒 攻撃タイムライン（Attack Timeline）
* 🗺️ 攻撃経路グラフ（Attack Graph）
* 🎯 MITRE ATT&CK（実装予定）

---

## ✨ 現在実装済み（MVP）

* [x] CSVログアップロード
* [x] 複数CSVファイル同時アップロード
* [x] Incident Summary表示
* [x] Attack Timeline表示
* [x] Attack Graph（React Flow）
* [x] FastAPI ↔ React連携

---

## 📸 画面構成

* **Log Upload**

  * 複数CSVファイルをアップロード

* **Incident Summary**

  * 読み込んだログファイル一覧
  * イベント数
  * ログ種類（Source）

* **Attack Timeline**

  * 時系列イベント一覧
  * Event IDごとのSeverity表示

* **Attack Graph**

  * Host → Process → DNS → Network → File の攻撃経路を可視化

---

## 🛠 技術スタック

| Component           | Technology                |
| ------------------- | ------------------------- |
| Frontend            | React + Vite + TypeScript |
| Backend             | FastAPI                   |
| Graph Visualization | React Flow                |
| Language            | Python / TypeScript       |

---

## 📁 ディレクトリ構成

```text
attack-atlas/
├── backend/
│   ├── app/
│   │   └── main.py            # FastAPI API
│   └── parser/
│       ├── csv_parser.py      # CSV解析
│       └── attack_route.py    # Attack Graph生成
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AttackGraph.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
└── README.md
```

---

## 🚀 起動方法

### 1. Backend

```bash
cd backend/app
uvicorn main:app --reload
```

API Documentation（Swagger）

```text
http://127.0.0.1:8000/docs
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

ブラウザで開く

```text
http://localhost:5173
```

---

## 📄 入力フォーマット（現在）

現在は CSV を入力として利用します。

複数ファイルを同時に選択できます。

例

```text
sysmon.csv
dns.csv
firewall.csv
security.csv
```

CSV形式（例）

```csv
Time,EventID,Source,Process,Target,Severity
2026-09-09 10:01:12,1,Sysmon,powershell.exe,explorer.exe,High
2026-09-09 10:01:18,22,DNS,powershell.exe,evil.com,Medium
2026-09-09 10:01:20,3,Firewall,powershell.exe,203.0.113.5:443,Medium
```

---

## 🧭 今後の予定

### DFIRログ対応

* [ ] Hayabusa出力CSV対応
* [ ] Windows Security.evtx対応
* [ ] Sysmon.evtx対応
* [ ] Linux auth.log対応
* [ ] Firewall / Zeek / Suricataログ対応

### 可視化

* [ ] Google Maps風 Attack Route Builder
* [ ] MITRE ATT&CK Mapping
* [ ] IOC一覧（IP・Domain・Hash）
* [ ] Risk Score自動計算
* [ ] イベントフィルタ・検索

---

## 👥 MWSチーム向けメモ

Attack Atlas は **ログ収集ツールではなく可視化ツール** を目指しています。

想定ワークフロー

```text
EVTX / auth.log / Firewall Logs
          │
          ▼
 Hayabusa / Chainsaw / Parser
          │
          ▼
      CSV / JSON
          │
          ▼
      Attack Atlas
   (Timeline + Attack Graph)
```

将来的には複数ログを統合して、攻撃ストーリーを時系列・経路の両方から分析できるようにします。

