import { useRef, useState } from "react";
import "./App.css";
import AttackGraph from "./components/AttackGraph";
import EventTimeline from "./components/EventTimeline";
import type { UploadData } from "./types";
import deer from "./assets/deer.png";
import senbei from "./assets/senbei.png";

// Existing mapping: UI changes must not change detection.
const mitreMap: Record<string, { id: string; name: string; tactic: string }> = {
  "4625": { id: "T1110", name: "Brute Force", tactic: "Credential Access" },
  "4624": { id: "T1078", name: "Valid Accounts", tactic: "Initial Access" },
  "1": { id: "T1059", name: "PowerShell Execution", tactic: "Execution" },
  "3": { id: "T1071", name: "Application Layer Protocol", tactic: "Command & Control" },
  "22": { id: "T1071", name: "DNS Query", tactic: "Command & Control" },
};
function App() {
  const [data, setData] = useState<UploadData | null>(null);
  const [revision, setRevision] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  // Lock synchronously, before React renders the disabled input.
  const uploading = useRef(false);
  const busy = status === "loading";
  const mitre = (data?.events ?? []).map(event => mitreMap[String(event.EventID)])
    .filter(Boolean).filter((item, index, items) => index === items.findIndex(x => x.id === item.id));

  async function uploadFiles(files: File[]) {
    if (uploading.current || files.length === 0) return;
    if (files.some(file => !/\.(csv|log)$/i.test(file.name))) {
      setStatus("error");
      setMessage("CSV または LOG ファイルを選択してください。表示中の結果は保持されています。");
      return;
    }
    uploading.current = true;
    setSelectedFiles(files);
    setStatus("loading");
    setMessage(files.length + " ファイルを送信・解析中です。完了までお待ちください。");
    const body = new FormData();
    files.forEach(file => body.append("files", file));
    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST", body, signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const result: UploadData = await response.json();
      if (!result.summary || !Array.isArray(result.summary.filenames) ||
          !Array.isArray(result.summary.sources) || !Array.isArray(result.events) ||
          !Array.isArray(result.route?.nodes) || !Array.isArray(result.route?.edges)) {
        throw new Error("応答形式が不正です");
      }
      setData(result);
      setRevision(value => value + 1);
      setStatus("success");
      setMessage(result.summary.total_files + " ファイル・" + result.summary.total_events + " 件のイベントを読み込みました。");
    } catch (error) {
      setStatus("error");
      const reason = error instanceof Error && error.name === "TimeoutError"
        ? "処理がタイムアウトしました。" : "アップロードに失敗しました。";
      setMessage(reason + " 接続とファイル内容を確認して再試行してください。表示中の結果は保持されています。");
    } finally {
      uploading.current = false;
    }
  }
  return <div className="app">
    <header className="header">
      <div className="header-left">
        <img src={deer} className="logo-deer" alt="鹿のマスコット" />
        <div><div className="header-title-row"><h1>Attack Atlas</h1><span className="team-badge">Team 鹿せんべい</span></div>
          <p>ログから攻撃の流れをたどる DFIR 可視化ツール</p></div>
      </div><span className="header-right" aria-hidden="true">🦌 ⛰️</span>
    </header>
    <main className="dashboard">
      <section className="card upload-card" aria-busy={busy}>
        <h2>📂 ログアップロード</h2>
        <p>Windows・Sysmon・DNS・Firewall などの CSV / LOG に対応しています。</p>
        <label className={"dropzone " + (isDragging ? "dragover " : "") + (busy ? "is-disabled" : "")}
          onDragOver={e => { e.preventDefault(); if (!busy) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); void uploadFiles(Array.from(e.dataTransfer.files)); }}>
          <span>{busy ? "🍘 送信・解析中…" : "ここにドラッグ＆ドロップ、またはクリックして選択"}</span>
          <input type="file" multiple accept=".csv,.log" disabled={busy} aria-label="ログファイルを選択"
            onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void uploadFiles(files); }} />
        </label>
        <p className="hint">分析のたびに結果が置き換わります。まとめて分析するファイルは同時に選択してください。</p>
        {selectedFiles.length > 0 && <div className="file-list"><strong>今回選択したファイル</strong><ul>{selectedFiles.map((file, index) => <li key={index}>{file.name}</li>)}</ul></div>}
        <p className={"upload-status " + status} role="status" aria-live="polite">{message}</p>
        {status === "error" && selectedFiles.length > 0 && <button onClick={() => void uploadFiles(selectedFiles)}>前回選択したファイルで再試行</button>}
      </section>
      <section className="card summary-card">
        <h2>📊 インシデント概要</h2>
        {!data ? <p className="empty-state">ログをアップロードすると概要が表示されます。</p> : <>
          <div className="stats"><div><strong>{data.summary.total_files}</strong><span>ファイル</span></div><div><strong>{data.summary.total_events}</strong><span>イベント</span></div></div>
          <div className="file-list"><strong>読み込み済みファイル</strong><ul>{data.summary.filenames.map((name, i) => <li key={i}>{name}</li>)}</ul></div>
          <p><strong>ログ種別：</strong>{data.summary.sources.join(" / ") || "—"}</p>
          <p className="hint">重要度はログ解析結果の値を表示しています。</p>
          <div className="risk-legend">{["High", "Medium", "Low", "Info"].map(value => <span key={value} className={"severity " + value.toLowerCase()}>{value}</span>)}</div>
        </>}
      </section>
      <section className="card mitre-card">
        <div className="section-heading"><h2>🎯 MITRE ATT&CK</h2><img src={senbei} className="senbei-icon" alt="鹿せんべい" /></div>
        {mitre.length === 0 ? <p className="empty-state">{data ? "該当するテクニックはありません。" : "ログをアップロードするとテクニックが表示されます。"}</p> : mitre.map(item => <div className="mitre-item" key={item.id}><span className="mitre-id">{item.id}</span><div><strong>{item.name}</strong><p>{item.tactic}</p></div></div>)}
      </section>
      <section className="card graph-card">
        <h2>🗺️ 攻撃グラフ</h2>
        {!data?.route.nodes.length ? <p className="empty-state">{data ? "表示できるグラフのノードがありません。タイムラインでログを確認してください。" : "ログをアップロードすると攻撃の流れが表示されます。"}</p> : <AttackGraph key={revision} route={data.route} />}
      </section>
      <section className="card timeline-card">
        <h2>🕒 攻撃タイムライン</h2>
        <EventTimeline key={revision} events={data?.events ?? []} />
      </section>
    </main>
  </div>;
}
export default App;
