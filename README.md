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
|---------------------|---------------------------|
| Frontend            | React + Vite + TypeScript |
| Backend             | FastAPI + Uvicorn         |
| Graph Visualization | React Flow                |
| Timeline            | React Components          |
| Language            | Python / TypeScript       |

---

## 📁 ディレクトリ構成

```text

attack-atlas/
├── backend/      # FastAPI API
├── frontend/     # React + Vite UI
├── sample_logs/  # Sample CSV logs
└── README.md
```

---

## 🚀 起動方法

### 1. Backend

```bash
cd backend

#初回のみ
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

#起動
uvicorn app.main:app --reload
```

API Documentation（Swagger）

```text
http://127.0.0.1:8000/docs
```

---

### 2. Frontend

```bash
cd frontend

#初回のみ
npm install

#起動
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




