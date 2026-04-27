"use client";

import { useState, useEffect } from "react";
import { generateLotto, LottoResult, LottoMode } from "@/lib/lotto-engine";

export default function Home() {
  const [mode, setMode] = useState<LottoMode>("pure");
  const [birthday, setBirthday] = useState("");
  const [count, setCount] = useState(1);
  const [currentResults, setCurrentResults] = useState<LottoResult[]>([]);
  const [history, setHistory] = useState<LottoResult[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("yor_lotto_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleRandomize = () => {
    const newResults = generateLotto(mode, birthday, count);
    setCurrentResults(newResults);

    // Update history
    const updatedHistory = [...newResults, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem("yor_lotto_history", JSON.stringify(updatedHistory));
  };

  const copyToClipboard = (result: LottoResult) => {
    const text = `Yor Lotto: 6 หลัก ${result.sixDigits}, 3 ตัว ${result.threeDigits}, 2 ตัว ${result.twoDigits}`;
    navigator.clipboard.writeText(text);
    alert("คัดลอกแล้ว!");
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="text-display-hero">
            Yor Lotto <br />
            <span className="text-gold">เดือนนี้รวย</span>
          </h1>
          <p className="text-body-lg hero-desc">
            สัมผัสประสบการณ์แห่งความโชคดี สุ่มเลขนำโชคของคุณได้ง่ายๆ เพียงปลายนิ้วสัมผัส
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleRandomize}>
              <span className="material-symbols-outlined icon-inline">casino</span>
              LUCKY PICK
            </button>
            <button className="btn-outline">VIEW STATS</button>
          </div>
        </div>
      </section>

      {/* Control Panel */}
      <div className="container dashboard">
        <div className="control-panel card">
          <h2 className="text-headline-md">ตั้งค่าการสุ่ม</h2>
          
          <div className="form-group">
            <label className="text-label-bold">โหมดการสุ่ม</label>
            <div className="mode-selector">
              <button 
                className={`mode-btn ${mode === 'pure' ? 'active' : ''}`}
                onClick={() => setMode('pure')}
              >
                สุ่มล้วน
              </button>
              <button 
                className={`mode-btn ${mode === 'birthday' ? 'active' : ''}`}
                onClick={() => setMode('birthday')}
              >
                ผสมวันเกิด
              </button>
            </div>
          </div>

          {mode === 'birthday' && (
            <div className="form-group animate-fade-in">
              <label className="text-label-bold">วันเกิด (ค.ศ.)</label>
              <input 
                type="date" 
                className="input-field"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="text-label-bold">จำนวนชุด</label>
            <select 
              className="input-field"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              <option value={1}>1 ชุด</option>
              <option value={5}>5 ชุด</option>
              <option value={10}>10 ชุด</option>
            </select>
          </div>

          <button className="btn-primary w-full" onClick={handleRandomize}>
            สุ่มเลขนำโชค
          </button>
        </div>

        {/* Results Section */}
        {currentResults.length > 0 && (
          <div className="results-section">
            <h2 className="text-headline-lg">ผลลัพธ์การสุ่ม</h2>
            <div className="results-grid">
              {currentResults.map((res, idx) => (
                <div key={idx} className="result-card card animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="result-header">
                    <span className="text-label-bold text-primary">ชุดที่ {idx + 1}</span>
                    <button className="copy-btn" onClick={() => copyToClipboard(res)}>
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                  
                  <div className="result-main">
                    <div className="result-item">
                      <span className="text-label-bold opacity-70 uppercase">รางวัลที่ 1</span>
                      <div className="digit-row text-number-xl">{res.sixDigits}</div>
                    </div>
                    
                    <div className="result-sub-grid">
                      <div className="result-item">
                        <span className="text-label-bold opacity-70 uppercase">3 ตัวท้าย</span>
                        <div className="digit-box">{res.threeDigits}</div>
                      </div>
                      <div className="result-item">
                        <span className="text-label-bold opacity-70 uppercase">2 ตัวท้าย</span>
                        <div className="digit-box active">{res.twoDigits}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="history-section">
            <h2 className="text-headline-md">ประวัติการสุ่มล่าสุด</h2>
            <div className="history-list">
              {history.slice(0, 8).map((res, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-info">
                    <span className="text-body-md font-bold">{res.sixDigits}</span>
                    <span className="text-label-bold opacity-50">| {res.threeDigits} | {res.twoDigits}</span>
                  </div>
                  <span className="text-label-bold text-xs opacity-40">
                    {new Date(res.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
