"use client";

import { useState, useEffect } from "react";
import { generateLotto, LottoResult, LottoMode, Gender } from "@/lib/lotto-engine";
import { getRichCountdownText } from "@/lib/date-utils";
import { getInsight } from "@/lib/stats-engine";
import { analyzeNumbers } from "@/lib/number-analysis";
import { computeGoldenTime, GoldenTimeResult } from "@/lib/golden-time";
import type { GloLotteryResult, LottoStats } from "@/lib/glo-types";

interface DebugResult {
  name: string;
  ok: boolean;
  status?: number;
  error?: string;
  preview?: unknown;
  latencyMs: number;
}

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
  const [countdownText, setCountdownText] = useState("เดือนนี้รวย");

  const [gender, setGender] = useState<Gender | null>(null);

  const [debugResults, setDebugResults] = useState<DebugResult[] | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [goldenTime, setGoldenTime] = useState<GoldenTimeResult | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleExpand = (idx: number) =>
    setExpandedCards(prev => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });

  useEffect(() => {
    setCountdownText(getRichCountdownText());
  }, []);

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
        setLatestLotto(data);
      })
      .catch(e => setLatestError(e.message))
      .finally(() => setLatestLoading(false));
  }, []);

  useEffect(() => {
    setStatsLoading(true);
    setStatsError(null);
    fetch("/api/glo/stats")
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(e => setStatsError(e.message))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleRandomize = () => {
    const opts = { stats: stats ?? undefined, history, gender: gender ?? undefined };
    let newResults = generateLotto(mode, birthday, count, opts);

    if (mode === "smart") {
      // Generate a pool and pick highest-scoring candidates
      const poolSize = Math.max(30, count * 6);
      const pool = generateLotto(mode, birthday, poolSize, opts);
      const scored = pool
        .map(r => ({ r, stars: analyzeNumbers(r.sixDigits, r.threeDigits, r.twoDigits, stats, true).stars }))
        .sort((a, b) => b.stars - a.stars);
      newResults = scored.slice(0, count).map(s => s.r);
      setGoldenTime(computeGoldenTime(
        newResults[0].sixDigits,
        newResults[0].twoDigits,
        birthday || undefined,
        gender ?? undefined,
      ));
    } else {
      setGoldenTime(null);
    }
    setCurrentResults(newResults);
    const updatedHistory = [...newResults, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem("yor_lotto_history", JSON.stringify(updatedHistory));
  };

  const handleDebug = () => {
    setDebugLoading(true);
    setDebugResults(null);
    fetch("/api/glo/debug")
      .then(r => r.json())
      .then(data => setDebugResults(data.results ?? []))
      .catch(e => setDebugResults([{ name: "fetch error", ok: false, error: String(e), latencyMs: 0 }]))
      .finally(() => setDebugLoading(false));
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
        <div className="container hero-layout">
          <div className="hero-content">
            <h1 className="text-display-hero">
              Yor Lotto <br />
              <span className="text-gold">{countdownText}</span>
            </h1>
            <p className="text-body-lg hero-desc">
              ระบบคำนวณการสุ่มด้วยฟิสิกส์ควอนตัม
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleRandomize}>
                <span className="material-symbols-outlined icon-inline">casino</span>
                LUCKY PICK
              </button>
              <button className="btn-outline">VIEW STATS</button>
            </div>
          </div>
          <div className="hero-graphic animate-float">
            <img src="/quantum-hero.png" alt="Quantum Lottery Graphic" />
          </div>
        </div>
      </section>

      <div className="container dashboard">
        {/* Control Panel */}
        <div className="control-panel card">
          <h2 className="text-headline-md">ตั้งค่าระบบคำนวณ</h2>

          <div className="form-group">
            <label className="text-label-bold">โหมดคำนวณ</label>
            <div className="mode-selector">
              <button
                className={`mode-btn ${mode === "pure" ? "active" : ""}`}
                onClick={() => setMode("pure")}
              >
                Normal
              </button>
              <button
                className={`mode-btn mode-btn-smart ${mode === "smart" ? "active" : ""}`}
                onClick={() => setMode("smart")}
                title={!stats ? "รอโหลดสถิติ GLO..." : ""}
              >
                ✦ Quantum
              </button>
            </div>
            {mode === "smart" && !stats && !statsLoading && (
              <p className="mode-hint">⚠ ยังโหลดสถิติไม่ได้ จะสุ่มแบบ pure แทน</p>
            )}
            {mode === "smart" && stats && (
              <p className="mode-hint">ใช้สถิติ {stats.twoDigit.length} เลข + ประวัติ {history.length} รายการ</p>
            )}
          </div>

          {mode === "smart" && (
            <div className="form-group animate-fade-in">
              <label className="text-label-bold">วันเกิด (ค.ศ.) <span style={{fontWeight:400,opacity:.6}}>(ไม่บังคับ)</span></label>
              <input
                type="date"
                className="input-field"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
              />
            </div>
          )}

          {mode === "smart" && (
            <div className="form-group animate-fade-in">
              <label className="text-label-bold">เพศ <span style={{fontWeight:400,opacity:.6}}>(ไม่บังคับ)</span></label>
              <div className="gender-selector">
                <button
                  className={`gender-btn ${gender === "male" ? "active male" : ""}`}
                  onClick={() => setGender(g => g === "male" ? null : "male")}
                >
                  <span className="material-symbols-outlined">male</span>
                  ชาย
                </button>
                <button
                  className={`gender-btn ${gender === "female" ? "active female" : ""}`}
                  onClick={() => setGender(g => g === "female" ? null : "female")}
                >
                  <span className="material-symbols-outlined">female</span>
                  หญิง
                </button>
              </div>
              {gender && (
                <p className="mode-hint">
                  {gender === "male"
                    ? "⚡ Yang: ถ่วงน้ำหนักเลขคี่ + ตำแหน่งหยาง"
                    : "💧 Yin: ถ่วงน้ำหนักเลขคู่ + ตำแหน่งหยิน"}
                </p>
              )}
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

          <div className="debug-section">
            <button
              className="btn-debug"
              onClick={handleDebug}
              disabled={debugLoading}
            >
              <span className="material-symbols-outlined icon-inline">wifi_tethering</span>
              {debugLoading ? "กำลังทดสอบ..." : "ทดสอบ Connection GLO"}
            </button>

            {debugResults && (
              <div className="debug-results animate-fade-in">
                {debugResults.map((r, i) => (
                  <div key={i} className={`debug-row ${r.ok ? "ok" : "fail"}`}>
                    <span className="material-symbols-outlined debug-icon">
                      {r.ok ? "check_circle" : "error"}
                    </span>
                    <div className="debug-info">
                      <span className="debug-name">{r.name}</span>
                      <span className="debug-detail">
                        {r.ok
                          ? `${r.status} · ${r.latencyMs}ms`
                          : r.error ?? `HTTP ${r.status}`}
                      </span>
                      {r.ok && r.preview != null && (
                        <span className="debug-preview">{String(r.preview)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
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
                      <div className="result-header-actions">
                        <button
                          className={`expand-btn ${expandedCards.has(idx) ? "active" : ""}`}
                          onClick={() => toggleExpand(idx)}
                          title="ดูคำอธิบายเลขมงคล"
                        >
                          <span className="material-symbols-outlined">
                            {expandedCards.has(idx) ? "expand_less" : "auto_awesome"}
                          </span>
                          เลขมงคล
                        </button>
                        <button className="copy-btn" onClick={() => copyToClipboard(res)}>
                          <span className="material-symbols-outlined">content_copy</span>
                        </button>
                      </div>
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

                    {expandedCards.has(idx) && (() => {
                      const a = analyzeNumbers(res.sixDigits, res.threeDigits, res.twoDigits, stats, mode === "smart");
                      return (
                        <div className="analysis-panel animate-fade-in">
                          <div className="analysis-headline">
                            <span className="analysis-stars">{"★".repeat(a.stars)}{"☆".repeat(5 - a.stars)}</span>
                            <span className="analysis-headline-text">{a.headline}</span>
                          </div>

                          <div className="analysis-section">
                            <div className="analysis-section-title">6 หลัก · {a.six.number}</div>
                            <div className="analysis-chip">{a.six.composition}</div>
                            <div className="analysis-chip">ผลรวม {a.six.digitSum} → <strong>{a.six.reducedSum}</strong> · {a.six.sumMeaning}</div>
                            {a.six.patterns.map((p, i) => (
                              <div key={i} className="analysis-chip pattern">{p}</div>
                            ))}
                          </div>

                          <div className="analysis-section">
                            <div className="analysis-section-title">3 ตัวท้าย · {a.three.number}</div>
                            <div className="analysis-chip">ผลรวม {a.three.digitSum} → <strong>{a.three.reducedSum}</strong> · {a.three.sumMeaning}</div>
                            {a.three.patterns.map((p, i) => (
                              <div key={i} className="analysis-chip pattern">{p}</div>
                            ))}
                            {a.three.statNote && (
                              <div className="analysis-chip stat">{a.three.statNote}</div>
                            )}
                          </div>

                          <div className="analysis-section">
                            <div className="analysis-section-title">2 ตัวท้าย · {a.two.number}</div>
                            <div className="analysis-chip">ผลรวม {a.two.digitSum} → <strong>{a.two.reducedSum}</strong> · {a.two.sumMeaning}</div>
                            {a.two.patterns.map((p, i) => (
                              <div key={i} className="analysis-chip pattern">{p}</div>
                            ))}
                            {a.two.statNote && (
                              <div className="analysis-chip stat">{a.two.statNote}</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Golden Time Card */}
          {goldenTime && (
            <div className="golden-time-card card animate-fade-in">
              <div className="golden-time-header">
                <span className="material-symbols-outlined golden-time-icon">star</span>
                <h2 className="text-headline-md">ดวงชะตาวันนี้</h2>
              </div>

              <div className="golden-time-score-row">
                <span className="golden-time-score-label">ระดับโชคลาภ</span>
                <span className="golden-time-score-value">{goldenTime.luckScore}%</span>
              </div>
              <div className="golden-time-bar-wrap">
                <div className="golden-time-bar" style={{ width: `${goldenTime.luckScore}%` }} />
              </div>

              <blockquote className="golden-time-quote">"{goldenTime.insight}"</blockquote>

              <div className="golden-time-slot">
                <span className="material-symbols-outlined golden-time-clock">schedule</span>
                <div>
                  <div className="golden-time-range">
                    ช่วงเวลาทอง: {goldenTime.startTime} – {goldenTime.endTime}
                  </div>
                  <div className="golden-time-reason">{goldenTime.timeReason}</div>
                </div>
              </div>
            </div>
          )}

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
                {latestLotto.prizes.first?.[0] && (
                  <div className="glo-prize-row prize-first">
                    <span className="prize-label">รางวัลที่ 1</span>
                    <span className="prize-number prize-number-xl">
                      {latestLotto.prizes.first[0]}
                    </span>
                  </div>
                )}
                <div className="glo-prize-sub">
                  {latestLotto.prizes.threeDigitPrefix?.length ? (
                    <div className="glo-prize-item">
                      <span className="prize-label">3 ตัวหน้า</span>
                      <div className="prize-tags">
                        {latestLotto.prizes.threeDigitPrefix.map(n => (
                          <span key={n} className="prize-tag">{n}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {latestLotto.prizes.threeDigitSuffix?.length ? (
                    <div className="glo-prize-item">
                      <span className="prize-label">3 ตัวท้าย</span>
                      <div className="prize-tags">
                        {latestLotto.prizes.threeDigitSuffix.map(n => (
                          <span key={n} className="prize-tag">{n}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {latestLotto.prizes.twoDigit?.[0] && (
                    <div className="glo-prize-item">
                      <span className="prize-label">2 ตัวท้าย</span>
                      <span className="prize-tag prize-tag-gold">
                        {latestLotto.prizes.twoDigit[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
            {stats && (
              <span className="stats-source-tag">
                สถิติสะสม GLO · {stats.periodsAnalyzed} งวด
              </span>
            )}
          </div>

          {statsLoading && <div className="loading-row">กำลังโหลดสถิติจาก GLO...</div>}
          {statsError && <div className="error-row">ไม่สามารถโหลดสถิติได้: {statsError}</div>}

          {!statsLoading && !statsError && stats && (
            <div className="stats-grid">
              {/* 2-digit hot/cold */}
              <div className="stat-card card">
                <h3 className="text-headline-md">2 ตัวท้าย</h3>
                <p className="stat-meta">
                  สถิติสะสม {stats.periodsAnalyzed} งวด
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
