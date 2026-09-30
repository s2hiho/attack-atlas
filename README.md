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


---

## 📖 使い方

### 1. ログをアップロードする
「📂 ログアップロード」のエリアに、`sample_logs` フォルダ内のCSVファイル(例: `sysmon.csv`)を
**ドラッグ&ドロップ**、または**クリックしてファイル選択**してください。
複数ファイルをまとめて選択すると、それらを統合して分析できます。

> ⚠️ 注意: ログは分析のたびに「置き換え」されます。複数のログを一緒に分析したい場合は、
> 1回のアップロードで全ファイルをまとめて選択してください。後から追加しても累積されません。

### 2. 結果を確認する
アップロードすると、以下が自動的に表示されます。

- **📊 インシデント概要**: 読み込んだファイル数・イベント数・ログ種別・重要度の凡例(High / Medium / Low / Info)
- **🎯 MITRE ATT&CK**: 検出された挙動に対応するMITRE ATT&CKの技術ID
- **🗺️ 攻撃グラフ**: 攻撃の流れをノード・エッジで可視化したグラフ(ノードをクリックするとグラフ下に詳細情報が表示されます)
- **🕒 攻撃タイムライン**: 全イベントの時系列一覧表

### 3. サンプルログで試す
`sample_logs/` フォルダには、Sysmon・DNS・Firewallなどのサンプルログが含まれています。
まずはこれらを使って動作を確認できます。

---





## UI の操作

- **アップロード状態**：送信・解析中はファイル選択と追加ドロップを受け付けません。成功時にはファイル数・イベント数、失敗時にはエラーと再試行ボタンを表示します。同じファイルも再選択できます。失敗時は読み込み済みの結果を保持します。
- **ログ詳細**：タイムラインの「詳細」ボタンから解析結果の全フィールドを確認できます。「閉じる」または Esc キーで閉じると、元のボタンに戻ります。元ファイル全文ではなく、API が返したイベントを表示します。
- **検索・絞り込み**：キーワード、ログ種別、重要度、ログファイルを組み合わせて絞り込めます。空白区切りのキーワードは AND 検索です。「条件をクリア」で全件に戻ります。概要・MITRE ATT&CK・グラフには影響しません。
- **グラフ**：初期表示は全ノードを画面内に収めます。「全体を表示」で表示位置を戻せます。高さは 320〜900 px で調整できます。移動・拡大・縮小後も全体表示に戻せます。
- **再読み込み**：アップロード成功時に、検索条件、詳細パネル、グラフの表示状態をリセットします。
- **狭い画面**：カードが縦に並び、タイムライン表は横にスクロールできます。


