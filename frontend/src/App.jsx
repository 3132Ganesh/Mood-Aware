import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const API = "http://localhost:4000/api"

export default function App() {
  const [dark, setDark]         = useState(false)
  const [tab, setTab]           = useState("dashboard")
  const [snapshot, setSnapshot] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [learning, setLearning] = useState(null)
  const [spotify, setSpotify]   = useState(null)
  const [insights, setInsights] = useState(null)
  const [motivation, setMotivation] = useState(null)
  const [loading, setLoading]   = useState(true)

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

  const bg    = dark ? "#0d0d12" : "#f7f7f5"
  const bg2   = dark ? "#13131c" : "#ffffff"
  const bg3   = dark ? "#1e1e2a" : "#efefec"
  const text  = dark ? "#e8e8f0" : "#1a1a1a"
  const text2 = dark ? "#8888aa" : "#666666"
  const text3 = dark ? "#444465" : "#999999"
  const bord  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"

  const s = {
    app:   { background: bg, color: text, minHeight: "100vh", fontFamily: "'DM Mono', monospace", fontSize: 13 },
    inner: { maxWidth: 920, margin: "0 auto", padding: 16 },
    hdr:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: `0.5px solid ${bord}` },
    logo:  { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 },
    nav:   { display: "flex", gap: 4, flexWrap: "wrap" },
    card:  { background: bg2, border: `0.5px solid ${bord}`, borderRadius: 10, padding: 14, marginBottom: 12 },
    ctitle:{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 500, color: text3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    num:   { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1 },
    sub:   { fontSize: 11, color: text3, marginTop: 4 },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 12 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginBottom: 12 },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 },
    row:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `0.5px solid ${bord}`, fontSize: 12 },
    motiv: { background: bg3, border: `0.5px solid #5b4fff`, borderLeft: "3px solid #5b4fff", borderRadius: 8, padding: "11px 14px", marginBottom: 12, fontSize: 12, lineHeight: 1.7 },
    lcell: { background: bg3, borderRadius: 7, padding: 10, textAlign: "center" },
    tag:   { display: "inline-block", fontSize: 10, padding: "2px 7px", borderRadius: 4, background: bg3, color: text2 },
  }

  const navBtn = (id, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      background: tab === id ? "#5b4fff" : "none",
      color: tab === id ? "#fff" : text2,
      border: `0.5px solid ${tab === id ? "#5b4fff" : bord}`,
      padding: "5px 10px", borderRadius: 6, cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: 11, transition: "all .15s"
    }}>{label}</button>
  )

  const Card = ({ children, style = {} }) => (
    <div style={{ ...s.card, ...style }}>{children}</div>
  )

  const StatCard = ({ title, value, unit = "", color = "#5b4fff", sub = "" }) => (
    <Card>
      <div style={s.ctitle}>{title}</div>
      <div style={{ ...s.num, color }}>{value}<span style={{ fontSize: 13, color: text3 }}>{unit}</span></div>
      {sub && <div style={s.sub}>{sub}</div>}
    </Card>
  )

  const moodChartData = [...moodHistory].reverse().map(m => ({
    date: m.date?.slice(5), mood: m.score
  }))

  const moodColor = (s) => s >= 7 ? "#00c896" : s >= 5 ? "#ffb84d" : "#ff6b6b"

  if (loading) return (
    <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>⟳</div>
        <div style={{ color: text2 }}>Loading your data...</div>
      </div>
    </div>
  )

  return (
    <div style={s.app}>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.hdr}>
          <div style={s.logo}>Mood<span style={{ color: "#5b4fff" }}>Aware</span></div>
          <div style={s.nav}>
            {["dashboard","mood","learning","music","goal","insights"].map(id =>
              navBtn(id, id.charAt(0).toUpperCase() + id.slice(1))
            )}
          </div>
          <button onClick={() => setDark(!dark)} style={{
            background: "none", border: `0.5px solid ${bord}`,
            color: text2, padding: "5px 10px", borderRadius: 6,
            cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace"
          }}>{dark ? "Light" : "Dark"}</button>
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            {motivation && (
              <div style={s.motiv}>
                <strong style={{ color: "#5b4fff" }}>Today</strong> — {motivation.message}
              </div>
            )}
            <div style={s.grid4}>
              <StatCard title="Mood Today" value={snapshot?.mood?.score ?? "—"} unit="/10" color="#ff6b6b" sub="This morning" />
              <StatCard title="7-Day Avg" value={snapshot?.avg?.average ?? "—"} unit="/10" color="#ffb84d" sub="Last 7 entries" />
              <StatCard title="Duo Streak" value={learning?.duolingo?.streak ?? "—"} unit=" 🔥" color="#ffb84d" sub="French + Chess" />
              <StatCard title="Goal Progress" value={snapshot?.progress?.percentage ?? 0} unit="%" color="#00c896" sub="Data Analyst" />
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
                {snapshot?.habits?.length > 0 ? snapshot.habits.map((h, i) => (
                  <div key={i} style={{ ...s.row }}>
                    <span>{h.name}</span>
                    <span style={{ fontSize: 11 }}>{h.completed ? "✅" : "❌"}</span>
                  </div>
                )) : <div style={{ color: text3, fontSize: 12 }}>No habits logged today</div>}
              </Card>
            </div>
            <div style={s.grid2}>
              <Card>
                <div style={s.ctitle}>Top Artists</div>
                {spotify?.recent?.topArtists?.slice(0,3).map((a, i) => (
                  <div key={i} style={{ ...s.row }}>
                    <span style={{ color: text3, marginRight: 8, fontSize: 11 }}>#{a.rank}</span>
                    <span style={{ flex: 1 }}>{a.artist}</span>
                    <span style={{ fontSize: 11, color: text2 }}>{a.estMins}m</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={s.ctitle}>Learning</div>
                <div style={{ ...s.grid3, gap: 8, marginBottom: 0 }}>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#ffb84d" }}>{learning?.duolingo?.streak ?? 0}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Duo Streak</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#00c896" }}>{learning?.leetcode?.solved?.total ?? 0}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>LeetCode</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 18, color: "#5b4fff" }}>{learning?.duolingo?.courses?.[0]?.crowns ?? 0}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Crowns</div></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MOOD */}
        {tab === "mood" && (
          <div>
            <Card>
              <div style={s.ctitle}>14-Day Mood Trend</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={moodChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: text3 }} />
                  <YAxis domain={[0,10]} tick={{ fontSize: 9, fill: text3 }} />
                  <Tooltip contentStyle={{ background: bg2, border: `1px solid #5b4fff`, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="mood" stroke="#5b4fff" strokeWidth={2}
                    dot={(props) => { const { cx, cy, payload } = props; return <circle key={payload.date} cx={cx} cy={cy} r={4} fill={moodColor(payload.mood)} /> }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
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
          </div>
        )}

        {/* LEARNING */}
        {tab === "learning" && (
          <div>
            <div style={s.grid2}>
              <Card>
                <div style={s.ctitle}>Duolingo</div>
                <div style={{ ...s.grid2, gap: 8, marginBottom: 12 }}>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#ffb84d" }}>{learning?.duolingo?.streak}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Day Streak</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#5b4fff" }}>{learning?.duolingo?.totalXP?.toLocaleString()}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Total XP</div></div>
                </div>
                {learning?.duolingo?.courses?.map((c, i) => (
                  <div key={i} style={s.row}><span>{c.language}</span><span style={{ color: text2, fontSize: 11 }}>{c.xp} XP · {c.crowns} crowns</span></div>
                ))}
              </Card>
              <Card>
                <div style={s.ctitle}>LeetCode</div>
                <div style={{ ...s.grid3, gap: 8, marginBottom: 12 }}>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#00c896" }}>{learning?.leetcode?.solved?.easy}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Easy</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#ffb84d" }}>{learning?.leetcode?.solved?.medium}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Medium</div></div>
                  <div style={s.lcell}><div style={{ ...s.num, fontSize: 20, color: "#ff6b6b" }}>{learning?.leetcode?.solved?.hard}</div><div style={{ fontSize: 10, color: text3, marginTop: 2 }}>Hard</div></div>
                </div>
                <div style={s.row}><span>Total solved</span><span style={{ color: "#00c896", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{learning?.leetcode?.solved?.total}</span></div>
                <div style={s.row}><span>Streak</span><span style={{ color: "#ffb84d" }}>{learning?.leetcode?.streak} days</span></div>
                <div style={{ ...s.row, borderBottom: "none" }}><span>Active days</span><span>{learning?.leetcode?.activeDays}</span></div>
              </Card>
            </div>
          </div>
        )}

        {/* MUSIC */}
        {tab === "music" && (
          <div style={s.grid2}>
            <Card>
              <div style={s.ctitle}>Top Artists — Last 4 Weeks</div>
              {spotify?.artists?.map((a, i) => (
                <div key={i} style={s.row}>
                  <span style={{ color: text3, marginRight: 8, fontSize: 11 }}>#{a.rank}</span>
                  <span style={{ flex: 1 }}>{a.name}</span>
                  <span style={s.tag}>{a.genres?.[0] || "various"}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={s.ctitle}>Recent Listening</div>
              <div style={{ textAlign: "center", padding: "14px 0 10px" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 700, color: "#5b4fff" }}>{spotify?.recent?.totalHrs}h</div>
                <div style={{ fontSize: 11, color: text3 }}>total recent time</div>
              </div>
              {spotify?.recent?.topArtists?.map((a, i) => (
                <div key={i} style={s.row}>
                  <span style={{ color: text3, marginRight: 8, fontSize: 11 }}>#{a.rank}</span>
                  <span style={{ flex: 1 }}>{a.artist}</span>
                  <span style={{ fontSize: 11, color: text2 }}>{a.tracks} tracks · {a.estMins}m</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* GOAL */}
        {tab === "goal" && snapshot?.goal && (
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
              <div style={s.ctitle}>Today's Tasks</div>
              {snapshot.tasks?.length > 0 ? snapshot.tasks.map((t, i) => (
                <div key={i} style={{ ...s.row, alignItems: "flex-start" }}>
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
              )) : <div style={{ color: text3, fontSize: 12 }}>No tasks yet — goal phases being set up!</div>}
            </Card>
          </div>
        )}

        {/* INSIGHTS */}
        {tab === "insights" && insights && (
          <Card>
            <div style={s.ctitle}>Patterns From Your Data</div>
            {[
              { icon: "📈", title: "Mood Trend", text: insights.trend?.insight },
              { icon: "💤", title: "Sleep Impact", text: insights.sleep?.insight },
              { icon: "📅", title: "Best Day", text: insights.bestDay?.insight },
              { icon: "🏆", title: "Habits", text: insights.habits?.insight },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 3 ? `0.5px solid ${bord}` : "none" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: text2, lineHeight: 1.6 }}>{item.text || "Need more data"}</div>
                </div>
              </div>
            ))}
          </Card>
        )}

      </div>
    </div>
  )
}