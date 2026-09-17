import { useState } from "react";
import "./App.css";
import AttackGraph from "./components/AttackGraph";
import deer from "./assets/deer.png";
import senbei from "./assets/senbei.png";

function App() {
  // ユーザーが選択した複数のログファイルを保存する
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // アップロード結果（ファイル名やサイズ）を画面に表示する
  const [uploadResult, setUploadResult] = useState("");
  
  // CSVから読み込んだイベント一覧を保存する
  const [events, setEvents] = useState<any[]>([]);
  const [route, setRoute] = useState({
    nodes: [],
    edges: [],
  });

  const [summary, setSummary] = useState({
    filenames: [] as string[],
    total_files: 0,
    total_events: 0,
    sources: [] as string[],
  });
  
  const [mitre, setMitre] = useState<any[]>([]);
  // イベント名を日本語表示する
  const processName = (process: string) => {
    const map: Record<string, string> = {
      "Failed Login": "ログイン失敗",
      "Successful Login": "ログイン成功",
      "Privilege Assigned": "管理者権限取得",
      "DNS Query": "DNS問い合わせ",
      "Network Connection": "外部通信",
      "File Create": "ファイル生成",
      "Process Create": "プロセス生成",
      "sshd": "SSHログイン",
    };
  
    return map[process] || process;
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "high";
      case "Medium":
        return "medium";
      case "Low":
        return "low";
      default:
        return "info";
    }
  };





  // EventIDから重大度（Severity）を決める関数
  const getSeverity = (eventID: number) => {
    switch (eventID) {
      case 1:      // Process Create
      case 4688:   // Windows Process Create
        return "High";
      case 3:      // Network Connection
      case 22:     // DNS Query
        return "Medium";
      case 11:     // File Create
        return "Low";
      default:
        return "Info";
    }
  };


  // FastAPIへログファイルを送信する関数
  const uploadFile = async (files: File[]) => {
    console.log("Selected files:", files);
    // ファイルが選択されていなければ処理を止める
    if (files.length === 0) {
      alert("ファイルを選択してください");
      return;
    }

    // ファイルを送るための箱（FormData）を作成
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // FastAPIの /upload APIへ POST リクエストを送る
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      
      console.log("Status:", response.status);

      // FastAPIから返ってきたJSONを受け取る
      const data = await response.json();
      console.log("Response:", data);
      // Summaryを保存
      setSummary(data.summary);
      
      // イベント一覧を保存
      setEvents(data.events);
      
      // Attack Routeを保存
      setRoute(data.route);
      // MITRE ATT&CK をイベントから作る
      const mitreMap: Record<string, { id: string; name: string; tactic: string }> = {
        "4625": { id: "T1110", name: "Brute Force", tactic: "Credential Access" },
        "4624": { id: "T1078", name: "Valid Accounts", tactic: "Initial Access" },
        "1": { id: "T1059", name: "PowerShell Execution", tactic: "Execution" },
        "3": { id: "T1071", name: "Application Layer Protocol", tactic: "Command & Control" },
        "22": { id: "T1071", name: "DNS Query", tactic: "Command & Control" },
      };

const detectedMitre = data.events
  .map((event: any) => mitreMap[String(event.EventID)])
  .filter(Boolean)
  .filter(
    (item: any, index: number, self: any[]) =>
      index === self.findIndex((x) => x.id === item.id)
  );

setMitre(detectedMitre);      
      // 表示メッセージ
      setUploadResult(`${data.summary.total_files} 個のログを読み込みました`);
    } catch (error) {
      // 通信に失敗した場合
      setUploadResult("アップロードに失敗しました。FastAPIが起動しているか確認してください。");
      console.error(error);
    }
  };

  return (
    <div className="app">
      {/* ヘッダー */}
      <header className="header">
        <div className="header-left">
          <img src={deer} className="logo-deer" />
      
          <div className="header-text">
            <row align=center gap=3 wrap=wrap>
              <h1>Attack Atlas</h1>
              <span className="team-badge">Team 鹿せんべい</span>
            </row>
      
            <p>DFIR Visualization Platform for MWS Hackathon</p>
          </div>
        </div>
      
        <div className="header-right">
          🦌 ⛰️
        </div>
      </header>
      {/* ダッシュボード */}
      <main className="dashboard">
        {/* ログアップロードカード */}
        <section className="card upload-card">
          <h2>📂 Log Upload</h2>
          <p>Upload Windows Event Log, Sysmon, DNS or Firewall logs.</p>





          {/* ログファイルを選択する */}
          <input
            type="file"
            multiple
            accept=".csv, .log"

            onChange={(e) => {
              if (!e.target.files) return;
            
              const files = Array.from(e.target.files);
            
              setSelectedFiles(files); // 選択したファイル名は残す
              uploadFile(files);       // すぐアップロード
            }}

          />


          {/* アップロード結果を表示 */}
          <p>{uploadResult}</p>
        </section>

        {/* インシデント概要カード */}
        <section className="card summary-card">
          <h2>📊 Incident Summary</h2>
          {summary.total_files === 0 ? (
            <p>No incident loaded.</p>
          ) : (
            <>
              <p><strong>Loaded files:</strong></p>
            
              <ul>
                {summary.filenames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            
              <p><strong>Total files:</strong> {summary.total_files}</p>
            
              <p><strong>Total events:</strong> {summary.total_events}</p>
            
              <p><strong>Sources:</strong></p>
            
              <ul>
                {summary.sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
              <hr />
              
              <p><strong>Risk Level</strong></p>
              
              <div className="risk-legend">
                <span className="severity high">High</span>
                <span className="severity medium">Medium</span>
                <span className="severity low">Low</span>
                <span className="severity info">Info</span>
              </div>
              
              <caption>
                High: 認証突破・PowerShell・権限昇格 / Medium: DNS・外部通信 /
                Low: ログイン成功・BLOCK通信・ファイル生成
              </caption>

            </>  
          )}
        </section>

        <section className="card mitre-card">
          <h2>🎯 MITRE ATT&CK</h2>
          <img src={senbei} className="senbei-icon"/>
          {mitre.length === 0 ? (
            <p>No techniques detected.</p>
          ) : (
            mitre.map((item) => (
              <div className="mitre-item" key={item.id}>
                <div className="mitre-id">{item.id}</div>
        
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.tactic}</p>
                </div>
              </div>
            ))
          )}
        </section>       
       
        {/* Attack Graphカード */}
        <section className="card graph-card">
          <h2>🗺️ Attack Graph</h2>
        
          {events.length === 0 ? (
            <p>Upload a log to visualize the attack path.</p>
          ) : (
            <AttackGraph route={route} />
          )}
        </section>

        {/* タイムラインカード */}
        <section className="card timeline-card">
          <h2>🕒 Attack Timeline</h2>
        
          {events.length === 0 ? (
            <p>No events loaded.</p>
          ) : (
            <>
            <table className="event-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Source</th>
                  <th>Severity</th>
                  <th>Event</th>
                  <th>User</th>
                  <th>Target / IP</th>
                  <th>Host</th>
                  <th>Log File</th>
                </tr>
              </thead>
        
              <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <td>{event.Time}</td>
                  
                    <td>{event.LogType || event.Source}</td>
                  
                    <td>
                      <span className={`severity ${severityColor(event.Severity)}`}>
                        {event.Severity}
                      </span>
                    </td>
                  
                    <td>{processName(event.Process)}</td>
                  
                    <td>{event.User || "-"}</td>
                  
                    <td>{event.Target || "-"}</td>
                  
                    <td>{event.Host || "-"}</td>
                  
                    <td>{event.LogFile || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
