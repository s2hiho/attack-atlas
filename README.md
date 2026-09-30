# attack-atlas🦌🍘

Attack Atlas は、複数のログから攻撃者の挙動をMITRE ATT&CK に対応付けて、時系列・地図・グラフで可視化する DFIR 支援ツールです。
---

## 🎯 プロジェクト概要
Attack Atlas は Sysmon、Windows Security Event Log、DNS、Firewall など異なるログを統合し、攻撃ストーリーを一つの画面で分析できることを目的としています。
主な機能
・CSV ログアップロード（複数ファイル対応）
・Incident Summary
・Attack Timeline
・Attack Graph（React Flow）
・MITRE ATT&CK Technique Mapping

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
```

**初回のみ(macOS / Linux)**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**初回のみ(Windows / PowerShell)**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> **Windowsで「スクリプトの実行が無効になっています」というエラーが出る場合**
> 以下を一度だけ実行してから、もう一度 `Activate.ps1` を実行してください。
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

**起動(共通)**
```bash
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
※Node.jsのインストールが必要です
npm install

#起動
npm run dev
```

ブラウザで開く

```text
http://localhost:5173
```

---





