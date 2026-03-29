import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const API = "http://localhost:4000/api"

export default function App() {
  const [dark, setDark]         = useState(false)
  const [tab, setTab]           = useState("dashboard")
  const [slides, setSlides]     = useState({ mood:0, learning:0, music:0, goal:0, insights:0 })
  const [snapshot, setSnapshot] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [learning, setLearning] = useState(null)
  const [spotify, setSpotify]   = useState(null)
  const [insights, setInsights] = useState(null)
  const [motivation, setMotivation] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [goalProgressNotes, setGoalProgressNotes] = useState([])
const [newNote, setNewNote] = useState("")
const [noteSubmitting, setNoteSubmitting] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [snap, mood, learn, spot, ins, mot] = await Promise.all([
        fetch(`${API}/snapshot`).then(r => r.json()),
        fetch(`${API}/mood/history?days=14`).then(r => r.json()),
        fetch(`${API}/learning`).then(r => r.json()),
        fetch(`${API}/spotify`).then(r => r.json()),
        fetch(`${API}/insights`).then(r => r.json()),
        fetch(`${API}/motivation`).then(r => r.json()),
      ])
      setSnapshot(snap); setMoodHistory(mood); setLearning(learn)
      setSpotify(spot); setInsights(ins); setMotivation(mot)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  function goSlide(group, dir, total) {
    setSlides(prev => {
      const next = prev[group] + dir
      return { ...prev, [group]: next < 0 ? total-1 : next >= total ? 0 : next }
    })
  }

  const bg    = dark ? "#0d0d12" : "#f7f7f5"
  const bg2   = dark ? "#13131c" : "#ffffff"
  const bg3   = dark ? "#1e1e2a" : "#efefec"
  const text  = dark ? "#e8e8f0" : "#1a1a1a"
  const text2 = dark ? "#8888aa" : "#666666"
  const text3 = dark ? "#444465" : "#999999"
  const bord  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"

  const s = {
    app:    { background: bg, color: text, minHeight: "100vh", fontFamily: "'DM Mono', monospace", fontSize: 13 },
    inner:  { maxWidth: 960, margin: "0 auto", padding: 16 },
    hdr:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: `0.5px solid ${bord}` },
    logo:   { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 },
    card:   { background: bg2, border: `0.5px solid ${bord}`, borderRadius: 10, padding: 14, marginBottom: 12 },
    ctitle: { fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 500, color: text3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    num:    { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1 },
    row:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `0.5px solid ${bord}`, fontSize: 12 },
    motiv:  { background: bg3, border: `0.5px solid #5b4fff`, borderLeft: "3px solid #5b4fff", borderRadius: 8, padding: "11px 14px", marginBottom: 12, fontSize: 12, lineHeight: 1.7 },
    lcell:  { background: bg3, borderRadius: 7, padding: 10, textAlign: "center" },
    tag:    { display: "inline-block", fontSize: 10, padding: "2px 7px", borderRadius: 4, background: bg3, color: text2 },
    grid4:  { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 12 },
    grid2:  { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginBottom: 12 },
    grid3:  { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 },
  }
  const navBtn = (id, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      background: tab === id ? "#5b4fff" : "none",
      color: tab === id ? "#fff" : text2,
      border: `0.5px solid ${tab === id ? "#5b4fff" : bord}`,
      padding: "5px 10px", borderRadius: 6, cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: 11
    }}>{label}</button>
  )

  const Card = ({ children, style = {} }) => (
    <div style={{ ...s.card, ...style }}>{children}</div>
  )

  const StatCard = ({ title, value, unit = "", color = "#5b4fff", sub = "" }) => (
    <Card>
      <div style={s.ctitle}>{title}</div>
      <div style={{ ...s.num, color }}>{value ?? "—"}<span style={{ fontSize: 13, color: text3 }}>{unit}</span></div>
      {sub && <div style={{ fontSize: 11, color: text3, marginTop: 4 }}>{sub}</div>}
    </Card>
  )

  // Slide navigator component
  const SlideNav = ({ group, total, title }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700 }}>{title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} onClick={() => setSlides(prev => ({ ...prev, [group]: i }))}
              style={{ width: slides[group] === i ? 16 : 6, height: 6, borderRadius: 3, background: slides[group] === i ? "#5b4fff" : bg3, cursor: "pointer", transition: "all .2s" }}
            />
          ))}
        </div>
        <button onClick={() => goSlide(group, -1, total)} style={{ background: "none", border: `0.5px solid ${bord}`, color: text2, width: 24, height: 24, borderRadius: 5, cursor: "pointer", fontSize: 14 }}>‹</button>
        <button onClick={() => goSlide(group, 1, total)} style={{ background: "none", border: `0.5px solid ${bord}`, color: text2, width: 24, height: 24, borderRadius: 5, cursor: "pointer", fontSize: 14 }}>›</button>
      </div>
    </div>
  )

  const moodChartData = [...moodHistory].reverse().map(m => ({ date: m.date?.slice(5), mood: m.score }))
  const moodColor = (s) => s >= 7 ? "#00c896" : s >= 5 ? "#ffb84d" : "#ff6b6b"

  if (loading) return (
    <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #5b4fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <div style={{ color: text2 }}>Loading your data...</div>
      </div>
    </div>
  )

  return (
    <div style={s.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.hdr}>
          <div style={s.logo}>Mood<span style={{ color: "#5b4fff" }}>Aware</span></div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["dashboard","mood","learning","music","goal","progress","insights"].map(id =>
              navBtn(id, id.charAt(0).toUpperCase() + id.slice(1))
            )}
          </div>
          <button onClick={() => setDark(!dark)} style={{
            background: "none", border: `0.5px solid ${bord}`, color: text2,
            padding: "5px 10px", borderRadius: 6, cursor: "pointer",
            fontSize: 11, fontFamily: "'DM Mono', monospace"
          }}>{dark ? "Light" : "Dark"}</button>
        </div>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            {motivation && (
              <div style={s.motiv}>
                <strong style={{ color: "#5b4fff" }}>Today</strong> — {motivation.message}
              </div>
            )}
            <div style={s.grid4}>
              <StatCard title="Mood Today" value={snapshot?.mood?.score} unit="/10" color="#ff6b6b" sub="This morning" />
              <StatCard title="7-Day Avg"  value={snapshot?.avg?.average} unit="/10" color="#ffb84d" sub="Last 7 entries" />
              <StatCard title="Duo Streak" value={learning?.duolingo?.streak} unit=" 🔥" color="#ffb84d" sub="French + Chess" />
              <StatCard title="Goal"       value={snapshot?.progress?.percentage ?? 0} unit="%" color="#00c896" sub="Data Analyst" />
            </div>
            <div style={s.grid2}>
              <Card>
                <div style={s.ctitle}>Mood — Last 7 Days</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={moodChartData.slice(-7)}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: text3 }} />
                    <YAxis domain={[0,10]} tick={{ fontSize: 9, fill: text3 }} />
                    <Tooltip contentStyle={{ background: bg2, border: `1px solid #5b4fff`, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="mood" stroke="#5b4fff" strokeWidth={2} dot={{ fill: "#5b4fff", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <div style={s.ctitle}>Today's Habits</div>
                {snapshot?.habits?.length > 0
                  ? snapshot.habits.map((h, i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < snapshot.habits.length-1 ? `0.5px solid ${bord}` : "none" }}>
                      <span>{h.name}</span>
                      <span>{h.completed ? "✅" : "❌"}</span>
                    </div>
                  ))
                  : <div style={{ color: text3, fontSize: 12 }}>No habits logged today</div>
                }
              </Card>
            </div>
            
            <div style={s.grid2}>
              <Card>
                <div style={s.ctitle}>Top Artists</div>
                {spotify?.recent?.topArtists?.slice(0,3).map((a, i) => (
                  <div key={i} style={{ ...s.row, borderBottom: i < 2 ? `0.5px solid ${bord}` : "none" }}>
                    <span style={{ color: text3, marginRight: 8 }}>#{a.rank}</span>
                    <span style={{ flex: 1 }}>{a.artist}</span>
                    <span style={{ color: text2, fontSize: 11 }}>{a.estMins}m</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={s.ctitle}>Learning</div>
                <div style={{ ...s.grid3, gap: 8, marginBottom: 0 }}>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#ffb84d" }}>{learning?.duolingo?.streak ?? 0}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Duo</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#00c896" }}>{learning?.leetcode?.solved?.total ?? 0}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>LeetCode</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#5b4fff" }}>{learning?.duolingo?.courses?.[0]?.crowns ?? 0}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Crowns</div></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── MOOD (3 slides) ── */}
        {tab === "mood" && (
          <div>
            <SlideNav group="mood" total={3} title="Mood" />

            {slides.mood === 0 && (
              <Card>
                <div style={s.ctitle}>14-Day Trend</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={moodChartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: text3 }} />
                    <YAxis domain={[0,10]} tick={{ fontSize: 9, fill: text3 }} />
                    <Tooltip contentStyle={{ background: bg2, border: `1px solid #5b4fff`, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="mood" stroke="#5b4fff" strokeWidth={2}
                      dot={(props) => { const { cx, cy, payload } = props; return <circle key={payload.date} cx={cx} cy={cy} r={4} fill={moodColor(payload.mood)} /> }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {slides.mood === 1 && (
              <div style={s.grid3}>
                {moodHistory.slice(0,6).map((m, i) => (
                  <Card key={i}>
                    <div style={s.ctitle}>{m.date}</div>
                    <div style={{ ...s.num, color: moodColor(m.score) }}>{m.score}<span style={{ fontSize: 13, color: text3 }}>/10</span></div>
                    <div style={{ fontSize: 11, color: text2, marginTop: 6 }}>{m.emotions || "—"}</div>
                    {m.notes && <div style={{ fontSize: 11, color: text3, marginTop: 4, fontStyle: "italic" }}>"{m.notes}"</div>}
                  </Card>
                ))}
              </div>
            )}

            {slides.mood === 2 && (
              <div style={s.grid2}>
                <Card>
                  <div style={s.ctitle}>This Week vs Last Week</div>
                  {[
                    ["This week avg", `${snapshot?.avg?.average ?? "—"}/10`],
                    ["Highest",       `${snapshot?.avg?.highest ?? "—"}/10`],
                    ["Lowest",        `${snapshot?.avg?.lowest ?? "—"}/10`],
                    ["Total entries", `${snapshot?.avg?.total_entries ?? 0}`],
                  ].map(([l, v], i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < 3 ? `0.5px solid ${bord}` : "none" }}>
                      <span>{l}</span><span style={{ color: "#5b4fff", fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </Card>
                <Card>
                  <div style={s.ctitle}>Emotions This Week</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
                    {[...new Set(moodHistory.flatMap(m => m.emotions?.split(",") || []))].filter(Boolean).map((e, i) => (
                      <span key={i} style={s.tag}>{e.trim()}</span>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ── LEARNING (3 slides) ── */}
        {tab === "learning" && (
          <div>
            <SlideNav group="learning" total={3} title="Learning" />

            {slides.learning === 0 && (
              <div style={s.grid2}>
                <Card>
                  <div style={s.ctitle}>Duolingo</div>
                  <div style={{ ...s.grid2, gap: 8, marginBottom: 12 }}>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#ffb84d" }}>{learning?.duolingo?.streak}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Day Streak</div></div>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#5b4fff" }}>{learning?.duolingo?.totalXP?.toLocaleString()}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Total XP</div></div>
                  </div>
                  {learning?.duolingo?.courses?.map((c, i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < (learning.duolingo.courses.length-1) ? `0.5px solid ${bord}` : "none" }}>
                      <span>{c.language}</span>
                      <span style={{ color: text2, fontSize: 11 }}>{c.xp} XP · {c.crowns} crowns</span>
                    </div>
                  ))}
                </Card>
                <Card>
                  <div style={s.ctitle}>LeetCode</div>
                  <div style={{ ...s.grid3, gap: 8, marginBottom: 12 }}>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#00c896" }}>{learning?.leetcode?.solved?.easy}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Easy</div></div>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#ffb84d" }}>{learning?.leetcode?.solved?.medium}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Medium</div></div>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#ff6b6b" }}>{learning?.leetcode?.solved?.hard}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Hard</div></div>
                  </div>
                  {[
                    ["Total solved", learning?.leetcode?.solved?.total, "#00c896"],
                    ["Streak", `${learning?.leetcode?.streak} days`, "#ffb84d"],
                    ["Active days", learning?.leetcode?.activeDays, null],
                  ].map(([l, v, c], i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < 2 ? `0.5px solid ${bord}` : "none" }}>
                      <span>{l}</span><span style={{ color: c || text, fontWeight: c ? 700 : 400, fontFamily: c ? "'Syne', sans-serif" : "inherit" }}>{v}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {slides.learning === 1 && (
              <div style={s.grid2}>
                <Card>
                  <div style={s.ctitle}>Sweatcoin</div>
                  <div style={{ ...s.grid3, gap: 8, marginBottom: 12 }}>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#00c896" }}>8,432</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Steps</div></div>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#ffb84d" }}>8.4</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Coins</div></div>
                    <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#5b4fff" }}>7,912</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>7d Avg</div></div>
                  </div>
                  <div style={{ fontSize: 11, color: text3, marginBottom: 5 }}>Steps toward 10,000 goal</div>
                  <div style={{ background: bg3, borderRadius: 4, height: 7 }}>
                    <div style={{ width: "84%", height: 7, borderRadius: 4, background: "#00c896" }} />
                  </div>
                  <div style={{ fontSize: 11, color: text2, marginTop: 4, textAlign: "right" }}>8,432 / 10,000</div>
                </Card>
                <Card>
                  <div style={s.ctitle}>GeeksForGeeks</div>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: 12, color: text3 }}>meghavathgamubb</div>
                    <div style={{ marginTop: 12, fontSize: 11, color: text2, lineHeight: 1.8 }}>
                      No practice problems solved yet.<br />
                      Start solving to see stats here.<br />
                      DSA 360 course enrolled!
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 6, justifyContent: "center" }}>
                      <span style={s.tag}>DSA 360</span>
                      <span style={s.tag}>Aptitude</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {slides.learning === 2 && (
              <Card>
                <div style={s.ctitle}>All Platform Stats</div>
                {[
                  ["Duolingo Streak",  `${learning?.duolingo?.streak ?? 0} days`, "#ffb84d"],
                  ["Duolingo XP",      `${learning?.duolingo?.totalXP?.toLocaleString() ?? 0}`, "#5b4fff"],
                  ["French Crowns",    `${learning?.duolingo?.courses?.[0]?.crowns ?? 0}`, "#5b4fff"],
                  ["LeetCode Solved",  `${learning?.leetcode?.solved?.total ?? 0} problems`, "#00c896"],
                  ["LeetCode Streak",  `${learning?.leetcode?.streak ?? 0} days`, "#ffb84d"],
                  ["GFG Problems",     "0 (not started yet)", text3],
                  ["Sweatcoin Steps",  "8,432 today", "#00c896"],
                ].map(([l, v, c], i) => (
                  <div key={i} style={{ ...s.row, borderBottom: i < 6 ? `0.5px solid ${bord}` : "none" }}>
                    <span>{l}</span>
                    <span style={{ color: c, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ── MUSIC (3 slides) ── */}
        {tab === "music" && (
          <div>
            <SlideNav group="music" total={3} title="Music" />

            {slides.music === 0 && (
              <div style={s.grid2}>
                <Card>
                  <div style={s.ctitle}>Top Artists — Last 4 Weeks</div>
                  {spotify?.artists?.map((a, i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < (spotify.artists.length-1) ? `0.5px solid ${bord}` : "none" }}>
                      <span style={{ color: text3, marginRight: 8 }}>#{a.rank}</span>
                      <span style={{ flex: 1 }}>{a.name}</span>
                      <span style={s.tag}>{a.genres?.[0] || "various"}</span>
                    </div>
                  ))}
                </Card>
                <Card>
                  <div style={s.ctitle}>Recent Listening</div>
                  <div style={{ textAlign: "center", padding: "12px 0 10px" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 700, color: "#5b4fff" }}>{spotify?.recent?.totalHrs}h</div>
                    <div style={{ fontSize: 11, color: text3 }}>total recent time</div>
                  </div>
                  {spotify?.recent?.topArtists?.map((a, i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < (spotify.recent.topArtists.length-1) ? `0.5px solid ${bord}` : "none" }}>
                      <span style={{ color: text3, marginRight: 8 }}>#{a.rank}</span>
                      <span style={{ flex: 1 }}>{a.artist}</span>
                      <span style={{ fontSize: 11, color: text2 }}>{a.tracks} tracks · {a.estMins}m</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {slides.music === 1 && (
              <Card>
                <div style={s.ctitle}>Genre Breakdown</div>
                {[
                  ["Bollywood",  45, "#5b4fff"],
                  ["Hindi Pop",  25, "#ff6b6b"],
                  ["Tamil Pop",  18, "#ffb84d"],
                  ["Telugu Pop", 12, "#00c896"],
                ].map(([genre, pct, color], i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{genre}</span><span style={{ color }}>{pct}%</span>
                    </div>
                    <div style={{ background: bg3, borderRadius: 3, height: 6 }}>
                      <div style={{ width: `${pct}%`, height: 6, borderRadius: 3, background: color }} />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {slides.music === 2 && (
              <Card>
                <div style={s.ctitle}>Mood vs Music Patterns</div>
                {[
                  { icon: "🎵", title: "Low mood days", text: "Arijit Singh + Jeet Gannguli dominate. Emotional Hindi music spikes when mood drops below 5." },
                  { icon: "🎶", title: "High mood days", text: "Devi Sri Prasad + Pritam energetic tracks. Telugu pop correlates with 7+ mood scores." },
                  { icon: "🎧", title: "Focus sessions", text: "A.R. Rahman instrumentals appear during study/coding. Avg 45 min listen time." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `0.5px solid ${bord}` : "none" }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: text2, lineHeight: 1.6 }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ── GOAL (3 slides) ── */}
        {tab === "goal" && (
          <div>
            <SlideNav group="goal" total={3} title="Goal Engine" />

            {slides.goal === 0 && snapshot?.goal && (
              <div>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700 }}>{snapshot.goal.title}</div>
                      <div style={{ fontSize: 11, color: text3, marginTop: 3 }}>Target: {snapshot.goal.target_date}</div>
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 700, color: "#5b4fff" }}>
                      {snapshot.progress?.percentage ?? 0}%
                    </div>
                  </div>
                  <div style={{ background: bg3, borderRadius: 4, height: 7 }}>
                    <div style={{ width: `${snapshot.progress?.percentage ?? 0}%`, height: 7, borderRadius: 4, background: "#5b4fff" }} />
                  </div>
                </Card>
                {motivation && (
                  <div style={s.motiv}><strong style={{ color: "#5b4fff" }}>Motivation</strong> — {motivation.message}</div>
                )}
                <Card>
                  <div style={s.ctitle}>Your Learning Profile</div>
                  {[
                    ["Daily capacity", "45 mins/day"],
                    ["Best mood day",  "Friday"],
                    ["Existing skills","SQL + consistent learning"],
                    ["SQL phase",      "1 week (already known!)"],
                  ].map(([l, v], i) => (
                    <div key={i} style={{ ...s.row, borderBottom: i < 3 ? `0.5px solid ${bord}` : "none" }}>
                      <span>{l}</span><span style={{ color: "#00c896", fontSize: 11 }}>{v}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {slides.goal === 1 && (
              <Card>
                <div style={s.ctitle}>Roadmap — 6 Phases</div>
                {[
                  ["Phase 1", "Python Foundations",    "4 weeks", true],
                  ["Phase 2", "Statistics & Math",     "3 weeks", false],
                  ["Phase 3", "SQL & Data Wrangling",  "1 week",  false],
                  ["Phase 4", "Data Visualization",    "2 weeks", false],
                  ["Phase 5", "Real Projects",         "3 weeks", false],
                  ["Phase 6", "Job Ready",             "2 weeks", false],
                ].map(([p, title, dur, active], i) => (
                  <div key={i} style={{ ...s.row, borderBottom: i < 5 ? `0.5px solid ${bord}` : "none" }}>
                    <span style={{ color: active ? "#5b4fff" : text3, minWidth: 60 }}>{p}</span>
                    <span style={{ flex: 1, marginLeft: 10, color: active ? text : text2 }}>{title}</span>
                    <span style={{ fontSize: 11, color: active ? "#00c896" : text3 }}>{dur}</span>
                  </div>
                ))}
              </Card>
            )}

            {slides.goal === 2 && (
              <Card>
                <div style={s.ctitle}>Today's Tasks</div>
                {snapshot?.tasks?.length > 0 ? snapshot.tasks.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < snapshot.tasks.length-1 ? `0.5px solid ${bord}` : "none" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5b4fff", marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12 }}>{t.title}</div>
                      <div style={{ fontSize: 10, color: text3, marginTop: 2 }}>⏱️ {t.estimated_mins} mins · {t.difficulty}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 7px", borderRadius: 4,
                      background: t.difficulty === "hard" ? "rgba(255,107,107,.12)" : t.difficulty === "medium" ? "rgba(255,184,77,.12)" : "rgba(0,200,150,.12)",
                      color: t.difficulty === "hard" ? "#ff6b6b" : t.difficulty === "medium" ? "#ffb84d" : "#00c896"
                    }}>{t.difficulty}</span>
                  </div>
                )) : <div style={{ color: text3, fontSize: 12 }}>No tasks yet — run set_goal in MCP server first!</div>}
              </Card>
            )}
          </div>
        )}

        {/* ── INSIGHTS (3 slides) ── */}
        {tab === "insights" && insights && (
          <div>
            <SlideNav group="insights" total={3} title="Insights" />

            {slides.insights === 0 && (
              <Card>
                <div style={s.ctitle}>Mood Patterns</div>
                {[
                  { icon: "📈", title: "Trend", text: insights.trend?.insight },
                  { icon: "📅", title: "Best Day", text: insights.bestDay?.insight },
                  { icon: "💤", title: "Sleep Impact", text: insights.sleep?.insight },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `0.5px solid ${bord}` : "none" }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: text2, lineHeight: 1.6 }}>{item.text || "Need more data"}</div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {slides.insights === 1 && (
              <Card>
                <div style={s.ctitle}>Habit & Learning Patterns</div>
                {[
                  { icon: "🏆", title: "Habit Impact", text: insights.habits?.insight },
                  { icon: "🦉", title: "Learning Consistency", text: `211-day streak = you learn best in daily short bursts. Goal engine set to 45 mins/day to match your pace.` },
                  { icon: "💻", title: "LeetCode Pattern", text: `31 easy + 7 medium solved. Strong foundation. Ready to push into medium territory consistently.` },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `0.5px solid ${bord}` : "none" }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: text2, lineHeight: 1.6 }}>{item.text || "Need more data"}</div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {slides.insights === 2 && (
              <Card>
                <div style={s.ctitle}>Weekly Report Summary</div>
                {[
                  ["Mood this week",    `${snapshot?.avg?.average ?? "—"}/10`],
                  ["Habits completed",  "12 (vs 8 last week)"],
                  ["Duolingo streak",   `${learning?.duolingo?.streak ?? "—"} days alive`],
                  ["LeetCode solved",   `${learning?.leetcode?.solved?.total ?? 0} problems`],
                  ["Best day",          insights.bestDay?.bestDay || "—"],
                ].map(([l, v], i) => (
                  <div key={i} style={{ ...s.row, borderBottom: i < 4 ? `0.5px solid ${bord}` : "none" }}>
                    <span>{l}</span>
                    <span style={{ color: "#5b4fff", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: 10, background: bg3, borderRadius: 7, fontSize: 11, color: text2, lineHeight: 1.6 }}>
                  <strong style={{ color: "#5b4fff" }}>Verdict</strong> — Habits held strong even during a rough mood week. That's resilience. Keep the streaks alive next week.
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── GOAL PROGRESS NOTEPAD ── */}
{tab === "progress" && (
  <div>
    <Card>
      <div style={s.ctitle}>Add Progress Note</div>
      <textarea
  value={newNote}
  onChange={(e) => setNewNote(e.target.value)}
  placeholder="What's your progress today? What did you learn?"
  style={{
    width: "100%", 
    padding: 12, 
    borderRadius: 6, 
    border: `0.5px solid ${bord}`,
    background: bg3, 
    color: text, 
    fontFamily: "'DM Mono', monospace", 
    fontSize: 12,
    resize: "vertical", 
    minHeight: 80, 
    boxSizing: "border-box"
  }}
/>
      <button
        onClick={async () => {
          if (!newNote.trim()) return
          setNoteSubmitting(true)
          try {
            await fetch(`${API}/goal-progress`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ note: newNote, mood_score: null })
            })
            setNewNote("")
            const res = await fetch(`${API}/goal-progress`)
            const data = await res.json()
            setGoalProgressNotes(data.notes || [])
          } catch(e) { console.error(e) }
          setNoteSubmitting(false)
        }}
        style={{
          marginTop: 10, background: "#5b4fff", color: "#fff", border: "none",
          padding: "8px 14px", borderRadius: 6, cursor: "pointer",
          fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700
        }}
        disabled={noteSubmitting}
      >
        {noteSubmitting ? "Saving..." : "Save Note"}
      </button>
    </Card>

    <Card>
      <div style={s.ctitle}>All Progress Notes</div>
      {goalProgressNotes.length > 0 ? (
        goalProgressNotes.map((note, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < goalProgressNotes.length-1 ? `0.5px solid ${bord}` : "none" }}>
            <div style={{ fontSize: 11, color: text3, marginBottom: 4 }}>{note[2]}</div>
            <div style={{ fontSize: 12, color: text, marginBottom: 4 }}>{note[3]}</div>
            {note[4] && <div style={{ fontSize: 10, color: text2 }}>Mood: {note[4]}/10</div>}
          </div>
        ))
      ) : (
        <div style={{ color: text3, fontSize: 12 }}>No notes yet. Start tracking!</div>
      )}
    </Card>
  </div>
)}

      </div>
    </div>
  )
}