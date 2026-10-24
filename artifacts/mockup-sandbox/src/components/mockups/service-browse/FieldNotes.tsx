import React, { useMemo, useState } from "react";

type IconName = "search" | "pin" | "clock" | "chevron" | "star" | "tool" | "oil" | "brake" | "scan" | "tire" | "battery" | "wind" | "calendar" | "chat" | "user" | "plus" | "close" | "check" | "arrow" | "verified";

const palette = {
  paper: "#F3EBDD",
  card: "#FBF7EF",
  ink: "#26332F",
  muted: "#7F8277",
  line: "#DED5C5",
  vermilion: "#BC503A",
  moss: "#6E7861",
  gold: "#D49A42",
  softGold: "#F0E1C4",
};

function Icon({ name, size = 18, color = palette.ink, strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const shapes: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    tool: <><path d="M14.7 6.3a4.2 4.2 0 0 0-5.6 5.6L3.5 17.5a2.1 2.1 0 0 0 3 3l5.6-5.6a4.2 4.2 0 0 0 5.6-5.6l-2.6 2.6-2.8-2.8 2.4-2.8Z" /></>,
    oil: <><path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z" /><path d="M9.2 15.5a3 3 0 0 0 2.8 2" /></>,
    brake: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.1" /><path d="M12 3.5v2M20.5 12h-2M12 20.5v-2M3.5 12h2" /></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M7 12h10M9 9v6m6-6v6" /></>,
    tire: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v5m9 4h-5m-4 9v-5m-9-4h5" /></>,
    battery: <><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V4m6 3V4M8 13h3m-1.5-1.5v3m4-1.5h2" /></>,
    wind: <><path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a2 2 0 1 1-2 2M3 16h10a3 3 0 1 1-3 3" /></>,
    calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3.5v4m9-4v4M4 9.5h16" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.7-.8L4 20l1.2-3.2A7 7 0 0 1 4 12.5 7.5 7.5 0 0 1 12 5a7.5 7.5 0 0 1 8 6.5Z" /><path d="M8.5 12h.1m3.4 0h.1m3.4 0h.1" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    plus: <><path d="M12 5v14m-7-7h14" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
    verified: <><path d="m12 3 2.2 1.2 2.5-.1 1.2 2.2 2.1 1.3-.2 2.5 1.2 2.2-1.4 2.1.1 2.5-2.2 1.2-1.3 2.1-2.5-.2-2.2 1.2-2.1-1.4-2.5.1-1.2-2.2-2.1-1.3.2-2.5L3 12l1.4-2.1-.1-2.5 2.2-1.2 1.3-2.1 2.5.2L12 3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{shapes[name]}</svg>;
}

const services: { name: string; price: number; icon: IconName }[] = [
  { name: "Oil change", price: 75, icon: "oil" },
  { name: "Brake service", price: 250, icon: "brake" },
  { name: "Diagnostics", price: 100, icon: "scan" },
  { name: "Tire service", price: 60, icon: "tire" },
  { name: "Battery", price: 150, icon: "battery" },
  { name: "A/C service", price: 120, icon: "wind" },
];

const mechanics = [
  { name: "Marcus Johnson", specialty: "German vehicles", rating: "4.9", reviews: 127, distance: "0.8 mi", rate: 85, initials: "MJ", color: "#D9A67C", available: true },
  { name: "Sarah Chen", specialty: "Japanese imports", rating: "4.8", reviews: 89, distance: "1.2 mi", rate: 75, initials: "SC", color: "#B9BDA1", available: true },
  { name: "David Rodriguez", specialty: "Domestic vehicles", rating: "4.7", reviews: 156, distance: "2.1 mi", rate: 70, initials: "DR", color: "#D6B9A3", available: false },
  { name: "Emily Watson", specialty: "Electric vehicles", rating: "5.0", reviews: 43, distance: "3.5 mi", rate: 95, initials: "EW", color: "#C4C4A8", available: true },
];

const shops = [
  { name: "AutoCare Pro Center", address: "2450 Pacific Coast Hwy", city: "Long Beach", rating: "4.8", reviews: 215, distance: "1.5 mi", hours: "Mon–Sat", initials: "AP" },
  { name: "Precision Auto Works", address: "8901 Sunset Blvd", city: "West Hollywood", rating: "4.9", reviews: 178, distance: "2.3 mi", hours: "Mon–Fri", initials: "PW" },
  { name: "QuickFix Garage", address: "1234 Main Street", city: "Santa Monica", rating: "4.6", reviews: 312, distance: "0.9 mi", hours: "Open daily", initials: "QF" },
];

export function FieldNotes() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState("Browse");
  const [selected, setSelected] = useState<{ title: string; subtitle: string } | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  const filteredMechanics = useMemo(() => mechanics.filter((item) => `${item.name} ${item.specialty}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const filteredShops = useMemo(() => shops.filter((item) => `${item.name} ${item.address} ${item.city}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const chooseDetail = (title: string, subtitle: string) => setSelected({ title, subtitle });

  return (
    <div style={{ ...s.root, backgroundColor: palette.paper }}>
      <style>{`
        * { box-sizing: border-box; }
        .field-scroll::-webkit-scrollbar, .field-row::-webkit-scrollbar { display: none; }
        .field-scroll, .field-row { scrollbar-width: none; }
        @keyframes field-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes field-in { from { opacity: 0; } to { opacity: 1; } }
        .field-enter { animation: field-rise .55s cubic-bezier(.2,.7,.2,1) both; }
        .field-overlay { animation: field-in .18s ease-out both; }
        .field-button { transition: transform .18s ease, background-color .18s ease; }
        .field-button:active { transform: scale(.97); }
        input::placeholder { color: #929084; opacity: 1; }
      `}</style>
      <div style={s.paperGrain} />
      <div style={s.statusBar}>
        <span style={s.statusTime}>9:41</span>
        <div style={s.statusRight}>
          <span style={s.signal}><i style={s.signalBar1} /><i style={s.signalBar2} /><i style={s.signalBar3} /><i style={s.signalBar4} /></span>
          <span style={s.statusWifi}>⌁</span>
          <span style={s.batteryShell}><i style={s.batteryFill} /><b style={s.batteryNub} /></span>
        </div>
      </div>

      <main className="field-scroll" style={s.scroll}>
        <header className="field-enter" style={s.header}>
          <div style={s.eyebrowRow}>
            <div style={s.locationPill}><Icon name="pin" size={12} color={palette.vermilion} /><span>WEST HOLLYWOOD, CA</span></div>
            <div style={s.sunMark} aria-label="Your neighborhood"><span style={s.sunDot} /></div>
          </div>
          <p style={s.welcome}>WELCOME BACK, ALEX</p>
          <h1 style={s.title}>Find a <em>service.</em></h1>
          <p style={s.subhead}>Good hands are closer than you think.</p>
        </header>

        <div className="field-enter" style={{ ...s.searchWrap, animationDelay: "50ms" }}>
          <Icon name="search" size={18} color={palette.moss} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search mechanics or services" placeholder="Search mechanics or services..." style={s.searchInput} />
          {query && <button aria-label="Clear search" onClick={() => setQuery("")} style={s.clearSearch}><Icon name="close" size={15} color={palette.muted} /></button>}
          {!query && <span style={s.searchHint}>⌘ K</span>}
        </div>

        <section className="field-enter" style={{ ...s.section, animationDelay: "100ms" }}>
          <div style={s.sectionHead}>
            <div><p style={s.kicker}>START WITH THE BASICS</p><h2 style={s.sectionTitle}>Popular services</h2></div>
            <button className="field-button" onClick={() => setShowAll((value) => !value)} style={s.textLink}>{showAll ? "Less" : "See all"} <Icon name="arrow" size={14} color={palette.vermilion} /></button>
          </div>
          <div className="field-row" style={s.serviceRow}>
            {(showAll ? [...services, { name: "More repairs", price: 200, icon: "tool" as IconName }] : services).map((service, index) => (
              <button key={service.name} className="field-button" onClick={() => chooseDetail(service.name, `From $${service.price} · Usually 30–90 min`)} style={s.serviceCard}>
                <div style={{ ...s.serviceIcon, background: index % 3 === 1 ? "#EEE1C8" : "#F2E4D9" }}><Icon name={service.icon} size={22} color={index % 3 === 1 ? palette.moss : palette.vermilion} /></div>
                <span style={s.serviceName}>{service.name}</span>
                <span style={s.servicePrice}>FROM <b>${service.price}</b></span>
              </button>
            ))}
          </div>
        </section>

        <section className="field-enter" style={{ ...s.section, animationDelay: "160ms" }}>
          <div style={s.sectionHead}>
            <div><p style={s.kicker}>GOOD PEOPLE, CLOSE BY</p><h2 style={s.sectionTitle}>Nearby mechanics</h2></div>
            <span style={s.countTag}><i />{filteredMechanics.length} around you</span>
          </div>
          <div style={s.cardStack}>
            {filteredMechanics.length ? filteredMechanics.map((mechanic, index) => (
              <button key={mechanic.name} className="field-button" onClick={() => chooseDetail(mechanic.name, `${mechanic.specialty} · ${mechanic.distance} away`)} style={{ ...s.personCard, animationDelay: `${index * 40}ms` }}>
                <div style={{ ...s.avatar, background: mechanic.color }}><span>{mechanic.initials}</span><i style={{ ...s.presenceDot, background: mechanic.available ? palette.moss : "#B6AA97" }} /></div>
                <div style={s.personBody}>
                  <div style={s.personTitleLine}><strong style={s.personName}>{mechanic.name}</strong><span style={s.rating}><Icon name="star" size={12} color={palette.gold} />{mechanic.rating}</span></div>
                  <span style={s.personSpecialty}>{mechanic.specialty}</span>
                  <div style={s.personMeta}><span style={s.metaItem}><Icon name="pin" size={12} color={palette.muted} />{mechanic.distance}</span><i style={s.metaDot} /><b style={s.metaPrice}>${mechanic.rate}/hr</b><i style={s.metaDot} /><span>{mechanic.reviews} reviews</span></div>
                </div>
                <div style={s.cardArrow}><Icon name="chevron" size={16} color={palette.vermilion} /></div>
              </button>
            )) : <div style={s.emptyState}>No mechanics match that search. Try a different name or specialty.</div>}
          </div>
        </section>

        <section className="field-enter" style={{ ...s.section, ...s.lastSection, animationDelay: "220ms" }}>
          <div style={s.sectionHead}>
            <div><p style={s.kicker}>LOCAL SHOPS WORTH KNOWING</p><h2 style={s.sectionTitle}>Nearby shops</h2></div>
            <span style={s.countTag}>{filteredShops.length} nearby</span>
          </div>
          <div style={s.cardStack}>
            {filteredShops.length ? filteredShops.map((shop) => (
              <button key={shop.name} className="field-button" onClick={() => chooseDetail(shop.name, `${shop.address}, ${shop.city}`)} style={s.personCard}>
                <div style={{ ...s.avatar, ...s.shopAvatar }}><span>{shop.initials}</span><div style={s.verified}><Icon name="check" size={9} color={palette.card} /></div></div>
                <div style={s.personBody}>
                  <div style={s.personTitleLine}><strong style={s.personName}>{shop.name}</strong><span style={s.rating}><Icon name="star" size={12} color={palette.gold} />{shop.rating}</span></div>
                  <span style={s.personSpecialty}>{shop.address}, {shop.city}</span>
                  <div style={s.personMeta}><span style={s.metaItem}><Icon name="clock" size={12} color={palette.muted} />{shop.hours}</span><i style={s.metaDot} /><span>{shop.distance}</span><i style={s.metaDot} /><span>{shop.reviews} reviews</span></div>
                </div>
                <div style={s.cardArrow}><Icon name="chevron" size={16} color={palette.vermilion} /></div>
              </button>
            )) : <div style={s.emptyState}>No shops found in this part of town.</div>}
          </div>
        </section>
      </main>

      <button className="field-button" onClick={() => { setBooked(false); setBookingOpen(true); }} style={s.fab}><Icon name="plus" size={20} color={palette.card} /><span>Book a service</span></button>
      <nav style={s.bottomNav} aria-label="Main navigation">
        {([{ name: "Browse", icon: "search" }, { name: "Bookings", icon: "calendar" }, { name: "Messages", icon: "chat", badge: true }, { name: "Profile", icon: "user" }] as { name: string; icon: IconName; badge?: boolean }[]).map((item) => {
          const active = activeTab === item.name;
          return <button key={item.name} onClick={() => setActiveTab(item.name)} style={{ ...s.navItem, color: active ? palette.vermilion : palette.muted }}>
            <span style={{ ...s.navIcon, color: active ? palette.vermilion : palette.muted }}><Icon name={item.icon} size={19} color={active ? palette.vermilion : palette.muted} />{item.badge && <i style={s.navBadge} />}</span>
            <span style={{ ...s.navLabel, fontWeight: active ? 700 : 500 }}>{item.name}</span>
          </button>;
        })}
      </nav>

      {(bookingOpen || selected) && <div className="field-overlay" style={s.modalBackdrop} onClick={() => { setBookingOpen(false); setSelected(null); }}>
        <div role="dialog" aria-modal="true" aria-label={bookingOpen ? "Book a service" : selected?.title} style={s.sheet} onClick={(event) => event.stopPropagation()}>
          <div style={s.sheetHandle} />
          <button onClick={() => { setBookingOpen(false); setSelected(null); }} aria-label="Close" style={s.sheetClose}><Icon name="close" size={17} color={palette.ink} /></button>
          {bookingOpen ? booked ? <><div style={s.sheetIcon}><Icon name="check" size={22} color={palette.card} /></div><p style={s.kicker}>REQUEST NOTED</p><h3 style={s.sheetTitle}>We’ll find the right hands.</h3><p style={s.sheetCopy}>Your service request is ready. Choose a mechanic to confirm a time.</p><button className="field-button" style={s.confirmButton} onClick={() => setBookingOpen(false)}>Back to browsing <Icon name="arrow" size={16} color={palette.card} /></button></> : <><p style={s.kicker}>A BETTER KIND OF BREAKDOWN</p><h3 style={s.sheetTitle}>What does your car need?</h3><p style={s.sheetCopy}>Pick a starting point. You can fine-tune the details with your mechanic.</p><div style={s.quickChoices}>{services.slice(0, 4).map((service) => <button key={service.name} className="field-button" onClick={() => { setBookingOpen(false); setSelected({ title: service.name, subtitle: `Starting at $${service.price}` }); }} style={s.quickChoice}><Icon name={service.icon} size={16} color={palette.vermilion} /><span>{service.name}</span><Icon name="chevron" size={14} color={palette.muted} /></button>)}</div><button className="field-button" style={s.confirmButton} onClick={() => setBooked(true)}>Request a match <Icon name="arrow" size={16} color={palette.card} /></button></> : <><p style={s.kicker}>MEET YOUR LOCAL EXPERT</p><h3 style={s.sheetTitle}>{selected?.title}</h3><p style={s.sheetCopy}>{selected?.subtitle}</p><div style={s.detailNote}><Icon name="verified" size={19} color={palette.moss} /><span>Verified local pros, clear pricing, and no surprises.</span></div><button className="field-button" style={s.confirmButton} onClick={() => { setSelected(null); setBookingOpen(true); }}>Book this service <Icon name="arrow" size={16} color={palette.card} /></button></>}
        </div>
      </div>}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { position: "relative", width: "100%", height: "100dvh", minHeight: 650, maxWidth: 540, margin: "0 auto", overflow: "hidden", color: palette.ink, fontFamily: "'DM Sans', 'Avenir Next', sans-serif", WebkitFontSmoothing: "antialiased" },
  paperGrain: { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.18, zIndex: 0, backgroundImage: "radial-gradient(#9f9075 0.55px, transparent 0.55px)", backgroundSize: "6px 6px" },
  statusBar: { position: "relative", zIndex: 1, height: 46, padding: "13px 25px 0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  statusTime: { fontSize: 13, fontWeight: 700, letterSpacing: ".01em" },
  statusRight: { display: "flex", gap: 7, alignItems: "center", color: palette.ink },
  statusWifi: { fontSize: 19, fontWeight: 700, lineHeight: "14px", transform: "rotate(-90deg)" },
  signal: { height: 13, display: "flex", gap: 2, alignItems: "flex-end" },
  signalBar1: { width: 3, height: 4, display: "block", borderRadius: "1px 1px 0 0", background: palette.ink },
  signalBar2: { width: 3, height: 6, display: "block", borderRadius: "1px 1px 0 0", background: palette.ink },
  signalBar3: { width: 3, height: 9, display: "block", borderRadius: "1px 1px 0 0", background: palette.ink },
  signalBar4: { width: 3, height: 12, display: "block", borderRadius: "1px 1px 0 0", background: palette.ink },
  batteryShell: { width: 19, height: 10, border: `1.2px solid ${palette.ink}`, borderRadius: 3, display: "flex", alignItems: "center", padding: 1, position: "relative" },
  batteryFill: { width: 12, height: 6, borderRadius: 1, background: palette.ink, display: "block" },
  batteryNub: { position: "absolute", right: -3, top: 2, width: 2, height: 4, borderRadius: "0 1px 1px 0", background: palette.ink },
  scroll: { position: "relative", zIndex: 1, height: "calc(100dvh - 123px)", overflowY: "auto", paddingBottom: 25 },
  header: { padding: "14px 23px 18px" },
  eyebrowRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 21 },
  locationPill: { height: 27, display: "flex", alignItems: "center", gap: 6, padding: "0 10px", border: `1px solid ${palette.line}`, borderRadius: 99, color: palette.muted, fontSize: 9, fontWeight: 700, letterSpacing: ".11em" },
  sunMark: { width: 33, height: 33, border: `1px solid ${palette.line}`, borderRadius: "50%", position: "relative", display: "grid", placeItems: "center" },
  sunDot: { width: 10, height: 10, border: `1.5px solid ${palette.gold}`, borderRadius: "50%", boxShadow: `0 0 0 4px ${palette.softGold}` },
  welcome: { color: palette.vermilion, fontSize: 10, fontWeight: 800, letterSpacing: ".16em", margin: "0 0 4px" },
  title: { color: palette.ink, fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: 37, lineHeight: 1.03, letterSpacing: "-.035em", margin: 0 },
  subhead: { color: palette.muted, fontFamily: "Georgia, serif", fontSize: 14, fontStyle: "italic", margin: "8px 0 0" },
  searchWrap: { position: "relative", margin: "0 22px 28px", height: 52, display: "flex", alignItems: "center", gap: 11, padding: "0 14px", background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 9, boxShadow: "0 3px 9px rgba(86,67,42,.04)" },
  searchInput: { flex: 1, minWidth: 0, outline: "none", border: 0, background: "transparent", color: palette.ink, font: "500 13px 'DM Sans', sans-serif" },
  searchHint: { fontSize: 10, color: "#A7A091", border: `1px solid ${palette.line}`, borderRadius: 4, padding: "3px 5px" },
  clearSearch: { border: 0, background: "transparent", display: "grid", placeItems: "center", padding: 4, cursor: "pointer" },
  section: { marginBottom: 28 },
  lastSection: { paddingBottom: 20 },
  sectionHead: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 23px", marginBottom: 13 },
  kicker: { margin: "0 0 4px", fontSize: 8, lineHeight: 1.3, fontWeight: 800, letterSpacing: ".17em", color: palette.muted },
  sectionTitle: { margin: 0, color: palette.ink, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, lineHeight: 1.08, fontWeight: 400, letterSpacing: "-.015em" },
  textLink: { border: 0, background: "transparent", color: palette.vermilion, display: "flex", alignItems: "center", gap: 5, font: "700 11px 'DM Sans', sans-serif", cursor: "pointer", padding: "5px 0" },
  serviceRow: { display: "flex", gap: 10, overflowX: "auto", padding: "0 22px 3px" },
  serviceCard: { flex: "0 0 118px", height: 131, textAlign: "left", padding: "12px 12px 11px", border: `1px solid ${palette.line}`, borderRadius: 9, background: palette.card, boxShadow: "0 3px 8px rgba(86,67,42,.04)", display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer" },
  serviceIcon: { width: 39, height: 39, display: "grid", placeItems: "center", borderRadius: 8, marginBottom: "auto" },
  serviceName: { marginTop: 8, color: palette.ink, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  servicePrice: { marginTop: 4, color: palette.muted, fontSize: 8, letterSpacing: ".08em" },
  countTag: { color: palette.muted, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, padding: "6px 9px", background: "#EBE4D7", borderRadius: 5, marginBottom: 1 },
  cardStack: { display: "flex", flexDirection: "column", gap: 9, padding: "0 22px" },
  personCard: { minHeight: 84, width: "100%", display: "flex", alignItems: "center", padding: "11px 10px", gap: 11, border: `1px solid ${palette.line}`, borderRadius: 9, textAlign: "left", background: palette.card, boxShadow: "0 3px 9px rgba(86,67,42,.045)", cursor: "pointer" },
  avatar: { width: 48, height: 48, flex: "0 0 48px", borderRadius: 9, display: "grid", placeItems: "center", position: "relative", color: "#fffaf1", fontFamily: "Georgia, serif", fontSize: 16, letterSpacing: "-.04em", textShadow: "0 1px 2px rgba(60,47,33,.2)" },
  presenceDot: { position: "absolute", width: 10, height: 10, right: -2, bottom: -1, borderRadius: "50%", border: `2px solid ${palette.card}` },
  personBody: { flex: 1, minWidth: 0 },
  personTitleLine: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 },
  personName: { color: palette.ink, fontSize: 12, lineHeight: 1.2, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 },
  rating: { flex: "0 0 auto", display: "flex", alignItems: "center", gap: 2, background: "#F2E8D4", padding: "3px 5px", borderRadius: 4, color: "#8A672E", fontSize: 10, fontWeight: 700 },
  personSpecialty: { display: "block", color: palette.muted, fontSize: 10, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  personMeta: { display: "flex", alignItems: "center", gap: 6, marginTop: 7, color: palette.muted, fontSize: 9, whiteSpace: "nowrap" },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 3 },
  metaDot: { width: 2, height: 2, borderRadius: "50%", background: "#B8AE9D", flex: "0 0 auto" },
  metaPrice: { color: palette.vermilion, fontSize: 9, fontWeight: 700 },
  cardArrow: { flex: "0 0 25px", width: 25, height: 25, border: `1px solid ${palette.line}`, borderRadius: "50%", display: "grid", placeItems: "center" },
  shopAvatar: { background: "#7A7963", borderRadius: 9 },
  verified: { position: "absolute", right: -4, bottom: -4, width: 17, height: 17, background: palette.moss, border: `2px solid ${palette.card}`, borderRadius: "50%", display: "grid", placeItems: "center" },
  emptyState: { background: palette.card, border: `1px dashed ${palette.line}`, color: palette.muted, fontSize: 12, lineHeight: 1.5, padding: "18px 16px", borderRadius: 9 },
  fab: { position: "absolute", zIndex: 3, right: 19, bottom: 91, height: 48, padding: "0 17px", display: "flex", alignItems: "center", gap: 8, border: 0, borderRadius: 99, background: palette.vermilion, color: palette.card, boxShadow: "0 7px 16px rgba(119,55,40,.25)", font: "700 12px 'DM Sans', sans-serif", cursor: "pointer" },
  bottomNav: { position: "absolute", zIndex: 2, bottom: 0, left: 0, right: 0, height: 77, background: "rgba(248,243,233,.97)", borderTop: `1px solid ${palette.line}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "5px 13px 8px" },
  navItem: { width: 66, height: 57, border: 0, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" },
  navIcon: { position: "relative", height: 23, display: "grid", placeItems: "center" },
  navLabel: { fontSize: 9, letterSpacing: ".02em" },
  navBadge: { position: "absolute", top: -1, right: -4, width: 6, height: 6, background: palette.vermilion, border: `1px solid ${palette.card}`, borderRadius: "50%" },
  modalBackdrop: { position: "absolute", zIndex: 5, inset: 0, display: "flex", alignItems: "flex-end", background: "rgba(37,43,37,.32)", backdropFilter: "blur(2px)" },
  sheet: { position: "relative", width: "100%", padding: "11px 24px 29px", borderRadius: "18px 18px 0 0", background: palette.card, boxShadow: "0 -10px 35px rgba(40,33,25,.15)" },
  sheetHandle: { width: 38, height: 4, borderRadius: 99, background: "#D7CEBF", margin: "0 auto 24px" },
  sheetClose: { position: "absolute", top: 17, right: 20, border: `1px solid ${palette.line}`, background: "transparent", width: 31, height: 31, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer" },
  sheetIcon: { display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: "50%", background: palette.moss, marginBottom: 18 },
  sheetTitle: { margin: "0 40px 8px 0", fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, lineHeight: 1.08, fontWeight: 400, color: palette.ink },
  sheetCopy: { margin: "0 0 19px", color: palette.muted, fontSize: 13, lineHeight: 1.55 },
  quickChoices: { display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 },
  quickChoice: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", border: `1px solid ${palette.line}`, borderRadius: 7, background: palette.paper, color: palette.ink, textAlign: "left", cursor: "pointer", font: "600 12px 'DM Sans', sans-serif" },
  confirmButton: { width: "100%", height: 49, border: 0, borderRadius: 7, background: palette.vermilion, color: palette.card, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, cursor: "pointer", font: "700 12px 'DM Sans', sans-serif" },
  detailNote: { display: "flex", alignItems: "center", gap: 10, padding: "12px 13px", borderRadius: 7, background: "#E8E9DD", color: "#58604F", fontSize: 11, lineHeight: 1.4, margin: "18px 0" },
};
