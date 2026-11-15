/// <reference types="vite/client" />
import { StrictMode, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  BODIES, BODY_IDS, CATS, FACTS, FACT_ROWS, GROUPS, PAIR_NOTES, TERRAIN_NOTES, pairKey,
  CANDIDATE_CRITERIA, DIRECTIONS, getCandidateSite, sitesForBody,
  bestPair, compareSites, criterionValue, directionMatrix, formatCriterionValue, similarityTone,
  defaultWeights, gravity, interpolate, mt, scoreColors, scoreKeys, siteData, siteName,
  FIELD_PHOTOS, BODY_PHOTOS,
  LangContext, ThemeContext, patchParams, readParam,
  type BodyId, type Cat, type Group, type CandidateSite,
  type MissionSite, type MissionTarget, type SiteId, type Lang, type Theme,
} from "./data";
import { Bi, pick, useLang } from "./data";
import { Globe, FlatMap, type Focus, type GlobeApi, type MarkerSpec, BODY_RADIUS_KM, angDist, fmtCoord } from "./engine";
import heroEarth from "./assets/hero-earth.jpg";
import moonTexture from "./assets/moon.jpg";

// ===== sections =====
// ===== components/Header.tsx =====
export function Header({ lang, onLangChange, theme, onThemeChange }: { lang: Lang; onLangChange: (lang: Lang) => void; theme: "dark" | "light"; onThemeChange: (theme: "dark" | "light") => void }) {
  const [open, setOpen] = useState(false);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeLabel = lang === "ar" ? (nextTheme === "light" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن") : (nextTheme === "light" ? "Switch to light mode" : "Switch to dark mode");
  const links = [
    { href: "#twin-finder", label: lang === "ar" ? "مستكشف التوائم" : "Twin Explorer" },
    { href: "#candidate-sites", label: lang === "ar" ? "أماكن مرشحة" : "Candidate Sites" },
    { href: "#mission-lab", label: mt(lang, "navLab") },
    { href: "#worlds", label: lang === "ar" ? "العوالم" : "Worlds" },
    { href: "#missions", label: mt(lang, "navMissions") },
  ];
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label={lang === "ar" ? "تيرا توين — الرئيسية" : "Tera Twin home"} onClick={() => setOpen(false)}>
        <span className="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="16" r="7" fill="currentColor" opacity=".9"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".55" transform="rotate(-18 16 16)"/><circle cx="27" cy="10" r="2" fill="currentColor"/></svg>
        </span>
        <span className="brand-text"><span className="brand-mark">TERA TWIN</span>
        <span className="brand-caption">{lang === "ar" ? "استكشاف الكون" : "EXPLORING THE UNIVERSE"}</span></span>
      </a>
      <nav className={`site-nav ${open ? "is-open" : ""}`} aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="nav-cta" href="#twin-finder" onClick={() => setOpen(false)}>
          <span>{mt(lang, "navDiscover")}</span> <span aria-hidden="true">↗</span>
        </a>
      </nav>
      <div className="header-actions">
        <button className="theme-toggle" type="button" onClick={() => onThemeChange(nextTheme)} aria-label={themeLabel} title={themeLabel} aria-pressed={theme === "light"}>
          <span className="theme-icon" aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="theme-text">{lang === "ar" ? (nextTheme === "light" ? "فاتح" : "داكن") : (nextTheme === "light" ? "Light" : "Dark")}</span>
        </button>
        <button className="language-toggle header-language" type="button" onClick={() => onLangChange(lang === "en" ? "ar" : "en")} aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
          {lang === "ar" ? "EN" : "العربية"}
        </button>
        <button className="menu-toggle" type="button" aria-label={open ? (lang === "ar" ? "إغلاق القائمة" : "Close navigation") : (lang === "ar" ? "فتح القائمة" : "Open navigation")} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}


// ===== components/Hero.tsx =====
export function Hero() {
  const lang = useLang();
  const ar = lang === "ar";
  return (
    <>
    <section className="hero" id="home">
      <div className="hero-image" style={{ backgroundImage: `url(${heroEarth})` }} role="img" aria-label={ar ? "الأرض من الفضاء" : "Earth seen from space"} />
      <div className="hero-shade" />
      <div className="hero-content hero-grid">
        <div className="hero-main">
          <p className="hero-badge"><span className="status-dot" /> {mt(lang, "heroEyebrow")}</p>
          <h1>
            {ar ? (<>موطن واحد.<br /><em>آفاق</em> لا تنتهي.</>) : (<>One home.<br /><em>Endless</em> horizons.</>)}
          </h1>
          <p className="hero-copy">{mt(lang, "heroCopy")}</p>
          <div className="hero-actions">
            <a className="button button-light" href="#twin-finder"><span>{ar ? "ابدأ الاستكشاف" : "Begin exploring"}</span> <span aria-hidden="true">↓</span></a>
            <a className="button button-ghost" href="#mission-lab"><span>{mt(lang, "navLab")}</span> <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-chips" aria-label={ar ? "العوالم المدعومة" : "Supported worlds"}>
            <span>{ar ? "الأرض" : "Earth"}</span><span>{ar ? "المريخ" : "Mars"}</span><span>{ar ? "القمر" : "Moon"}</span>
          </div>
        </div>
        <aside className="hero-console" aria-label={ar ? "لوحة المفاهيم" : "Concept console"}>
          <div className="console-head"><span>{ar ? "وحدة الاستكشاف" : "EXPLORATION UNIT"}</span><span className="console-live"><i />{ar ? "نشط" : "LIVE"}</span></div>
          <div className="console-orbit" aria-hidden="true">
            <span className="console-sun" />
            <span className="console-ring ring-a"><i className="planet planet-earth" /></span>
            <span className="console-ring ring-b"><i className="planet planet-mars" /></span>
            <span className="console-ring ring-c"><i className="planet planet-moon" /></span>
          </div>
          <div className="hero-metrics console-metrics" aria-label={ar ? "نطاق المنصة" : "Platform scope"}>
            <div className="hero-metric"><b>3</b><span>{ar ? "عوالم" : "Worlds"}</span></div>
            <div className="hero-metric"><b>6</b><span>{ar ? "اتجاهات" : "Directions"}</span></div>
            <div className="hero-metric"><b>7</b><span>{ar ? "معايير" : "Criteria"}</span></div>
          </div>
          <p className="console-note">{ar ? "صور مشتقة من ناسا · مقارنة توضيحية" : "NASA-derived imagery · illustrative comparison"}</p>
        </aside>
      </div>
      <div className="hero-coordinate"><span>{mt(lang, "heroCoordinate")}</span><span dir="ltr">28° 32′ 53.1″ N&nbsp; 80° 39′ 2.6″ W</span></div>
      <span className="orbit orbit-one" aria-hidden="true" /><span className="orbit orbit-two" aria-hidden="true" />
    </section>
    <section className="concept-strip section-wrap" aria-label={ar ? "ماذا يقدم الموقع" : "What the platform offers"}>
      {[
        { href: "#twin-finder", n: "01", title: ar ? "مستكشف التوائم" : "Twin Explorer", desc: ar ? "قارن تضاريس الأرض والمريخ والقمر واعثر على النظائر الجغرافية." : "Compare terrain across Earth, Mars and the Moon and find geographical twins." },
        { href: "#candidate-sites", n: "02", title: ar ? "أماكن مرشحة" : "Candidate Sites", desc: ar ? "قارن مواقع افتراضية عبر 6 اتجاهات و7 معايير بيئية." : "Compare hypothetical sites across 6 directions and 7 environment criteria." },
        { href: "#mission-lab", n: "03", title: ar ? "مختبر المهمات" : "Mission Lab", desc: ar ? "رتّب المواقع الميدانية، اضبط الأوزان، وصدّر تقرير مهمة." : "Rank field sites, tune weights, and export a mission report." },
      ].map((c) => (
        <a key={c.href} className="concept-card" href={c.href}>
          <span className="concept-n">{c.n}</span>
          <span className="concept-body"><strong>{c.title}</strong><small>{c.desc}</small></span>
          <span className="concept-arrow" aria-hidden="true">→</span>
        </a>
      ))}
    </section>
    </>
  );
}


// ===== components/TerrainExplorer.tsx =====
type View = "globe" | "map";
type Sel = { id: string; stage: 1 | 2 };

function Chevron() {
  return (
    <svg className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text)]" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, children }: { label: [string, string]; children: ReactNode }) {
  return (
    <label className="block min-w-[150px] flex-1">
      <span className="mb-1 flex items-baseline gap-2 text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">
        <Bi t={label} inline />
      </span>
      <span className="relative block">{children}</span>
    </label>
  );
}

const selectCls =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--panel-2)] px-3 py-2.5 pe-8 text-[15px] font-semibold text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)] hover:border-[var(--accent)]";

