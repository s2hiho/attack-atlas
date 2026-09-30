import { useRef, useState } from "react";
import type { LogEvent } from "../types";

const processNames: Record<string, string> = {
  "Failed Login": "ログイン失敗", "Successful Login": "ログイン成功",
  "Privilege Assigned": "管理者権限取得", "DNS Query": "DNS問い合わせ",
  "Network Connection": "外部通信", "File Create": "ファイル生成",
  "Process Create": "プロセス生成", sshd: "SSHログイン",
};
const display = (value: unknown): string => value == null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
const severityClass = (value?: string) => ["High", "Medium", "Low"].includes(value ?? "") ? value!.toLowerCase() : "info";

export default function EventTimeline({ events }: { events: LogEvent[] }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [severity, setSeverity] = useState("");
  const [file, setFile] = useState("");
  const [selected, setSelected] = useState<LogEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const sources = [...new Set(events.map(e => e.LogType || e.Source).filter(Boolean))].sort();
  const severities = [...new Set(events.map(e => e.Severity).filter(Boolean))].sort();
  const files = [...new Set(events.map(e => e.LogFile).filter(Boolean))].sort();
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = events.map((event, index) => ({ event, index })).filter(({ event }) => {
    const text = [...Object.values(event).map(display), processNames[event.Process ?? ""] ?? ""].join(" ").toLocaleLowerCase();
    return (!source || (event.LogType || event.Source) === source) && (!severity || event.Severity === severity)
      && (!file || event.LogFile === file) && terms.every(term => text.includes(term));
  });
  const active = Boolean(query || source || severity || file);
  return <>
    {events.length === 0 ? <p className="empty-state">表示できるイベントがありません。</p> : <>
      <div className="timeline-filters">
        <label className="search-field">キーワード検索<input type="search" value={query} placeholder="時刻・イベントID・ユーザー・IP など" onChange={e => setQuery(e.target.value)} /></label>
        <label>ログ種別<select value={source} onChange={e => setSource(e.target.value)}><option value="">すべて</option>{sources.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>重要度<select value={severity} onChange={e => setSeverity(e.target.value)}><option value="">すべて</option>{severities.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>ログファイル<select value={file} onChange={e => setFile(e.target.value)}><option value="">すべて</option>{files.map(value => <option key={value}>{value}</option>)}</select></label>
        <button disabled={!active} onClick={() => { setQuery(""); setSource(""); setSeverity(""); setFile(""); }}>条件をクリア</button>
      </div>
      <p className="hint" role="status">{filtered.length} / {events.length} 件を表示 · 絞り込みはタイムラインにのみ適用されます。</p>
      {filtered.length === 0 ? <p className="empty-state">条件に一致するイベントがありません。検索条件を変更してください。</p> : <div className="table-scroll" tabIndex={0} role="region" aria-label="イベント一覧（横にスクロールできます）">
        <table className="event-table"><thead><tr>{["時刻", "ログ種別", "重要度", "イベント", "ユーザー", "対象 / IP", "ホスト", "ログファイル", "詳細"].map(title => <th key={title} scope="col">{title}</th>)}</tr></thead>
          <tbody>{filtered.map(({ event, index }) => <tr key={index}>
            <td>{display(event.Time)}</td><td>{display(event.LogType || event.Source)}</td>
            <td><span className={`severity ${severityClass(event.Severity)}`}>{display(event.Severity)}</span></td>
            <td>{display(processNames[event.Process ?? ""] || event.Process)}</td><td>{display(event.User)}</td><td>{display(event.Target)}</td><td>{display(event.Host)}</td><td>{display(event.LogFile)}</td>
            <td><button className="compact-button" aria-label={`イベント ${index + 1} の詳細を開く`} onClick={e => { trigger.current = e.currentTarget; setSelected(event); dialog.current?.showModal(); }}>詳細</button></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </>}
    <dialog className="log-dialog" ref={dialog} aria-labelledby="log-detail-title" onClose={() => trigger.current?.focus()}>
      <div className="section-heading"><h2 id="log-detail-title">📄 ログ詳細</h2><button onClick={() => dialog.current?.close()} autoFocus aria-label="ログ詳細を閉じる">閉じる ✕</button></div>
      <p className="hint">解析結果の全フィールドを表示しています。Esc キーでも閉じられます。</p>
      <dl className="detail-fields">{selected && Object.entries(selected).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{display(value)}</dd></div>)}</dl>
    </dialog>
  </>;
}
