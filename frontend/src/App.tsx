import { useState } from "react";
import "./App.css";

function App() {
  // ユーザーが選択したログファイルを保存する
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // アップロード結果（ファイル名やサイズ）を画面に表示する
  const [uploadResult, setUploadResult] = useState("");
  
  // CSVから読み込んだイベント一覧を保存する
  const [events, setEvents] = useState<any[]>([]);

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
    // ファイルが選択されていなければ処理を止める
    if (!selectedFile) {
      alert("ファイルを選択してください");
      return;
    }

    // ファイルを送るための箱（FormData）を作成
    const formData = new FormData();

    // "file" という名前でファイルを追加
    // FastAPI側の upload_log(file=...) と対応している
    formData.append("file", selectedFile);

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

      // アップロード成功メッセージ
      setUploadResult(`${data.filename} を読み込みました`);

      // CSVイベント一覧を保存
      setEvents(data.events);
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
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                // 選択した最初のファイルを保存
                setSelectedFile(e.target.files[0]);
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
          
          {events.length === 0 ? (
          <p>No incident loaded.</p>
          ) : (
            <>
              <p><strong>Loaded file:</strong> {selectedFile?.name}</p>
              <p><strong>Total events:</strong> {events.length}</p>

              <p><strong>Sources:</strong></p>
              <ul>
                {[...new Set(events.map((event) => event.Source))].map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* タイムラインカード */}
        <section className="card timeline-card">
          <h2>🕒 Attack Timeline</h2>
        
          {events.length === 0 ? (
            <p>No events loaded.</p>
          ) : (
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
                      <span className={`severity ${getSeverity(Number(event.EventID)).toLowerCase()}`}>
                        {getSeverity(Number(event.EventID))}
                      </span>
                    </td>

                    <td>{event.Source}</td>
                    <td>{event.Process}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {/* MITRE ATT&CKカード */}
        <section className="card mitre-card">
          <h2>🎯 MITRE ATT&CK</h2>
          <p>Techniques detected from uploaded logs.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