function Panel({
  tag,
  body,
  view,
  onView,
  grid,
  markers,
  focus,
  onPick,
}: {
  tag: [string, string];
  body: BodyId;
  view: View;
  onView: (v: View) => void;
  grid: boolean;
  markers: MarkerSpec[];
  focus: Focus | null;
  onPick: (lat: number, lon: number, tol: number) => void;
}) {
  const api = useRef<GlobeApi | null>(null);
  const lang = useLang();
  const b = BODIES[body];
  const btn =
    "grid h-8 min-w-8 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel-2)]/90 px-2 text-sm font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--panel-2)] active:scale-95";
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-[0_20px_60px_rgba(0,0,0,.5)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="flex items-baseline gap-2 text-[11px] uppercase tracking-[.16em]">
          <span className="text-[var(--muted)]">
            <Bi t={tag} inline />
          </span>
          <span className="text-base font-extrabold tracking-wide" style={{ color: b.accent }}>
            {pick(lang, b.name)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex overflow-hidden rounded-md border border-[var(--line)] text-[11px] font-bold">
            {(["globe", "map"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => onView(v)}
                className={`px-2.5 py-1.5 transition ${view === v ? "bg-[var(--accent)] text-white" : "bg-[var(--panel-2)] text-[var(--text)] hover:bg-[var(--panel-2)]"}`}
                aria-pressed={view === v}
              >
                {v === "globe" ? pick(lang, ["3D", "كرة"]) : pick(lang, ["Map", "خريطة"])}
              </button>
            ))}
          </div>
          <button className={btn} onClick={() => api.current?.zoom(0.6)} aria-label={pick(lang, ["Zoom in", "تكبير"])} title={pick(lang, ["Zoom in", "تكبير"])}>
            +
          </button>
          <button className={btn} onClick={() => api.current?.zoom(1.6)} aria-label={pick(lang, ["Zoom out", "تصغير"])} title={pick(lang, ["Zoom out", "تصغير"])}>
            −
          </button>
          <button className={`${btn} text-[11px]`} onClick={() => api.current?.reset()}>
            {pick(lang, ["Reset", "إعادة"])}
          </button>
        </div>
      </div>
      <div className="relative aspect-square max-h-[560px] w-full bg-[var(--space)]">
        {view === "globe" ? (
          <Globe key={`g-${body}`} body={body} grid={grid} markers={markers} focus={focus} onPick={onPick} apiRef={api} />
        ) : (
          <FlatMap key={`m-${body}`} body={body} grid={grid} markers={markers} focus={focus} onPick={onPick} apiRef={api} />
        )}
        <div className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-[var(--muted)]">
          <Bi t={["Drag · scroll to zoom · click a place", "اسحب · العجلة للتكبير · اضغط على مكان"]} inline />
        </div>
      </div>
    </section>
  );
}

function EntryCard({ g, body, accent }: { g: Group; body: BodyId; accent: string }) {
  const en = g[body];
  const cat = CATS[g.cat];
  if (!en)
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--text)]">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
          <Bi t={BODIES[body].name} inline />
        </div>
        <Bi t={["No matching place on this world in our atlas yet.", "لا يوجد مكان مشابه على هذا العالم في أطلسنا حتى الآن."]} />
      </div>
    );
  return (
    <div className="rounded-xl border bg-[var(--panel)] p-4" style={{ borderColor: cat.color + "88" }}>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
        <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: cat.color }} />
        <Bi t={BODIES[body].name} inline />
      </div>
      <Bi t={en.name} className="font-display text-xl font-bold text-[var(--text-strong)]" />
      <div className="mt-2 inline-block rounded-md px-2 py-1 text-[12px] font-semibold text-[var(--text-strong)]" style={{ background: cat.color + "26", border: `1px solid ${cat.color}66` }}>
        <Bi t={en.stat} />
      </div>
      <Bi t={en.desc} className="mt-2 text-sm leading-relaxed text-[var(--text)]" />
      <div className="mt-2 font-mono text-[11px] text-[var(--muted)]" dir="ltr">{fmtCoord(en.lat, en.lon)}</div>
    </div>
  );
}

