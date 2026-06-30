"use client";

import React, { useMemo, useState } from "react";

type ScanItem = {
  id: string;
  time: string;
  text: string;
  hot?: boolean;
};

type Lead = {
  id: string;
  source: string;
  idea: string;
};

const quickQuestions = [
  "Who should I call RIGHT NOW to make money today?",
  "Read me the best inbound script for FeelBass.",
  "What grants can I apply for this week?",
  "Draft a follow-up text for my newest lead.",
  "What's my calendar look like?",
  "Suggest a price bump that won't lose customers.",
];

const leadSources = [
  "Facebook Groups",
  "Google Maps",
  "Reddit r/halifax",
  "Thumbtack",
  "Eventbrite",
  "Local wedding forum",
  "Kijiji",
  "Nextdoor",
  "Instagram comments",
  "Homeowner posts",
];

const leadIdeas = [
  "cafe openings asking about sound setup",
  "homeowner asking for wi-fi mesh help",
  "wedding client looking for speaker rentals",
  "small office needing cable cleanup",
  "real estate agent needing referral partnerships",
  "POS complaint that could become install work",
  "event host asking about bass experience",
  "customer asking about TV mounting",
  "business looking for smart home setup",
  "DJ looking for immersive bass add-on",
];

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function randomFrom(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function EtPage() {
  const [xp, setXp] = useState(0);
  const [hunting, setHunting] = useState(100);
  const [waiting, setWaiting] = useState(100);
  const [today, setToday] = useState(0);
  const [total, setTotal] = useState(0);
  const [mood, setMood] = useState("sleepy");
  const [eggMode, setEggMode] = useState("cosmic");
  const [phone, setPhone] = useState("");
  const [askText, setAskText] = useState("");
  const [latestFind, setLatestFind] = useState(
    "Email local real estate agents for referral partnerships."
  );
  const [alienReply, setAlienReply] = useState(
    "👽 Hi. I'm your alien. Type a phone number to pull up a customer, ask me ANYTHING about the business, or click a Quick Question below."
  );

  const [scan, setScan] = useState<ScanItem[]>([
    {
      id: "1",
      time: nowTime(),
      text: "tagged warm prospect from Google Maps",
      hot: true,
    },
    {
      id: "2",
      time: nowTime(),
      text: "cross-checking Reddit r/halifax for new homeowner posts",
    },
    {
      id: "3",
      time: nowTime(),
      text: "scanning Facebook Groups for wi-fi mesh asks",
    },
    {
      id: "4",
      time: nowTime(),
      text: "watching Eventbrite for speaker-rental asks",
    },
    {
      id: "5",
      time: nowTime(),
      text: "spotted possible lead on Facebook Groups — cafe openings",
      hot: true,
    },
    {
      id: "6",
      time: nowTime(),
      text: "saved as lead a prospect from Local wedding forum",
      hot: true,
    },
    {
      id: "7",
      time: nowTime(),
      text: "spotted possible lead on Thumbtack — POS complaints",
      hot: true,
    },
  ]);

  const hatchText = useMemo(() => {
    const left = Math.max(1, 3 - today);
    return `${left} MORE WINS UNTIL HATCHLING`;
  }, [today]);

  function addScan(text: string, hot = false) {
    setScan((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: nowTime(),
        text,
        hot,
      },
      ...prev.slice(0, 8),
    ]);
  }

  function huntForMoney() {
    const source = randomFrom(leadSources);
    const idea = randomFrom(leadIdeas);
    const find = `${source}: ${idea}.`;

    setXp((prev) => prev + 3);
    setToday((prev) => prev + 1);
    setTotal((prev) => prev + 1);
    setHunting(100);
    setWaiting(100);
    setMood("hunting");
    setEggMode("cosmic");
    setLatestFind(find);
    setAlienReply(
      `💸 New money trail found: ${find} Best next move: send a short message offering help today.`
    );

    addScan(`spotted possible lead on ${source} — ${idea}`, true);
  }

  function teachTrick() {
    setXp((prev) => prev + 2);
    setMood("learning");
    setAlienReply(
      "💗 Trick learned: when you find a warm lead, ask one tiny yes/no question first. Example: “Still need help with this?”"
    );
    addScan("learned a new sales trick from Evan", true);
  }

  function lookupPhone() {
    if (!phone.trim()) {
      setAlienReply("📞 Type a phone number first, then I will build a call/text script.");
      return;
    }

    setAlienReply(
      `📞 Phone lookup ready for ${phone}. Suggested opener: “Hey, this is Evan. I saw you may need help with setup/install work. Do you still need someone reliable?”`
    );
    addScan(`phone lookup prepared for ${phone}`, true);
  }

  function askAlien(question?: string) {
    const q = question || askText;

    if (!q.trim()) {
      setAlienReply("👽 Ask me anything about money, leads, scripts, pricing, or your next move.");
      return;
    }

    setXp((prev) => prev + 1);
    setMood("thinking");

    if (q.toLowerCase().includes("call")) {
      setAlienReply(
        "☎️ Call warmest prospects first: past customers, real estate agents, property managers, cafes, wedding/event people, and anyone who already asked about setup help."
      );
    } else if (q.toLowerCase().includes("script")) {
      setAlienReply(
        "📝 Script: “Hey, this is Evan. Quick one — are you still looking for help with your setup? I can make it simple and get it handled fast.”"
      );
    } else if (q.toLowerCase().includes("grant")) {
      setAlienReply(
        "🏛️ Grant idea: look for Alberta small business, innovation, accessibility tech, tourism/event, and digital adoption grants."
      );
    } else if (q.toLowerCase().includes("price")) {
      setAlienReply(
        "💰 Safe price bump: raise premium/emergency/after-hours jobs first. Keep basic pricing stable, but add a faster-service upgrade."
      );
    } else {
      setAlienReply(
        `👽 My answer: do the smallest money action now. For “${q}”, I would create one offer, send it to 5 warm people, then follow up within 24 hours.`
      );
    }

    addScan(`alien answered: ${q.slice(0, 52)}`, false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#1a0033] p-4 text-white">
      <style>{`
        @keyframes rainbowDrift {
          0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
          50% { background-position: 100% 50%; filter: hue-rotate(80deg); }
          100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
        }

        @keyframes eggFloat {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }

        @keyframes eggHunt {
          0% { transform: translateX(0) rotate(-8deg) scale(1); }
          25% { transform: translateX(7px) rotate(7deg) scale(1.04); }
          50% { transform: translateX(-5px) rotate(-5deg) scale(1.02); }
          75% { transform: translateX(8px) rotate(8deg) scale(1.05); }
          100% { transform: translateX(0) rotate(-8deg) scale(1); }
        }

        @keyframes starMove {
          0% { transform: translateY(0); opacity: .45; }
          50% { transform: translateY(-14px); opacity: 1; }
          100% { transform: translateY(0); opacity: .45; }
        }

        .rainbow-shell {
          background:
            radial-gradient(circle at 10% 20%, rgba(0,255,255,.55), transparent 12rem),
            radial-gradient(circle at 80% 20%, rgba(255,0,220,.55), transparent 15rem),
            radial-gradient(circle at 45% 100%, rgba(255,230,0,.35), transparent 18rem),
            linear-gradient(120deg, #ff00c8, #8a2be2, #00d4ff, #00ff88, #ffe600, #ff00c8);
          background-size: 220% 220%;
          animation: rainbowDrift 8s ease-in-out infinite;
        }

        .egg {
          animation: ${mood === "hunting" ? "eggHunt" : "eggFloat"} 1.5s ease-in-out infinite;
        }

        .star {
          animation: starMove 3s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 rainbow-shell opacity-95" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.18),transparent_25rem),linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]" />

      <div className="star pointer-events-none fixed left-1/3 top-12 text-white/80">·</div>
      <div className="star pointer-events-none fixed left-1/2 top-20 text-white/80">·</div>
      <div className="star pointer-events-none fixed right-1/4 top-32 text-white/80">·</div>
      <div className="star pointer-events-none fixed right-20 top-16 text-white/80">·</div>

      <section className="relative z-10 mx-auto max-w-[1500px]">
        <div className="rounded-xl border border-white/20 bg-purple-950/45 p-5 shadow-2xl backdrop-blur">
          <div className="grid gap-5 lg:grid-cols-[170px_1fr_290px]">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 flex gap-2 text-[10px] font-black">
                <span className="rounded-full bg-fuchsia-500 px-2 py-1">ET</span>
                <span className="rounded-full bg-yellow-300 px-2 py-1 text-black">
                  🥚 Egg
                </span>
              </div>

              <button
                type="button"
                onClick={huntForMoney}
                className="egg relative h-32 w-24 rounded-[50%] border-4 border-cyan-300 bg-gradient-to-br from-pink-300 via-cyan-300 to-lime-300 shadow-[0_0_35px_rgba(0,255,255,.8)]"
              >
                <div className="absolute left-6 top-8 h-2 w-5 rounded-full bg-white/80" />
                <div className="absolute left-4 top-12 h-3 w-3 rounded-full bg-fuchsia-400" />
                <div className="absolute right-5 top-12 h-3 w-3 rounded-full bg-purple-600" />
                <div className="absolute left-1/2 top-20 h-2 w-8 -translate-x-1/2 rounded-full bg-cyan-700/50" />
              </button>

              <div className="mt-5 flex flex-wrap justify-center gap-2 text-[10px] font-bold">
                <button className="rounded-full bg-white/20 px-2 py-1">front</button>
                <button className="rounded-full bg-white/20 px-2 py-1">👁</button>
                <button className="rounded-full bg-white/20 px-2 py-1">🎵</button>
                <button className="rounded-full bg-pink-400 px-2 py-1">feed</button>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
                <span className="rounded-full bg-cyan-500/70 px-3 py-1">🧪 Cosmic</span>
                <span className="rounded-full bg-white/20 px-3 py-1">○ resting</span>
                <span className="rounded-full bg-white/20 px-3 py-1">mood: {mood}</span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300"
                  style={{ width: `${Math.min(100, xp * 7)}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] font-bold text-white/70">
                XP {xp} · {hatchText} · H=HUNT P=POKE C=CHAT
              </p>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
                🔍 Hunting for leads on Facebook...
              </h1>

              <p className="mt-3 text-sm text-white/75">
                latest find — {latestFind}
              </p>

              <div className="mt-6 grid grid-cols-4 gap-2">
                <StatBox value={hunting} label="hunting" color="text-cyan-300" />
                <StatBox value={waiting} label="waiting" color="text-yellow-300" />
                <StatBox value={today} label="today" color="text-lime-300" />
                <StatBox value={total} label="total" color="text-fuchsia-300" />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <button
                type="button"
                onClick={huntForMoney}
                className="rounded-lg bg-gradient-to-r from-yellow-300 to-lime-300 px-5 py-5 text-sm font-black uppercase text-black shadow-xl transition hover:scale-105"
              >
                ⚡ Hunt for money (H)
              </button>

              <button
                type="button"
                onClick={teachTrick}
                className="rounded-lg border border-white/20 bg-white/15 px-4 py-3 text-left text-xs font-bold text-white/80 transition hover:bg-white/25"
              >
                Teach me a trick... (+2 xp) 💗
              </button>

              <p className="text-[10px] leading-relaxed text-white/60">
                et grows every time a hunt scores a win. Feed treats or teach
                tricks to help them level up.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-fuchsia-400/40 bg-[#050016]/90 p-5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-300">
              🌐 Live scan · always on
            </h2>
            <p className="text-[10px] text-white/50">
              real hunt runs hourly · free between runs
            </p>
          </div>

          <div className="space-y-1 font-mono text-xs">
            {scan.map((item) => (
              <div key={item.id} className={item.hot ? "text-yellow-300" : "text-cyan-300"}>
                <span className="mr-3 text-white/45">{item.time}</span>
                <span className="mr-2">{item.hot ? "✦" : "↳"}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-4">
            <Panel title="☎ phone lookup">
              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={lookupPhone}
                  className="rounded-lg bg-fuchsia-500 px-4 py-3 font-black"
                >
                  🔍
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <SmallButton label="Call" />
                <SmallButton label="Text" />
                <SmallButton label="Draft" />
              </div>
            </Panel>

            <Panel title="▣ call scripts">
              <p className="text-xs italic text-white/60">
                Look up a phone number to see scripts, or click below.
              </p>

              <div className="mt-4 rounded-lg bg-black/25 p-3 text-xs text-white/70">
                Suggested script will appear here after phone lookup.
              </div>
            </Panel>
          </div>

          <Panel title="✣ ask the alien — anything">
            <div className="mb-4 flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => askAlien(question)}
                  className="rounded-full bg-black/25 px-3 py-2 text-[10px] text-white/70 transition hover:bg-fuchsia-500/40 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-sm font-bold leading-relaxed text-white">
              {alienReply}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={askText}
                onChange={(event) => setAskText(event.target.value)}
                placeholder="Ask et anything..."
                className="w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => askAlien()}
                className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-black"
              >
                Ask
              </button>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-black/35 p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase text-white/50">
        {label}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-fuchsia-400/30 bg-[#25003f]/80 p-4 shadow-xl">
      <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-pink-200">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SmallButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/20 hover:text-white"
    >
      {label}
    </button>
  );
}
