"use client";

import { useState, useEffect } from "react";
import { generateLotto, LottoResult, LottoMode } from "@/lib/lotto-engine";
import { getInsight } from "@/lib/stats-engine";
import type { GloLotteryResult, LottoStats } from "@/lib/glo-types";

export default function Home() {
  const [mode, setMode] = useState<LottoMode>("pure");
  const [birthday, setBirthday] = useState("");
  const [count, setCount] = useState(1);
  const [currentResults, setCurrentResults] = useState<LottoResult[]>([]);
  const [history, setHistory] = useState<LottoResult[]>([]);

  const [latestLotto, setLatestLotto] = useState<GloLotteryResult | null>(null);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);

  const [stats, setStats] = useState<LottoStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsPeriods, setStatsPeriods] = useState(12);

  useEffect(() => {
    const saved = localStorage.getItem("yor_lotto_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setLatestLoading(true);
    setLatestError(null);
    fetch("/api/glo/latest")
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        const r = data?.response;
        if (r) setLatestLotto({ date: r.date ?? "", prizes: r.prizes ?? r });
        else throw new Error("ไม่พบข้อมูล");
      })
      .catch(e => setLatestError(e.message))
      .finally(() => setLatestLoading(false));
  }, []);

  useEffect(() => {
    setStatsLoading(true);
    setStatsError(null);
    fetch(`/api/glo/stats?periods=${statsPeriods}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(e => setStatsError(e.message))
      .finally(() => setStatsLoading(false));
  }, [statsPeriods]);

  const handleRandomize = () => {
    const newResults = generateLotto(mode, birthday, count);
    setCurrentResults(newResults);
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

      <div className="container dashboard">
        {/* Control Panel */}
        <div className="control-panel card">
          <h2 className="text-headline-md">ตั้งค่าการสุ่ม</h2>

          <div className="form-group">
            <label className="text-label-bold">โหมดการสุ่ม</label>
            <div className="mode-selector">
              <button
                className={`mode-btn ${mode === "pure" ? "active" : ""}`}
                onClick={() => setMode("pure")}
              >
                สุ่มล้วน
              </button>
              <button
                className={`mode-btn ${mode === "birthday" ? "active" : ""}`}
                onClick={() => setMode("birthday")}
              >
                ผสมวันเกิด
              </button>
            </div>
          </div>

          {mode === "birthday" && (
            <div className="form-group animate-fade-in">
              <label className="text-label-bold">วันเกิด (ค.ศ.)</label>
              <input
                type="date"
                className="input-field"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="text-label-bold">จำนวนชุด</label>
            <select
              className="input-field"
              value={count}
              onChange={e => setCount(Number(e.target.value))}
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

        {/* Right Column */}
        <div className="right-column">
          {/* Latest GLO Result */}
          <div className="glo-latest card">
            <div className="glo-latest-header">
              <span className="material-symbols-outlined text-gold-icon">emoji_events</span>
              <h2 className="text-headline-md">ผลรางวัลงวดล่าสุด</h2>
              {latestLotto?.date && (
                <span className="glo-date">{latestLotto.date}</span>
              )}
            </div>

            {latestLoading && <div className="loading-row">กำลังโหลดข้อมูล GLO...</div>}
            {latestError && <div className="error-row">ไม่สามารถโหลดข้อมูลได้: {latestError}</div>}
            {!latestLoading && !latestError && latestLotto && (
              <div className="glo-prizes">
                {latestLotto.prizes.first?.number?.[0] && (
                  <div className="glo-prize-row prize-first">
                    <span className="prize-label">รางวัลที่ 1</span>
                    <span className="prize-number prize-number-xl">
                      {latestLotto.prizes.first.number[0]}
                    </span>
                  </div>
                )}
                <div className="glo-prize-sub">
                  {latestLotto.prizes.threeDigitPrefix?.number?.length ? (
                    <div className="glo-prize-item">
                      <span className="prize-label">3 ตัวหน้า</span>
                      <div className="prize-tags">
                        {latestLotto.prizes.threeDigitPrefix.number.map(n => (
                          <span key={n} className="prize-tag">{n}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {latestLotto.prizes.threeDigitSuffix?.number?.length ? (
                    <div className="glo-prize-item">
                      <span className="prize-label">3 ตัวท้าย</span>
                      <div className="prize-tags">
                        {latestLotto.prizes.threeDigitSuffix.number.map(n => (
                          <span key={n} className="prize-tag">{n}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {latestLotto.prizes.twoDigit?.number?.[0] && (
                    <div className="glo-prize-item">
                      <span className="prize-label">2 ตัวท้าย</span>
                      <span className="prize-tag prize-tag-gold">
                        {latestLotto.prizes.twoDigit.number[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {currentResults.length > 0 && (
            <div className="results-section">
              <h2 className="text-headline-lg">ผลลัพธ์การสุ่ม</h2>
              <div className="results-grid">
                {currentResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="result-card card animate-fade-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
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

                    {stats && (
                      <div className="insight-row">
                        <span className="material-symbols-outlined insight-icon">lightbulb</span>
                        <span>{getInsight(res.twoDigits, res.threeDigits, stats)}</span>
                      </div>
                    )}
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
                      <span className="text-label-bold opacity-50">
                        | {res.threeDigits} | {res.twoDigits}
                      </span>
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

        {/* Stats Section — full width */}
        <div className="stats-section full-width">
          <div className="stats-header">
            <h2 className="text-headline-md">สถิติเลขร้อน / เลขเย็น</h2>
            <div className="period-selector">
              {[6, 12, 24].map(p => (
                <button
                  key={p}
                  className={`period-btn ${statsPeriods === p ? "active" : ""}`}
                  onClick={() => setStatsPeriods(p)}
                >
                  {p} งวด
                </button>
              ))}
            </div>
          </div>

          {statsLoading && <div className="loading-row">กำลังโหลดสถิติ {statsPeriods} งวด...</div>}
          {statsError && <div className="error-row">ไม่สามารถโหลดสถิติได้: {statsError}</div>}

          {!statsLoading && !statsError && stats && (
            <div className="stats-grid">
              {/* 2-digit hot/cold */}
              <div className="stat-card card">
                <h3 className="text-headline-md">2 ตัวท้าย</h3>
                <p className="stat-meta">
                  วิเคราะห์จาก {stats.periodsAnalyzed} งวด
                  {stats.dateRange.from && ` (${stats.dateRange.from} – ${stats.dateRange.to})`}
                </p>
                <div className="stat-columns">
                  <div className="stat-col">
                    <div className="stat-col-label hot">🔥 เลขร้อน</div>
                    {stats.twoDigit.slice(0, 10).map(d => (
                      <div key={d.digit} className="stat-row">
                        <span className="stat-digit">{d.digit}</span>
                        <div className="stat-bar-wrap">
                          <div
                            className="stat-bar hot"
                            style={{
                              width: `${Math.min(100, (d.count / (stats.periodsAnalyzed || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="stat-count">{d.count}x</span>
                      </div>
                    ))}
                  </div>
                  <div className="stat-col">
                    <div className="stat-col-label cold">🧊 เลขเย็น</div>
                    {stats.twoDigit.slice(-10).reverse().map(d => (
                      <div key={d.digit} className="stat-row">
                        <span className="stat-digit">{d.digit}</span>
                        <div className="stat-bar-wrap">
                          <div
                            className="stat-bar cold"
                            style={{
                              width: `${Math.min(100, (d.count / (stats.periodsAnalyzed || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="stat-count">{d.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3-digit suffix hot */}
              <div className="stat-card card">
                <h3 className="text-headline-md">3 ตัวท้าย</h3>
                <p className="stat-meta">วิเคราะห์จาก {stats.periodsAnalyzed} งวด</p>
                <div className="stat-columns">
                  <div className="stat-col">
                    <div className="stat-col-label hot">🔥 เลขร้อน</div>
                    {stats.threeDigitSuffix.slice(0, 10).map(d => (
                      <div key={d.digit} className="stat-row">
                        <span className="stat-digit">{d.digit}</span>
                        <div className="stat-bar-wrap">
                          <div
                            className="stat-bar hot"
                            style={{
                              width: `${Math.min(100, (d.count / (stats.periodsAnalyzed || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="stat-count">{d.count}x</span>
                      </div>
                    ))}
                  </div>
                  <div className="stat-col">
                    <div className="stat-col-label cold">🧊 เลขเย็น</div>
                    {stats.threeDigitSuffix
                      .filter(d => d.count > 0)
                      .slice(-10)
                      .reverse()
                      .map(d => (
                        <div key={d.digit} className="stat-row">
                          <span className="stat-digit">{d.digit}</span>
                          <div className="stat-bar-wrap">
                            <div
                              className="stat-bar cold"
                              style={{
                                width: `${Math.min(100, (d.count / (stats.periodsAnalyzed || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="stat-count">{d.count}x</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