export function TerrainExplorer() {
  const lang = useLang();
  const [from, setFrom] = useState<BodyId>("mars");
  const [to, setTo] = useState<BodyId>("earth");
  const [profile, setProfile] = useState<"all" | Cat>("all");
  const [mode, setMode] = useState<0 | 1 | 2>(0);
  const [grid, setGrid] = useState(true);
  const [views, setViews] = useState<{ from: View; to: View }>({ from: "globe", to: "globe" });
  const [sel, setSel] = useState<Sel | null>(null);
  const [pin, setPin] = useState<{ body: BodyId; lat: number; lon: number } | null>(null);
  const [toast, setToast] = useState<null | { body: BodyId; lat: number; lon: number; near?: { g: Group; km: number } }>(null);
  const [focus, setFocus] = useState<{ from: Focus | null; to: Focus | null }>({ from: null, to: null });
  const nonce = useRef(1);

  const visible = useMemo(() => GROUPS.filter((g) => profile === "all" || g.cat === profile), [profile]);
  const selG = sel ? GROUPS.find((g) => g.id === sel.id) ?? null : null;

  const choose = (g: Group, fromClick = false) => {
    setToast(null);
    if (!fromClick) setPin(null);
    setSel((s) => (s && s.id === g.id ? { id: g.id, stage: 2 } : { id: g.id, stage: 1 }));
    const n = nonce.current++;
    const f = g[from];
    const t = g[to];
    setFocus({
      from: f ? { lat: f.lat, lon: f.lon, nonce: n } : null,
      to: t ? { lat: t.lat, lon: t.lon, nonce: n } : null,
    });
  };

  const handlePick = (body: BodyId, lat: number, lon: number, tol: number) => {
    let best: { g: Group; d: number } | null = null;
    for (const g of visible) {
      const en = g[body];
      if (!en) continue;
      const d = angDist(lat, lon, en.lat, en.lon);
      if (!best || d < best.d) best = { g, d };
    }
    setPin({ body, lat, lon });
    if (best && best.d <= Math.max(tol, 1.6)) {
      choose(best.g, true);
    } else {
      setToast({
        body,
        lat,
        lon,
        near: best ? { g: best.g, km: Math.round(((best.d * Math.PI) / 180) * BODY_RADIUS_KM[body]) } : undefined,
      });
    }
  };

  const markersFor = (body: BodyId): MarkerSpec[] => {
    const out: MarkerSpec[] = [];
    if (mode >= 1) {
      for (const g of visible) {
        const en = g[body];
        if (!en || (selG && g.id === selG.id)) continue;
        out.push({
          id: g.id,
          lat: en.lat,
          lon: en.lon,
          color: CATS[g.cat].color,
          kind: "dim",
          title: mode === 2 ? en.name : undefined,
        });
      }
    }
    if (selG && sel) {
      const en = selG[body];
      if (en)
        out.push({
          id: selG.id,
          lat: en.lat,
          lon: en.lon,
          color: CATS[selG.cat].color,
          kind: "active",
          title: sel.stage === 1 ? en.name : undefined,
          card: sel.stage === 2 ? { name: en.name, stat: en.stat, desc: en.desc, coords: fmtCoord(en.lat, en.lon) } : undefined,
        });
    }
    if (pin && pin.body === body) out.push({ id: "pin", lat: pin.lat, lon: pin.lon, color: "#fff", kind: "pin" });
    return out;
  };

  const setFromSafe = (b: BodyId) => {
    if (b === to) setTo(from);
    setFrom(b);
    reset();
  };
  const setToSafe = (b: BodyId) => {
    if (b === from) setFrom(to);
    setTo(b);
    reset();
  };
  const swap = () => {
    setFrom(to);
    setTo(from);
    reset();
  };
  const reset = () => {
    setSel(null);
    setPin(null);
    setToast(null);
    setFocus({ from: null, to: null });
  };

  const btnLabel: [string, string] =
    mode === 0
      ? ["Show similar places", "أظهر الأماكن المتشابهة"]
      : mode === 1
        ? ["Show details", "أظهر التفاصيل"]
        : ["Hide places", "إخفاء الأماكن"];

  const key = pairKey(from, to);
  const catList = Object.keys(CATS) as Cat[];

  return (
    <section className="twin-finder section-wrap" id="twin-finder" aria-labelledby="twin-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="status-dot" /> <Bi t={["Planetary surface comparison", "مقارنة أسطح الكواكب"]} inline /></p>
          <h2 id="twin-title"><Bi t={["Find a", "اكتشف"]} inline /> <em><Bi t={["geographical twin.", "النظير الجغرافي."]} inline /></em></h2>
        </div>
        <Bi
          t={[
            "Pick a place on one world, choose an environment profile, and explore its analog on another. Basemaps use NASA-derived imagery; twin matches are illustrative examples, not a scientific similarity score.",
            "اختر مكاناً على عالم ما، وحدّد نوع التضاريس، ثم اكتشف نظيره على عالم آخر. الخرائط مشتقة من صور ناسا؛ والتوائم أمثلة توضيحية وليست درجة تشابه علمية.",
          ]}
          className="section-intro"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)]/90 p-4 backdrop-blur">
        <Field label={["From", "من"]}>
          <select className={selectCls} value={from} onChange={(e) => setFromSafe(e.target.value as BodyId)}>
            {BODY_IDS.map((b) => (
              <option key={b} value={b}>{pick(lang, BODIES[b].name)}</option>
            ))}
          </select>
          <Chevron />
        </Field>
        <button onClick={swap} title={pick(lang, ["Swap", "تبديل"])} aria-label={pick(lang, ["Swap worlds", "تبديل العالمين"])} className="mb-0.5 grid h-[44px] w-11 place-items-center rounded-lg border border-[var(--line)] bg-[var(--panel-2)] text-lg text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--panel-2)]">
          ⇄
        </button>
        <Field label={["To", "إلى"]}>
          <select className={selectCls} value={to} onChange={(e) => setToSafe(e.target.value as BodyId)}>
            {BODY_IDS.map((b) => (
              <option key={b} value={b}>{pick(lang, BODIES[b].name)}</option>
            ))}
          </select>
          <Chevron />
        </Field>
        <Field label={["Terrain profile", "نوع التضاريس"]}>
          <select className={selectCls} value={profile} onChange={(e) => setProfile(e.target.value as "all" | Cat)}>
            <option value="all">{pick(lang, ["All profiles", "كل الأنواع"])}</option>
            {catList.map((c) => (
              <option key={c} value={c}>{pick(lang, CATS[c].name)}</option>
            ))}
          </select>
          <Chevron />
        </Field>
        <button
          onClick={() => setGrid((g) => !g)}
          aria-pressed={grid}
          className={`h-[44px] rounded-lg border px-4 text-sm font-bold transition ${grid ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)] bg-[var(--panel-2)] text-[var(--text)]"}`}
        >
          <Bi t={[`Grid: ${grid ? "on" : "off"}`, `الشبكة: ${grid ? "مفعّلة" : "متوقفة"}`]} inline />
        </button>
        <button
          onClick={() => setMode((m) => ((m + 1) % 3) as 0 | 1 | 2)}
          className="h-[44px] rounded-lg bg-gradient-to-b from-sky-500 to-blue-600 px-5 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(37,99,235,.45)] transition hover:brightness-110 active:scale-[.98]"
        >
          <Bi t={btnLabel} inline />
        </button>
      </div>

      <ol className="mt-3 grid gap-2 text-[12px] text-[var(--text)] sm:grid-cols-3">
        {[
          ["Press “Show similar places” – every look-alike region appears with a coloured marker.", "اضغط «أظهر الأماكن المتشابهة» لتظهر كل المناطق المتشابهة بعلامة ملونة."],
          ["Press again – names and key numbers are written above each place.", "اضغط مرة ثانية لتظهر أسماء الأماكن وأهم أرقامها فوق كل مكان."],
          ["Click any place on a globe or map – its twin glows on the other world. Click again for full details.", "اضغط على أي مكان في الكرة أو الخريطة ليتوهج توأمه في العالم الآخر. اضغط مرة أخرى للتفاصيل الكاملة."],
        ].map((s, i) => (
          <li key={i} className="flex gap-2.5 rounded-xl border border-[var(--line-soft)] bg-[var(--panel)] p-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-extrabold text-[var(--accent)]">{i + 1}</span>
            <Bi t={s as [string, string]} />
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel tag={["From", "من"]} body={from} view={views.from} onView={(v) => setViews((s) => ({ ...s, from: v }))} grid={grid} markers={markersFor(from)} focus={focus.from} onPick={(la, lo, t) => handlePick(from, la, lo, t)} />
        <Panel tag={["To", "إلى"]} body={to} view={views.to} onView={(v) => setViews((s) => ({ ...s, to: v }))} grid={grid} markers={markersFor(to)} focus={focus.to} onPick={(la, lo, t) => handlePick(to, la, lo, t)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="me-1 text-[10px] uppercase tracking-widest text-[var(--muted)]"><Bi t={["Legend", "الألوان"]} inline /></span>
        {catList.map((c) => (
          <button
            key={c}
            onClick={() => setProfile((p) => (p === c ? "all" : c))}
            aria-pressed={profile === c}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${profile === c ? "bg-[var(--hover)]" : "bg-[var(--panel)] hover:bg-[var(--panel-2)]"}`}
            style={{ borderColor: profile === c ? CATS[c].color : "#1f2d4a" }}
          >
            <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: CATS[c].color }} />
            <Bi t={CATS[c].name} inline className="text-[var(--text)]" />
          </button>
        ))}
      </div>

      {toast && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--warn)] bg-[var(--warn-soft)] p-3 text-sm text-[var(--warn-text)]" role="status">
          <div>
            <Bi
              t={[
                `No mapped feature at ${fmtCoord(toast.lat, toast.lon)} on ${BODIES[toast.body].name[0]}.${toast.near ? ` Nearest: ${toast.near.g[toast.body]!.name[0]} (~${toast.near.km.toLocaleString()} km).` : ""}`,
                `لا توجد معلمة مسجلة عند ${fmtCoord(toast.lat, toast.lon)} على ${BODIES[toast.body].name[1]}.${toast.near ? ` الأقرب: ${toast.near.g[toast.body]!.name[1]} (~${toast.near.km.toLocaleString()} كم).` : ""}`,
              ]}
            />
          </div>
          {toast.near && (
            <button onClick={() => choose(toast.near!.g)} className="rounded-lg bg-[var(--warn)] px-3 py-1.5 text-xs font-extrabold text-black hover:brightness-110">
              <Bi t={["Match nearest", "طابق الأقرب"]} inline />
            </button>
          )}
        </div>
      )}

      {selG && sel && (
        <section className="mt-5 rounded-2xl border bg-[var(--panel)] p-5" style={{ borderColor: CATS[selG.cat].color + "99" }} aria-live="polite">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white" style={{ background: CATS[selG.cat].color }} />
              <h3 className="font-display text-2xl font-bold text-[var(--text-strong)]"><Bi t={["Twin found", "تم العثور على توأم"]} inline /></h3>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-black" style={{ background: CATS[selG.cat].color }}>
                <Bi t={CATS[selG.cat].name} inline />
              </span>
            </div>
            <div className="flex gap-2">
              {sel.stage === 1 && (
                <button onClick={() => setSel({ id: sel.id, stage: 2 })} className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-extrabold text-white hover:brightness-110">
                  <Bi t={["Write details on the planets", "اكتب التفاصيل على الكواكب"]} inline />
                </button>
              )}
              <button onClick={reset} className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--text)] hover:bg-[var(--panel-2)]">
                <Bi t={["Clear", "مسح"]} inline />
              </button>
            </div>
          </div>
          <Bi t={selG.why} className="mb-4 max-w-4xl text-sm leading-relaxed text-[var(--text)]" />
          <div className="grid gap-4 md:grid-cols-2">
            <EntryCard g={selG} body={from} accent={BODIES[from].accent} />
            <EntryCard g={selG} body={to} accent={BODIES[to].accent} />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-7">
        <h3 className="font-display text-2xl font-bold text-[var(--text-strong)]">
          <Bi t={[`Terrain & differences: ${BODIES[from].name[0]} vs ${BODIES[to].name[0]}`, `التضاريس والفروق: ${BODIES[from].name[1]} مقابل ${BODIES[to].name[1]}`]} inline />
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-start text-[11px] uppercase tracking-widest">
                <th className="w-[18%] py-2 pe-3" />
                {[from, to].map((b) => (
                  <th key={b} className="py-2 pr-3 font-extrabold" style={{ color: BODIES[b].accent }}>
                    <Bi t={BODIES[b].name} inline />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACT_ROWS.map((r) => (
                <tr key={r.key} className="border-b border-[var(--line-soft)] align-top">
                  <td className="py-2.5 pe-3 text-[var(--muted)]"><Bi t={r.label} className="font-semibold text-[var(--text)]" /></td>
                  {[from, to].map((b) => (
                    <td key={b} className="py-2.5 pe-4 text-[var(--text)]"><Bi t={FACTS[b][r.key]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl bg-[var(--panel-2)] p-4 text-sm leading-relaxed text-[var(--text)]">
          <Bi t={PAIR_NOTES[key]} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {[from, to].map((b) => (
          <div key={b} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
            <h3 className="mb-3 flex items-baseline gap-2 text-lg font-extrabold" style={{ color: BODIES[b].accent }}>
              <Bi t={BODIES[b].name} inline />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]"><Bi t={["Terrain atlas", "أطلس التضاريس"]} inline /></span>
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--text)]">
              {TERRAIN_NOTES[b].map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: BODIES[b].accent }} />
                  <Bi t={n} />
                </li>
              ))}
            </ul>
            <div className="mt-4 text-[10px] uppercase tracking-widest text-[var(--muted)]"><Bi t={["Key places — click to compare", "أماكن رئيسية — اضغط للمقارنة"]} inline /></div>
            <div className="mt-2 flex flex-wrap gap-2">
              {GROUPS.filter((g) => g[b]).map((g) => (
                <button
                  key={g.id}
                  onClick={() => choose(g)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-start text-[12px] transition hover:bg-[var(--panel-2)] ${sel?.id === g.id ? "bg-[var(--hover)]" : "bg-[var(--panel)]"}`}
                  style={{ borderColor: sel?.id === g.id ? CATS[g.cat].color : "#1f2d4a" }}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full border-2 border-white" style={{ background: CATS[g.cat].color }} />
                  <Bi t={g[b]!.name} inline className="text-[var(--text)]" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-8 border-t border-[var(--line-soft)] pt-5 text-[12px] leading-relaxed text-[var(--muted)]">
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-[var(--muted)]"><Bi t={["Sources", "المصادر"]} inline />:</span>
          {[from, to].flatMap((b) => BODIES[b].source).map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline-offset-2 hover:underline">
              <Bi t={s.label} inline />
            </a>
          ))}
        </div>
        <Bi
          t={[
            "Surface imagery is derived from NASA data: Earth – Blue Marble; Mars – Viking/MGS colour mosaics; Moon – Lunar Reconnaissance Orbiter. Textures via Solar System Scope (CC BY 4.0) and three.js examples. Feature positions are approximate and for education; zoomed-in detail is limited by the global texture resolution.",
            "صور الأسطح مشتقة من بيانات ناسا: الأرض – «الرخام الأزرق»، المريخ – فسيفساء فايكنغ/MGS الملونة، القمر – المستكشف القمري LRO. الخامات عبر Solar System Scope (CC BY 4.0) وأمثلة three.js. مواقع المعالم تقريبية للأغراض التعليمية، ودقة التفاصيل عند التكبير محدودة بدقة الخريطة العالمية.",
          ]}
        />
      </footer>
    </section>
  );
}


// ===== components/CandidateSites.tsx =====
function SiteCard({ site, side }: { site: CandidateSite; side: "source" | "target" }) {
  const lang = useLang();
  const body = BODIES[site.body];
  return (
    <article className={`candidate-card candidate-card-${side}`} style={{ borderColor: body.accent + "66" }}>
      <div className="candidate-card-head">
        <span className="candidate-body" style={{ color: body.accent }}>{pick(lang, body.name)}</span>
        <span className="candidate-status"><Bi t={["Hypothesis", "افتراضي"]} inline /></span>
      </div>
      <h3><Bi t={site.name} inline /></h3>
      <p className="candidate-region"><Bi t={site.region} inline /></p>
      <p className="candidate-coords" dir="ltr">{fmtCoord(site.lat, site.lon)}</p>
      <Bi t={site.note} className="candidate-note" />
      <div className="candidate-values">
        {CANDIDATE_CRITERIA.map((c) => (
          <div className="candidate-value" key={c.key}>
            <span><Bi t={c.label} inline /></span>
            <b dir="ltr">{formatCriterionValue(c.key, criterionValue(site, c.key))}</b>
          </div>
        ))}
      </div>
    </article>
  );
}

export function CandidateSites() {
  const lang = useLang();
  const initial = useMemo(() => bestPair("earth", "mars"), []);
  const [dirIndex, setDirIndex] = useState(0);
  const [sourceId, setSourceId] = useState(initial.a.id);
  const [targetId, setTargetId] = useState(initial.b.id);

  const direction = DIRECTIONS[dirIndex];
  const sourceSites = sitesForBody(direction.from);
  const targetSites = sitesForBody(direction.to);
  const source = getCandidateSite(sourceId);
  const target = getCandidateSite(targetId);
  const comparison = compareSites(source, target);
  const matrix = useMemo(() => directionMatrix(), []);

  const selectDirection = (index: number) => {
    const d = DIRECTIONS[index];
    const best = bestPair(d.from, d.to);
    setDirIndex(index);
    setSourceId(best.a.id);
    setTargetId(best.b.id);
  };

  return (
    <section className="candidate-sites section-wrap" id="candidate-sites" aria-labelledby="candidate-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="status-dot" /> <Bi t={["Undiscovered candidate targets", "أهداف مرشحة غير مكتشفة"]} inline /></p>
          <h2 id="candidate-title"><Bi t={["Compare", "قارن"]} inline /> <em><Bi t={["future places.", "أماكن المستقبل."]} inline /></em></h2>
        </div>
        <Bi
          t={[
            "Explore hypothetical sites on Earth, Mars and the Moon, then compare all six directions by temperature, gravity, water probability, living possibility, meteor risk, solar risk and dust.",
            "استكشف مواقع افتراضية على الأرض والمريخ والقمر، ثم قارن الاتجاهات الستة حسب الحرارة والجاذبية واحتمال الماء وإمكانية المعيشة وخطر النيازك وخطر الشمس والغبار.",
          ]}
          className="section-intro"
        />
      </div>

      <div className="candidate-disclaimer" role="note">
        <Bi t={[
          "These are candidate / hypothetical environments, not confirmed discovered locations. Scores are illustrative planning estimates, not measurements or safety guidance.",
          "هذه بيئات مرشحة / افتراضية وليست أماكن مؤكدة الاكتشاف. الدرجات تقديرات تخطيطية توضيحية وليست قياسات أو إرشادات سلامة.",
        ]} />
      </div>

      <div className="candidate-directions" role="group" aria-label={pick(lang, ["Comparison direction", "اتجاه المقارنة"])}>
        {DIRECTIONS.map((d, index) => (
          <button
            key={`${d.from}-${d.to}`}
            type="button"
            dir="ltr"
            className={`direction-chip ${index === dirIndex ? "is-active" : ""}`}
            aria-pressed={index === dirIndex}
            onClick={() => selectDirection(index)}
          >
            <span>{pick(lang, BODIES[d.from].name)}</span>
            <span aria-hidden="true">→</span>
            <span>{pick(lang, BODIES[d.to].name)}</span>
          </button>
        ))}
      </div>

      <div className="candidate-selectors">
        <label>
          <span><Bi t={["Source site", "موقع المصدر"]} inline /></span>
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            {sourceSites.map((s) => <option key={s.id} value={s.id}>{pick(lang, s.name)}</option>)}
          </select>
        </label>
        <label>
          <span><Bi t={["Target site", "موقع الهدف"]} inline /></span>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {targetSites.map((s) => <option key={s.id} value={s.id}>{pick(lang, s.name)}</option>)}
          </select>
        </label>
      </div>

      <div className="candidate-grid">
        <SiteCard site={source} side="source" />
        <div className="similarity-panel">
          <div className="similarity-overall">
            <span className="similarity-score">{Math.round(comparison.overall)}<small>%</small></span>
            <Bi t={["Overall similarity", "التشابه الكلي"]} className="similarity-label" />
          </div>
          <div className="similarity-list">
            {comparison.criteria.map((c) => {
              const meta = CANDIDATE_CRITERIA.find((item) => item.key === c.key)!;
              const tone = similarityTone(c.similarity);
              return (
                <div className="criterion-row" key={c.key}>
                  <div className="criterion-head">
                    <span><Bi t={meta.label} inline /></span>
                    <b>{Math.round(c.similarity)}%</b>
                  </div>
                  <div className="criterion-bar"><i className={`tone-${tone}`} style={{ width: `${c.similarity}%` }} /></div>
                  <div className="criterion-values" dir="ltr">
                    <span>{formatCriterionValue(c.key, c.a)}</span>
                    <span aria-hidden="true">↔</span>
                    <span>{formatCriterionValue(c.key, c.b)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="similarity-note">
            <Bi t={[
              "Risk similarity means similar risk level, not safety. Lower meteor / solar / dust values are safer.",
              "تشابه الخطر يعني تقارب مستوى الخطر وليس الأمان. القيم الأقل للنيازك / الشمس / الغبار أكثر أماناً.",
            ]} />
          </p>
        </div>
        <SiteCard site={target} side="target" />
      </div>

      <div className="candidate-matrix-wrap">
        <h3><Bi t={["All six directions — best candidate pair", "الاتجاهات الستة — أفضل زوج مرشح"]} inline /></h3>
        <div className="candidate-matrix-scroll">
          <table className="candidate-matrix">
            <thead>
              <tr>
                <th><Bi t={["Direction", "الاتجاه"]} inline /></th>
                <th><Bi t={["Best pair", "أفضل زوج"]} inline /></th>
                {CANDIDATE_CRITERIA.map((c) => <th key={c.key}><Bi t={c.label} inline /></th>)}
                <th><Bi t={["Overall", "الكلي"]} inline /></th>
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ direction: d, best }, index) => (
                <tr key={`${d.from}-${d.to}`} className={index === dirIndex ? "is-active" : ""}>
                  <td>
                    <button type="button" dir="ltr" onClick={() => selectDirection(index)}>
                      {pick(lang, BODIES[d.from].name)} → {pick(lang, BODIES[d.to].name)}
                    </button>
                  </td>
                  <td className="matrix-pair">{pick(lang, best.a.name)} ↔ {pick(lang, best.b.name)}</td>
                  {best.result.criteria.map((c) => (
                    <td key={c.key}><span className={`matrix-score tone-${similarityTone(c.similarity)}`}>{Math.round(c.similarity)}%</span></td>
                  ))}
                  <td><b className={`matrix-score tone-${similarityTone(best.result.overall)}`}>{Math.round(best.result.overall)}%</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


// ===== components/Worlds.tsx =====
export function Worlds() {
  const lang = useLang();
  const ar = lang === "ar";
  return (
    <div id="worlds">
      <section className="feature feature-earth" id="earth">
        <div className="feature-image earth-image" style={{ backgroundImage: `url(${heroEarth})` }} role="img" aria-label={ar ? "الأرض من الفضاء" : "Earth from space"} />
        <div className="feature-content">
          <p className="eyebrow">{mt(lang, "earthEyebrow")}</p>
          <h2>{ar ? <>الأرض،<br /><em>كما هي.</em></> : <>Earth,<br /><em>unfiltered.</em></>}</h2>
          <p>{mt(lang, "earthCopy")}</p>
          <a className="button button-outline" href="https://science.nasa.gov/earth/" target="_blank" rel="noreferrer"><span>{mt(lang, "earthButton")}</span> <span aria-hidden="true">↗</span></a>
        </div>
        <div className="feature-note"><span className="note-dot" /> {mt(lang, "earthNote")}</div>
      </section>

      <section className="moon-section" id="moon">
        <div className="moon-copy">
          <div className="section-label"><span>02</span><span className="label-line" /><span>{mt(lang, "moonLabel")}</span></div>
          <p className="eyebrow">{mt(lang, "moonEyebrow")}</p>
          <h2>{ar ? <>ضوء مألوف،<br />وبداية <em>جديدة.</em></> : <>A familiar<br />light. A <em>new</em><br />beginning.</>}</h2>
          <p className="moon-description">{mt(lang, "moonCopy")}</p>
          <a className="text-link" href="https://www.nasa.gov/humans-in-space/artemis/" target="_blank" rel="noreferrer"><span>{mt(lang, "moonLink")}</span> <span aria-hidden="true">↗</span></a>
        </div>
        <div className="moon-visual">
          <div className="moon-image" style={{ backgroundImage: `url(${moonTexture})` }} role="img" aria-label={ar ? "القمر" : "The Moon"} />
          <div className="moon-orbit" aria-hidden="true" />
          <div className="moon-caption"><span>{mt(lang, "moonCaption")}</span><span>{mt(lang, "moonDistance")}</span></div>
        </div>
      </section>

      <section className="mission-section section-wrap" id="missions">
        <div className="mission-heading">
          <div>
            <div className="section-label"><span>03</span><span className="label-line" /><span>{mt(lang, "missionLabel")}</span></div>
            <h2>{ar ? <>للفضول<br /><em>لا خط نهاية.</em></> : <>Curiosity has<br /><em>no finish line.</em></>}</h2>
          </div>
          <p>{mt(lang, "missionCopy")}</p>
        </div>
        <div className="mission-cards">
          <a className="mission-card card-artemis" href="https://www.nasa.gov/humans-in-space/artemis/" target="_blank" rel="noreferrer">
            <span className="card-number">{mt(lang, "cardHuman")}</span>
            <span className="card-bottom"><span><strong>Artemis</strong><small>{mt(lang, "cardArtemis")}</small></span><span className="card-arrow" aria-hidden="true">↗</span></span>
          </a>
          <a className="mission-card card-earth" href="https://science.nasa.gov/earth/" target="_blank" rel="noreferrer">
            <span className="card-number">{mt(lang, "cardScience")}</span>
            <span className="card-bottom"><span><strong>{mt(lang, "cardPlanet")}</strong><small>{mt(lang, "cardEarth")}</small></span><span className="card-arrow" aria-hidden="true">↗</span></span>
          </a>
          <a className="mission-card card-universe" href="https://science.nasa.gov/universe/" target="_blank" rel="noreferrer">
            <span className="card-number">{mt(lang, "cardDeep")}</span>
            <span className="card-bottom"><span><strong>{mt(lang, "cardUnknown")}</strong><small>{mt(lang, "cardUniverse")}</small></span><span className="card-arrow" aria-hidden="true">↗</span></span>
          </a>
        </div>
      </section>

      <section className="closing" aria-label={ar ? "تابع الاستكشاف" : "Keep exploring"}>
        <div className="closing-content">
          <p className="eyebrow">{mt(lang, "closingEyebrow")}</p>
          <h2>{ar ? <>الدهشة هي<br />مجرد <em>البداية.</em></> : <>Wonder is<br />just the <em>beginning.</em></>}</h2>
          <a className="button button-light" href="https://www.nasa.gov/" target="_blank" rel="noreferrer"><span>{mt(lang, "closingButton")}</span> <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </div>
  );
}

// ===== mission =====
// ===== lib/mission.ts =====
export interface MissionState {
  selected: SiteId[];
  weights: number[];
  target: MissionTarget;
  mass: number;
  analyzed: boolean;
  step: 1 | 2 | 3;
  focus: SiteId;
  customLat: string;
  customLon: string;
  layer: "elevation" | "heat";
}

export const initialMissionState: MissionState = {
  selected: ["black-point", "haughton"],
  weights: [...defaultWeights],
  target: "mars",
  mass: 120,
  analyzed: false,
  step: 1,
  focus: "black-point",
  customLat: "",
  customLon: "",
  layer: "elevation",
};

export function isSiteId(value: string): value is SiteId {
  return siteData.some((site) => site.id === value);
}

export function getSite(id: SiteId): MissionSite {
  const site = siteData.find((item) => item.id === id);
  if (!site) throw new Error(`Unknown site: ${id}`);
  return site;
}

export function normalizeWeights(weights: number[]): number[] {
  const clean = scoreKeys.map((_, index) => {
    const value = Number(weights[index]);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : defaultWeights[index];
  });
  if (!clean.some(Boolean)) clean[0] = 1;
  return clean;
}

export function score(site: MissionSite, weights: number[]): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!total) return 0;
  return site.scores.reduce((sum, value, index) => sum + value * (weights[index] ?? 0), 0) / total;
}

export function rankedSites(selected: SiteId[], weights: number[]) {
  return selected
    .map(getSite)
    .map((site) => ({ site, value: score(site, weights) }))
    .sort((a, b) => b.value - a.value);
}

export function bestHybrid(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let best: { a: MissionSite; b: MissionSite; combined: number } | null = null;
  for (let first = 0; first < siteData.length; first += 1) {
    for (let second = first + 1; second < siteData.length; second += 1) {
      const a = siteData[first];
      const b = siteData[second];
      const combined = a.scores.reduce(
        (sum, value, index) => sum + Math.max(value, b.scores[index]) * (weights[index] ?? 0),
        0
      ) / total;
      if (!best || combined > best.combined) best = { a, b, combined };
    }
  }
  if (!best) throw new Error("At least two sites are required");
  const top = [...siteData].sort((a, b) => score(b, weights) - score(a, weights))[0];
  const improvement = Math.max(0, Math.round(best.combined - score(top, weights)));
  const contributions = best.a.scores
    .map((value, index) => ({
      index,
      gain: Math.max(value, best!.b.scores[index]) - Math.min(value, best!.b.scores[index]),
    }))
    .sort((a, b) => b.gain - a.gain)
    .filter((item) => item.gain > 4 && (weights[item.index] ?? 0) > 0)
    .slice(0, 2);
  return { ...best, improvement, contributions, top };
}

export function nearestSite(lat: number, lon: number) {
  return siteData
    .map((site) => ({
      site,
      distance: Math.round(angDist(lat, lon, site.lat, site.lon) * (Math.PI / 180) * BODY_RADIUS_KM.earth),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

export function validCoordinates(lat: string, lon: string) {
  if (lat.trim() === "" || lon.trim() === "") return null;
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) {
    return undefined;
  }
  return { lat: la, lon: lo };
}

export function gravityRows(mass: number) {
  const safeMass = Math.max(1, Math.min(10000, Number(mass) || 120));
  return gravity.map((world) => ({
    ...world,
    force: safeMass * world.value,
    relative: (world.value / gravity[0].value) * 100,
  }));
}

export function parseMissionState(): MissionState {
  const state: MissionState = { ...initialMissionState, selected: [...initialMissionState.selected], weights: [...initialMissionState.weights] };
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);

  const sites = params.get("sites");
  if (sites) {
    const requested = Array.from(new Set(sites.split(",").filter(isSiteId)));
    if (requested.length >= 2 && requested.length <= 3) state.selected = requested;
  }

  const weights = params.get("weights");
  if (weights) {
    const requested = weights.split(",").map(Number);
    if (requested.length === defaultWeights.length && requested.every((value) => Number.isFinite(value) && value >= 0 && value <= 100) && requested.some(Boolean)) {
      state.weights = normalizeWeights(requested);
    }
  }

  const target = params.get("target");
  if (target === "moon" || target === "mars") state.target = target;

  const mass = Number(params.get("mass"));
  if (params.has("mass") && Number.isFinite(mass) && mass >= 1 && mass <= 10000) state.mass = mass;

  const lat = params.get("lat");
  const lon = params.get("lon");
  if (lat !== null) state.customLat = lat;
  if (lon !== null) state.customLon = lon;

  const focus = params.get("focus");
  if (focus && isSiteId(focus)) state.focus = focus;
  if (!state.selected.includes(state.focus)) state.focus = state.selected[0];

  const layer = params.get("layer");
  if (layer === "heat" || layer === "elevation") state.layer = layer;

  state.analyzed = params.get("results") === "1";
  const step = Number(params.get("step"));
  if (step === 1 || step === 2 || step === 3) state.step = step;
  if (state.analyzed) state.step = 3;
  return state;
}

export function missionParams(state: MissionState): Record<string, string> {
  return {
    sites: state.selected.join(","),
    weights: state.weights.join(","),
    target: state.target,
    mass: String(state.mass),
    step: String(state.step),
    results: state.analyzed ? "1" : "0",
    focus: state.focus,
    layer: state.layer,
    lat: state.customLat,
    lon: state.customLon,
  };
}


// ===== lib/report.ts =====
export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[character];
  });
}

export function buildReportHtml(state: MissionState, lang: Lang): string {
  const ranked = rankedSites(state.selected, state.weights);
  const hybrid = bestHybrid(state.weights);
  const destination = state.target === "moon" ? mt(lang, "moon") : mt(lang, "mars");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const metricLabels = mt(lang, "metricLabels");
  const weights = scoreKeys
    .map((key, index) => `${escapeHtml(mt(lang, key))}: ${state.weights[index]}`)
    .join(" · ");
  const rows = ranked
    .map(
      ({ site, value }, index) => `<tr>
        <td>${index + 1}. ${escapeHtml(siteName(site, lang))}</td>
        <td dir="ltr">${Math.round(value)}%</td>
        <td dir="ltr">${site.scores.join(" / ")}</td>
      </tr>`
    )
    .join("");
  const warnings = ranked
    .map(({ site }) => `<li><strong>${escapeHtml(siteName(site, lang))}:</strong> ${escapeHtml(lang === "ar" ? site.warningAr : site.warning)}</li>`)
    .join("");
  const gravity = gravityRows(state.mass)
    .map((world) => `<tr><td>${escapeHtml(lang === "ar" ? world.ar : world.en)}</td><td dir="ltr">${Math.round(world.force).toLocaleString(lang === "ar" ? "ar" : "en")} N</td><td dir="ltr">${world.relative.toFixed(0)}%</td></tr>`)
    .join("");
  const hybridReason = hybrid.contributions.length
    ? interpolate(mt(lang, "hybridReason"), {
        items: hybrid.contributions.map((item) => mt(lang, scoreKeys[item.index])).join(lang === "ar" ? " و" : " + "),
      })
    : mt(lang, "hybridSame");

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(mt(lang, "reportTitle"))}</title>
<style>
  body{font:12pt/1.6 system-ui,Segoe UI,Tahoma,sans-serif;color:#18212a;margin:32px;max-width:900px}
  h1{font-size:22pt;margin:0 0 8px} h2{font-size:14pt;border-bottom:1px solid #bbc3ca;padding-bottom:5px;margin-top:22px}
  table{border-collapse:collapse;width:100%;margin:10px 0} th,td{border:1px solid #c7cdd2;padding:7px;text-align:start}
  .caution{border:1px solid #c5a17c;background:#fff8ef;padding:12px;margin-top:20px}
  .meta{color:#5a6672;font-size:10pt}
</style>
</head>
<body>
  <p class="meta">${escapeHtml(mt(lang, "reportGenerated"))} · Tera Twin v1.2</p>
  <h1>${escapeHtml(mt(lang, "reportTitle"))}</h1>
  <p><strong>${escapeHtml(mt(lang, "reportTarget"))}:</strong> ${escapeHtml(destination)} · ${escapeHtml(mt(lang, "payloadMass"))}: ${state.mass} kg</p>
  <h2>${escapeHtml(mt(lang, "reportSites"))}</h2>
  <table><thead><tr><th>${lang === "ar" ? "الموقع" : "Site"}</th><th>${escapeHtml(mt(lang, "score"))}</th><th>${escapeHtml(metricLabels.join(" / "))}</th></tr></thead><tbody>${rows}</tbody></table>
  <h2>${escapeHtml(mt(lang, "reportWeights"))}</h2><p>${weights}</p>
  <h2>${escapeHtml(mt(lang, "reportHybrid"))}</h2>
  <p>${escapeHtml(siteName(hybrid.a, lang))} + ${escapeHtml(siteName(hybrid.b, lang))} — ${escapeHtml(interpolate(mt(lang, "hybridText"), { gain: hybrid.improvement, reason: hybridReason }))}</p>
  <h2>${escapeHtml(mt(lang, "gravityTitle"))}</h2>
  <table><thead><tr><th>${lang === "ar" ? "العالم" : "World"}</th><th>${escapeHtml(mt(lang, "reportWeight"))}</th><th>${escapeHtml(mt(lang, "reportVsEarth"))}</th></tr></thead><tbody>${gravity}</tbody></table>
  <h2>${escapeHtml(mt(lang, "reportWarnings"))}</h2><ul>${warnings}</ul>
  <p class="caution">${escapeHtml(mt(lang, "reportDisclaimer"))}</p>
</body>
</html>`;
}

export function downloadReport(state: MissionState, lang: Lang) {
  const html = buildReportHtml(state, lang);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tera-twin-mission-report-${state.target}-${lang}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function missionTargetLabel(target: MissionTarget, lang: Lang) {
  return target === "moon" ? mt(lang, "moon") : mt(lang, "mars");
}


// ===== components/RadarChart.tsx =====
export function RadarChart({ sites, lang }: { sites: MissionSite[]; lang: Lang }) {
  const centerX = 180;
  const centerY = 155;
  const radius = 105;
  const axes = scoreKeys.map((_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / scoreKeys.length);
  const point = (index: number, fraction: number) =>
    `${(centerX + Math.cos(axes[index]) * radius * fraction).toFixed(1)},${(centerY + Math.sin(axes[index]) * radius * fraction).toFixed(1)}`;
  const metricLabels = mt(lang, "metricLabels");

  return (
    <>
      <div className="radar-wrap">
        <svg id="radar-chart" viewBox="0 0 360 330" role="img" aria-label={mt(lang, "radarTitle")}>
          {[0.25, 0.5, 0.75, 1].map((level) => (
            <polygon key={level} className="radar-grid" points={axes.map((_, index) => point(index, level)).join(" ")} />
          ))}
          {axes.map((angle, index) => {
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;
            const labelX = centerX + Math.cos(angle) * (radius + 26);
            const labelY = centerY + Math.sin(angle) * (radius + 26);
            return (
              <g key={scoreKeys[index]}>
                <line className="radar-axis" x1={centerX} y1={centerY} x2={endX} y2={endY} />
                <text className="radar-label" x={labelX.toFixed(1)} y={labelY.toFixed(1)} textAnchor="middle" dominantBaseline="middle">
                  {metricLabels[index]}
                </text>
              </g>
            );
          })}
          {sites.map((site, siteIndex) => {
            const color = scoreColors[siteIndex % scoreColors.length];
            const points = site.scores.map((value, index) => point(index, value / 100)).join(" ");
            return (
              <g key={site.id}>
                <polygon className="radar-polygon" points={points} fill={color} stroke={color} />
                {site.scores.map((value, index) => {
                  const [x, y] = point(index, value / 100).split(",");
                  return <circle key={index} className="radar-dot" cx={x} cy={y} r="3" fill={color} />;
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="radar-legend">
        {sites.map((site, index) => (
          <span className="legend-item" key={site.id}>
            <i className="legend-dot" style={{ background: scoreColors[index % scoreColors.length] }} />
            {siteName(site, lang)}
          </span>
        ))}
      </div>
    </>
  );
}


// ===== components/MissionLab.tsx =====
export function MissionLab({ onLangChange }: { onLangChange: (lang: Lang) => void }) {
  const lang = useLang();
  const [state, setState] = useState<MissionState>(() => parseMissionState());
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState("");
  const [focusNonce, setFocusNonce] = useState(1);
  const analysisTimer = useRef<number | null>(null);
  const statusTimer = useRef<number | null>(null);
  const globeApi = useRef<GlobeApi | null>(null);
  const sitesRef = useRef<HTMLDivElement>(null);
  const weightsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    patchParams({ ...missionParams(state), lang });
  }, [state, lang]);

  useEffect(() => {
    return () => {
      if (analysisTimer.current) window.clearTimeout(analysisTimer.current);
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
    };
  }, []);

  const announce = (message: string) => {
    setStatus(message);
    if (statusTimer.current) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(""), 3200);
  };

  const changeFocus = (id: SiteId) => {
    setState((s) => ({ ...s, focus: id }));
    setFocusNonce((n) => n + 1);
  };

  const toggleSite = (id: SiteId) => {
    const selected = state.selected.includes(id)
      ? state.selected.filter((item) => item !== id)
      : [...state.selected, id];
    if (selected.length < 2) {
      announce(mt(lang, "noSites"));
      return;
    }
    if (selected.length > 3) {
      announce(mt(lang, "maxSites"));
      return;
    }
    const focus = selected.includes(state.focus) ? state.focus : selected[0];
    setState((s) => ({ ...s, selected, focus }));
    if (focus !== state.focus) setFocusNonce((n) => n + 1);
  };

  const setWeight = (index: number, value: number) => {
    setState((s) => {
      const weights = [...s.weights];
      weights[index] = value;
      if (!weights.some(Boolean)) weights[index] = 1;
      return { ...s, weights: normalizeWeights(weights) };
    });
  };

  const setStep = (step: 1 | 2 | 3, scroll = true) => {
    setState((s) => ({ ...s, step }));
    if (!scroll) return;
    const target = step === 1 ? sitesRef.current : step === 2 ? weightsRef.current : resultsRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const finishAnalysis = () => {
    if (analysisTimer.current) window.clearTimeout(analysisTimer.current);
    setAnalyzing(false);
    setState((s) => ({ ...s, analyzed: true, step: 3 }));
  };

  const runAnalysis = () => {
    if (state.selected.length < 2 || state.selected.length > 3) {
      announce(mt(lang, "selectTwoFirst"));
      return;
    }
    setState((s) => ({
      ...s,
      analyzed: false,
      step: 3,
      focus: s.selected.includes(s.focus) ? s.focus : s.selected[0],
    }));
    setAnalyzing(true);
    if (analysisTimer.current) window.clearTimeout(analysisTimer.current);
    analysisTimer.current = window.setTimeout(finishAnalysis, 1350);
  };

  const coords = validCoordinates(state.customLat, state.customLon);
  const nearest = coords ? nearestSite(coords.lat, coords.lon) : null;
  const useNearest = () => {
    if (!nearest) return;
    const id = nearest.site.id;
    setState((s) => {
      const selected = s.selected.includes(id)
        ? s.selected
        : s.selected.length === 3
          ? [...s.selected.slice(0, 2), id]
          : [...s.selected, id];
      return { ...s, selected, focus: id, customLat: String(coords!.lat), customLon: String(coords!.lon) };
    });
    setFocusNonce((n) => n + 1);
  };

  const ranked = rankedSites(state.selected, state.weights);
  const hybrid = bestHybrid(state.weights);
  const hybridReason = hybrid.contributions.length
    ? interpolate(mt(lang, "hybridReason"), {
        items: hybrid.contributions.map((item) => mt(lang, scoreKeys[item.index])).join(lang === "ar" ? " و" : " + "),
      })
    : mt(lang, "hybridSame");
  const selectedSites = state.selected.map(getSite);
  const focusSite = getSite(state.focus);
  const globeFocus = useMemo(
    () => ({ lat: focusSite.lat, lon: focusSite.lon, nonce: focusNonce }),
    [focusSite, focusNonce]
  );
  const globeMarkers: MarkerSpec[] = state.selected.map((id, index) => {
    const site = getSite(id);
    return {
      id,
      lat: site.lat,
      lon: site.lon,
      color: scoreColors[index % scoreColors.length],
      kind: id === state.focus ? "active" : "dim",
      title: [site.name, site.nameAr],
    };
  });
  const handleGlobePick = (lat: number, lon: number, tol: number) => {
    let best: { id: SiteId; d: number } | null = null;
    for (const id of state.selected) {
      const site = getSite(id);
      const d = angDist(lat, lon, site.lat, site.lon);
      if (!best || d < best.d) best = { id, d };
    }
    if (best && best.d <= Math.max(tol, 2)) changeFocus(best.id);
  };

  const topSite = ranked[0]?.site ?? selectedSites[0];
  const bodyPhoto = BODY_PHOTOS[state.target];
  const costLabels = [mt(lang, "costLow"), mt(lang, "costMedium"), mt(lang, "costHigh"), mt(lang, "costVeryHigh"), mt(lang, "costVeryHigh")];
  const gravity = gravityRows(state.mass);
  const totalWeight = state.weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const metricLabels = mt(lang, "metricLabels");

  return (
    <section className={`mission-lab ${analyzing ? "is-analyzing" : ""}`} id="mission-lab" aria-labelledby="lab-title" data-step={state.step}>
      <div className="lab-shell">
        <div className="lab-topline">
          <div className="lab-kicker"><span className="status-dot" />{mt(lang, "labKicker")}</div>
          <div className="lab-top-actions">
            <span className="version-tag">v1.2</span>
            <button className="language-toggle" type="button" onClick={() => onLangChange(lang === "en" ? "ar" : "en")} aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
              {lang === "ar" ? "EN" : "العربية"}
            </button>
          </div>
        </div>
        <div className="lab-heading">
          <div>
            <p className="eyebrow">{mt(lang, "labEyebrow")}</p>
            <h2 id="lab-title">{mt(lang, "labTitle")}<br /><em>{mt(lang, "labTitleEm")}</em></h2>
          </div>
          <p>{mt(lang, "labIntro")}</p>
        </div>

        <nav className="lab-progress" aria-label={lang === "ar" ? "تقدم التحليل" : "Analysis progress"}>
          {([1, 2, 3] as const).map((step, index) => (
            <span className="lab-progress-item" key={step}>
              {index > 0 && <i aria-hidden="true" />}
              <button
                className={`progress-step ${state.step === step ? "is-current" : ""} ${state.step > step ? "is-done" : ""}`}
                type="button"
                aria-current={state.step === step ? "step" : undefined}
                onClick={() => (step === 3 && !state.analyzed ? runAnalysis() : setStep(step))}
              >
                <span>{String(step).padStart(2, "0")}</span>
                <span>{mt(lang, step === 1 ? "stepSites" : step === 2 ? "stepWeights" : "stepResults")}</span>
              </button>
            </span>
          ))}
        </nav>

        <div className="lab-workspace">
          <aside className="lab-controls">
            <div className="lab-panel" ref={sitesRef}>
              <div className="panel-heading">
                <div><span className="panel-index">01</span><h3>{mt(lang, "chooseSites")}</h3></div>
                <span className="selection-count">{interpolate(mt(lang, "selectionStatus"), { count: state.selected.length })}</span>
              </div>
              <p className="panel-note">{mt(lang, "chooseNote")}</p>
              <div className="site-options" role="group" aria-label={mt(lang, "chooseSites")}>
                {siteData.map((site) => {
                  const checked = state.selected.includes(site.id);
                  return (
                    <label className="site-option" key={site.id}>
                      <input type="checkbox" checked={checked} onChange={() => toggleSite(site.id)} aria-label={siteName(site, lang)} />
                      <span className="site-option-copy">
                        <span className="site-option-name">{siteName(site, lang)}</span>
                        <span className="site-option-meta">{lang === "ar" ? site.terrainAr : site.terrain} · <span dir="ltr">{fmtCoord(site.lat, site.lon)}</span></span>
                      </span>
                      <span className={`site-option-badge ${site.tested ? "" : "is-unproven"}`}>{site.tested ? mt(lang, "tested") : mt(lang, "notTested")}</span>
                    </label>
                  );
                })}
              </div>
              <p className="site-status" role="status">{status}</p>
              <div className="custom-area">
                <p className="mini-heading">{mt(lang, "customHeading")}</p>
                <p className="panel-note">{mt(lang, "customNote")}</p>
                <div className="coordinate-inputs">
                  <label>
                    <span>{mt(lang, "latitude")}</span>
                    <input dir="ltr" type="number" min={-90} max={90} step={0.0001} inputMode="decimal" value={state.customLat} placeholder="35.2" onChange={(e) => setState((s) => ({ ...s, customLat: e.target.value }))} />
                  </label>
                  <label>
                    <span>{mt(lang, "longitude")}</span>
                    <input dir="ltr" type="number" min={-180} max={180} step={0.0001} inputMode="decimal" value={state.customLon} placeholder="-111.6" onChange={(e) => setState((s) => ({ ...s, customLon: e.target.value }))} />
                  </label>
                </div>
                <div className="nearest-result" aria-live="polite">
                  {coords === null && mt(lang, "nearestEmpty")}
                  {coords === undefined && mt(lang, "customInvalid")}
                  {nearest && (
                    <>
                      {interpolate(mt(lang, "nearestFound"), { name: siteName(nearest.site, lang), distance: nearest.distance.toLocaleString(lang === "ar" ? "ar" : "en") })}{" "}
                      <button type="button" onClick={useNearest}>{mt(lang, "useNearest")}</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lab-panel weights-panel" ref={weightsRef}>
              <div className="panel-heading">
                <div><span className="panel-index">02</span><h3>{mt(lang, "tuneWeights")}</h3></div>
                <button className="reset-weights" type="button" onClick={() => setState((s) => ({ ...s, weights: [...defaultWeights] }))}>{mt(lang, "reset")}</button>
              </div>
              <p className="panel-note">{mt(lang, "weightsNote")}</p>
              <div className="weight-list">
                {scoreKeys.map((key, index) => (
                  <label className="weight-row" key={key}>
                    <span className="weight-label">{mt(lang, key)}</span>
                    <span className="weight-value">{Math.round((state.weights[index] / totalWeight) * 100)}%</span>
                    <input type="range" min={0} max={100} step={1} value={state.weights[index]} aria-label={mt(lang, key)} onChange={(e) => setWeight(index, Number(e.target.value))} />
                  </label>
                ))}
              </div>
              <p className="panel-note weights-total">{mt(lang, "weightsTotal")}</p>
              <div className="target-select-wrap">
                <label htmlFor="mission-target">{mt(lang, "destination")}</label>
                <select id="mission-target" value={state.target} onChange={(e) => setState((s) => ({ ...s, target: e.target.value as MissionState["target"] }))}>
                  <option value="mars">{mt(lang, "mars")}</option>
                  <option value="moon">{mt(lang, "moon")}</option>
                </select>
              </div>
              <button className="analyze-button" type="button" onClick={runAnalysis} disabled={analyzing}>
                <span>{analyzing ? mt(lang, "analysisRunning") : mt(lang, "analyze")}</span><span aria-hidden="true">{lang === "ar" ? "←" : "→"}</span>
              </button>
              {analyzing && <button className="skip-analysis" type="button" onClick={finishAnalysis}>{mt(lang, "skipAnalysis")}</button>}
            </div>
          </aside>

          <div className="lab-results" ref={resultsRef} aria-live="polite">
            {!state.analyzed && (
              <div className="results-placeholder">
                <div className="placeholder-orbit"><span /></div>
                <p className="eyebrow">{analyzing ? mt(lang, "analysisComplete") : mt(lang, "awaiting")}</p>
                <h3>{analyzing ? mt(lang, "analysisRunning") : mt(lang, "placeholderTitle").split("<br>").map((line, i, arr) => (<span key={i}>{line}{i < arr.length - 1 && <br />}</span>))}</h3>
                {!analyzing && <p>{mt(lang, "placeholderText")}</p>}
              </div>
            )}
            {state.analyzed && (
              <div className="results-content">
                <div className="results-header">
                  <div><p className="eyebrow">{mt(lang, "analysisComplete")}</p><h3>{mt(lang, "resultsTitle")}</h3></div>
                  <button className="report-button" type="button" onClick={() => downloadReport(state, lang)}>
                    <span aria-hidden="true">↓</span><span>{mt(lang, "exportReport")}</span>
                  </button>
                </div>
                <div className="hybrid-callout">
                  <span className="hybrid-kicker">{mt(lang, "hybridKicker")}</span>
                  <h4>{interpolate(mt(lang, "hybridTitle"), { first: siteName(hybrid.a, lang), second: siteName(hybrid.b, lang) })}</h4>
                  <p>{interpolate(mt(lang, "hybridText"), { gain: hybrid.improvement, reason: hybridReason })}</p>
                </div>
                <div className="comparison-grid">
                  {ranked.map(({ site, value }, rank) => (
                    <article className={`comparison-card ${rank === 0 ? "is-top" : ""}`} key={site.id}>
                      <div className="compare-title-row"><h4>{siteName(site, lang)}</h4><span className="compare-score">{Math.round(value)}<small>%</small></span></div>
                      <div className="compare-rank">{interpolate(mt(lang, "rank"), { rank: rank + 1 })}</div>
                      <div className="compare-meter"><i style={{ width: `${Math.max(1, value)}%` }} /></div>
                      <div className="compare-metrics">
                        {site.scores.map((scoreValue, index) => (
                          <span className="compare-metric" key={index}>{metricLabels[index]}<b>{scoreValue}</b></span>
                        ))}
                      </div>
                      <div className="tested-tag">{site.tested ? mt(lang, "tested") : mt(lang, "notTested")}</div>
                    </article>
                  ))}
                </div>
                <div className="results-two-col">
                  <article className="result-card radar-card">
                    <div className="result-card-heading"><div><p className="eyebrow">{mt(lang, "radarKicker")}</p><h4>{mt(lang, "radarTitle")}</h4></div><span className="chart-units">0—100</span></div>
                    <RadarChart sites={selectedSites} lang={lang} />
                  </article>
                  <article className="result-card globe-card">
                    <div className="result-card-heading">
                      <div><p className="eyebrow">{mt(lang, "globeKicker")}</p><h4>{mt(lang, "globeTitle")}</h4></div>
                      <div className="layer-switch" role="group" aria-label={lang === "ar" ? "طبقة الخريطة" : "Map layer"}>
                        <button type="button" className={state.layer === "elevation" ? "is-active" : ""} aria-pressed={state.layer === "elevation"} onClick={() => setState((s) => ({ ...s, layer: "elevation" }))}>{mt(lang, "elevation")}</button>
                        <button type="button" className={state.layer === "heat" ? "is-active" : ""} aria-pressed={state.layer === "heat"} onClick={() => setState((s) => ({ ...s, layer: "heat" }))}>{mt(lang, "heatmap")}</button>
                      </div>
                    </div>
                    <div className="mission-globe-stage" data-layer={state.layer}>
                      <Globe body="earth" grid markers={globeMarkers} focus={globeFocus} onPick={handleGlobePick} apiRef={globeApi} />
                    </div>
                    <label className="globe-focus-label" htmlFor="globe-focus">{mt(lang, "focusSite")}</label>
                    <select id="globe-focus" className="globe-focus" value={state.focus} onChange={(e) => changeFocus(e.target.value as SiteId)}>
                      {state.selected.map((id) => <option key={id} value={id}>{siteName(getSite(id), lang)}</option>)}
                    </select>
                    <p className="map-note">{mt(lang, "mapNote")}</p>
                  </article>
                </div>
                <div className="results-two-col detail-row">
                  <article className="result-card photo-card">
                    <div className="result-card-heading"><div><p className="eyebrow">{mt(lang, "photoKicker")}</p><h4>{mt(lang, "photoTitle")}</h4></div></div>
                    <div className="photo-pair">
                      <figure className="photo-frame">
                        <img src={FIELD_PHOTOS[topSite.id]} alt={lang === "ar" ? topSite.imgAltAr : topSite.imgAlt} loading="lazy" decoding="async" />
                        <figcaption>{lang === "ar" ? topSite.imgCaptionAr : topSite.imgCaption} · <a href={topSite.imgSource} target="_blank" rel="noreferrer">{topSite.imgSourceName}</a></figcaption>
                      </figure>
                      <figure className="photo-frame">
                        <img src={bodyPhoto.src} alt={lang === "ar" ? bodyPhoto.alt[1] : bodyPhoto.alt[0]} loading="lazy" decoding="async" />
                        <figcaption>{lang === "ar" ? bodyPhoto.caption[1] : bodyPhoto.caption[0]} · <a href={bodyPhoto.source} target="_blank" rel="noreferrer">{bodyPhoto.sourceName}</a></figcaption>
                      </figure>
                    </div>
                    <p className="source-note">{mt(lang, "photoSourceNote")}</p>
                  </article>
                  <article className="result-card logistics-card">
                    <div className="result-card-heading"><div><p className="eyebrow">{mt(lang, "logisticsKicker")}</p><h4>{mt(lang, "logisticsTitle")}</h4></div></div>
                    <div className="logistics-list">
                      {selectedSites.map((site) => (
                        <div className="logistics-site" key={site.id}>
                          <div className="logistics-site-head"><strong>{siteName(site, lang)}</strong><span>{mt(lang, "accessScore")} {site.access}/100</span></div>
                          <div className="logistics-meter"><i style={{ width: `${site.access}%` }} /></div>
                          <div className="logistics-facts">
                            <span>{mt(lang, "airport")}: <b>~{site.airport} km</b></span>
                            <span>{mt(lang, "cost")}: <b>{costLabels[site.cost - 1]}</b></span>
                            <span>{mt(lang, "season")}: <b>{lang === "ar" ? site.seasonAr : site.season}</b></span>
                            <span>{lang === "ar" ? site.terrainAr : site.terrain}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="estimate-note">{mt(lang, "estimateNote")}</p>
                  </article>
                </div>
                <div className="results-two-col final-row">
                  <article className="result-card engineering-card">
                    <div className="result-card-heading"><div><p className="eyebrow">{mt(lang, "warningKicker")}</p><h4>{mt(lang, "warningTitle")}</h4></div></div>
                    <div className="warning-list">
                      {selectedSites.map((site) => (
                        <div className="warning-item" key={site.id}>
                          <strong>{siteName(site, lang)} · {mt(lang, "warningLabel")}</strong>
                          <p>{lang === "ar" ? site.warningAr : site.warning}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article className="result-card gravity-card">
                    <div className="result-card-heading"><div><p className="eyebrow">{mt(lang, "gravityKicker")}</p><h4>{mt(lang, "gravityTitle")}</h4></div></div>
                    <label className="mass-input">
                      <span>{mt(lang, "payloadMass")}</span>
                      <span><input dir="ltr" type="number" min={1} max={10000} inputMode="numeric" value={state.mass} onChange={(e) => setState((s) => ({ ...s, mass: Math.max(1, Math.min(10000, Number(e.target.value) || 1)) }))} /><b>kg</b></span>
                    </label>
                    <div className="gravity-chart">
                      {gravity.map((world) => (
                        <div className="gravity-row" data-world={world.id} key={world.id}>
                          <span className="gravity-world">{lang === "ar" ? world.ar : world.en}</span>
                          <span className="gravity-track"><i style={{ width: `${world.relative}%` }} /></span>
                          <span className="gravity-value" dir="ltr">{Math.round(world.force).toLocaleString(lang === "ar" ? "ar" : "en")} N · {world.relative.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="estimate-note">{mt(lang, "gravityNote")}</p>
                  </article>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="lab-disclaimer">{mt(lang, "disclaimer")}</p>
      </div>
    </section>
  );
}

// ===== app =====
function initialTheme(): Theme {
  const fromUrl = readParam("theme");
  if (fromUrl === "light" || fromUrl === "dark") return fromUrl;
  try {
    const saved = window.localStorage.getItem("tera-twin-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* storage unavailable */ }
  return "dark";
}

export function App() {
  const [lang, setLang] = useState<Lang>(() => (readParam("lang") === "ar" ? "ar" : "en"));
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = mt(lang, "title");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", mt(lang, "pageDescription"));
    patchParams({ lang });
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f4f7fb" : "#050813");
    try { window.localStorage.setItem("tera-twin-theme", theme); } catch { /* ignore */ }
    patchParams({ theme });
  }, [theme]);

  return (
    <LangContext.Provider value={lang}>
      <ThemeContext.Provider value={theme}>
      <a className="skip-link" href="#twin-finder">{lang === "ar" ? "تخطَّ إلى المستكشف" : "Skip to explorer"}</a>
      <Header lang={lang} onLangChange={setLang} theme={theme} onThemeChange={setTheme} />
      <main>
        <Hero />
        <TerrainExplorer />
        <CandidateSites />
        <MissionLab onLangChange={setLang} />
        <Worlds />
      </main>
      <footer className="site-footer">
        <a className="brand footer-brand" href="#home" aria-label={lang === "ar" ? "العودة إلى الأعلى" : "Back to top"}>
          <span className="brand-mark">TERA TWIN</span>
        </a>
        <p>{mt(lang, "footerMission")}</p>
        <a className="back-top" href="#home"><span>{mt(lang, "backTop")}</span> <span aria-hidden="true">↑</span></a>
        <span className="footer-copy"><span>{mt(lang, "footerLine")}</span> <span className="footer-version">v1.4</span></span>
      </footer>
      </ThemeContext.Provider>
    </LangContext.Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
