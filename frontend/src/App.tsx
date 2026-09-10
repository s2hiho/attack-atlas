import { useState } from "react";
import "./App.css";
import AttackGraph from "./components/AttackGraph";

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
  const uploadFile = async () => {
    console.log("Selected files:", selectedFiles);
    // ファイルが選択されていなければ処理を止める
    if (selectedFiles.length === 0) {
      alert("ファイルを選択してください");
      return;
    }

    // ファイルを送るための箱（FormData）を作成
    const formData = new FormData();
    selectedFiles.forEach((file) => {
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
        <h1>🛡️ Attack Atlas</h1>
        <p>DFIR Visualization Platform for MWS Hackathon</p>
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
              if (e.target.files) {
                setSelectedFiles(Array.from(e.target.files));
              }
            }}
          />








          {/* FastAPIへアップロード */}
          <button onClick={uploadFile}>Upload Log</button>

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
            </>  
          )}
        </section>

        {/* MITRE ATT&CKカード */}
        <section className="card mitre-card">
          <h2>🎯 MITRE ATT&CK</h2>
          <p>Techniques detected from uploaded logs.</p>
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
                  <th>EventID</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Process</th>
                </tr>
              </thead>
        
              <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <td>{event.Time}</td>
                    <td>{event.EventID}</td>
                    <td>
                      <span className={`severity ${event.Severity.toLowerCase()}`}>
                        {event.Severity}
                      </span>
                    </td>

                    <td>{event.Source}</td>
                    <td>{event.Process}</td>
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
