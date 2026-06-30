"use client";

import React, { useMemo, useState } from "react";

type Mood =
  | "happy"
  | "focused"
  | "working"
  | "raving"
  | "hungry"
  | "sleepy"
  | "cosmic";

type LogType = "system" | "money" | "care" | "party" | "quest";

type LogItem = {
  id: string;
  text: string;
  type: LogType;
};

type FloatingItem = {
  id: string;
  emoji: string;
  left: number;
  top: number;
};

const missions = [
  "Find money ideas for FeelBassVIP",
  "Find money ideas for Home Setup Solutions",
  "Plan my next delivery move",
  "Tell me who to follow up with",
  "Give me a call script",
  "Create a social media post",
  "Help me fill my calendar",
  "Find a quick win for today",
];

const quests = [
  "Send 3 follow-up messages",
  "Post 1 offer online",
  "Check delivery hot zones",
  "Ask one past customer for a referral",
  "Create one FeelBassVIP promo",
  "Write one new service offer",
];

const treats = ["🍕", "🍩", "🍟", "🍓", "🧃", "🍿", "🍭", "🧁", "🥤", "🍪"];
const rewards = ["💸", "✨", "⚡", "🌈", "🪙", "🎉", "🔥", "🚀", "💎", "⭐"];

function moodMessage(mood: Mood) {
  if (mood === "focused") {
    return "I am scanning your world for the smartest next move.";
  }

  if (mood === "working") {
    return "Money radar online. I am hunting leads, bookings, and delivery wins.";
  }

  if (mood === "raving") {
    return "RAINBOW RAVE BOOST ACTIVE. Big fun. Big energy. Big money hunt.";
  }

  if (mood === "hungry") {
    return "Feed me a treat and I will power up your day.";
  }

  if (mood === "sleepy") {
    return "Tiny alien nap mode. I am recharging my money powers.";
  }

  if (mood === "cosmic") {
    return "Cosmic mode unlocked. I can feel opportunity signals everywhere.";
  }

  return "I am happy, charged, colourful, and ready to help you win today.";
}

function moodGradient(mood: Mood) {
  if (mood === "focused") {
    return "from-cyan-300 via-blue-400 to-indigo-500";
  }

  if (mood === "working") {
    return "from-lime-300 via-emerald-400 to-cyan-400";
  }

  if (mood === "raving") {
    return "from-pink-400 via-fuchsia-400 via-yellow-300 to-cyan-300";
  }

  if (mood === "hungry") {
    return "from-orange-300 via-pink-400 to-yellow-300";
  }

  if (mood === "sleepy") {
    return "from-indigo-300 via-purple-400 to-slate-300";
  }

  if (mood === "cosmic") {
    return "from-violet-300 via-cyan-300 to-lime-300";
  }

  return "from-cyan-300 via-fuchsia-300 to-lime-300";
}

function logDot(type: LogType) {
  if (type === "money") return "text-lime-300";
  if (type === "care") return "text-pink-300";
  if (type === "party") return "text-fuchsia-300";
  if (type === "quest") return "text-yellow-300";
  return "text-cyan-300";
}

export default function EtPage() {
  const [mood, setMood] = useState<Mood>("happy");
  const [xp, setXp] = useState(42);
  const [coins, setCoins] = useState(33);
  const [energy, setEnergy] = useState(82);
  const [rainbow, setRainbow] = useState(50);
  const [streak, setStreak] = useState(1);
  const [combo, setCombo] = useState(0);
  const [speech, setSpeech] = useState(
    "tap me, feed me, or send me on a money hunt!"
  );
  const [floating, setFloating] = useState<FloatingItem[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: "start",
      text: "et activated inside MegaSonic. Fun mode online.",
      type: "party",
    },
  ]);

  const stage = useMemo(() => {
    if (xp < 50) return "hatchling";
    if (xp < 100) return "teen";
    if (xp < 150) return "adult";
    if (xp < 250) return "cosmic";
    return "money deity";
  }, [xp]);

  const xpPercent = Math.min(100, xp % 100);

  function addLog(text: string, type: LogType) {
    setLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        type,
      },
      ...prev.slice(0, 9),
    ]);
  }

  function burst(emoji: string, amount = 12) {
    const newItems = Array.from({ length: amount }).map((_, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      emoji,
      left: 8 + Math.floor(Math.random() * 84),
      top: 12 + Math.floor(Math.random() * 70),
    }));

    setFloating((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      setFloating((prev) =>
        prev.filter(
          (item) => !newItems.some((newItem) => newItem.id === item.id)
        )
      );
    }, 1500);
  }

  function tapEt() {
    const sayings = [
      "boop detected. et likes that.",
      "alien sparkle activated.",
      "tiny money signal found.",
      "MegaSonic power is rising.",
      "tap combo! keep going!",
      "sparkle radar online.",
      "I found a mini opportunity signal.",
    ];

    setCombo((prev) => prev + 1);
    setXp((prev) => prev + 3);
    setCoins((prev) => prev + 1);
    setRainbow((prev) => Math.min(100, prev + 4));
    setSpeech(sayings[Math.floor(Math.random() * sayings.length)]);
    burst("✨", 10);
    addLog("you tapped et. sparkles released.", "party");
  }

  function feedEt() {
    const treat = treats[Math.floor(Math.random() * treats.length)];

    setCoins((prev) => prev + 8);
    setXp((prev) => prev + 12);
    setEnergy((prev) => Math.min(100, prev + 16));
    setMood("happy");
    setSpeech(`${treat} yum. et is powered up.`);
    burst(treat, 14);
    addLog(`you fed et ${treat}. energy increased.`, "care");
  }

  function workEt() {
    setCoins((prev) => prev + 30);
    setXp((prev) => prev + 18);
    setEnergy((prev) => Math.max(0, prev - 12));
    setRainbow((prev) => Math.min(100, prev + 7));
    setMood("working");
    setSpeech("money hunt started. I am scanning leads now.");
    burst("💸", 16);
    addLog("et started hunting leads, bookings, and money ideas.", "money");
  }

  function focusEt() {
    setXp((prev) => prev + 10);
    setEnergy((prev) => Math.max(0, prev - 6));
    setRainbow((prev) => Math.min(100, prev + 5));
    setMood("focused");
    setSpeech("focus beam online. next move analysis running.");
    burst("⚡", 12);
    addLog("et entered focus mode and started scanning tasks.", "system");
  }

  function raveEt() {
    setXp((prev) => prev + 20);
    setCoins((prev) => prev + 12);
    setEnergy((prev) => Math.min(100, prev + 8));
    setRainbow(100);
    setMood("raving");
    setSpeech("RAINBOW RAVE MODE!!!");
    burst("🌈", 24);
    addLog("et entered rainbow rave mode. everything is glowing.", "party");
  }

  function napEt() {
    setEnergy((prev) => Math.min(100, prev + 25));
    setMood("sleepy");
    setSpeech("et is recharging. dreaming about money signals.");
    burst("💤", 10);
    addLog("et took a tiny alien recharge nap.", "care");
  }

  function cosmicEt() {
    setXp((prev) => prev + 30);
    setCoins((prev) => prev + 25);
    setEnergy(100);
    setRainbow(100);
    setMood("cosmic");
    setSpeech("COSMIC OPPORTUNITY RADAR UNLOCKED.");
    burst("💎", 22);
    addLog("cosmic mode activated. et is scanning bigger opportunities.", "party");
  }

  function completeQuest(quest: string) {
    if (completedQuests.includes(quest)) return;

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    setCompletedQuests((prev) => [...prev, quest]);
    setCoins((prev) => prev + 40);
    setXp((prev) => prev + 25);
    setRainbow((prev) => Math.min(100, prev + 12));
    setStreak((prev) => prev + 1);
    setMood("raving");
    setSpeech(`quest complete! reward unlocked ${reward}`);
    burst(reward, 18);
    addLog(`quest complete: ${quest}. reward earned ${reward}`, "quest");
  }

  function useMission(mission: string) {
    setMood("focused");
    setXp((prev) => prev + 8);
    setCoins((prev) => prev + 5);
    setRainbow((prev) => Math.min(100, prev + 6));
    setSpeech(`mission loaded: ${mission}`);
    burst("🚀", 12);
    addLog(`mission selected: ${mission}.`, "money");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#02020a] p-4 text-white md:p-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute -right-40 top-10 h-96 w-96 animate-pulse rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 animate-pulse rounded-full bg-lime-400/25 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,255,255,0.32),transparent_22rem),radial-gradient(circle_at_85%_15%,rgba(255,0,180,0.35),transparent_24rem),radial-gradient(circle_at_50%_50%,rgba(255,255,0,0.18),transparent_25rem),radial-gradient(circle_at_20%_85%,rgba(0,255,120,0.24),transparent_26rem),radial-gradient(circle_at_90%_80%,rgba(130,80,255,0.30),transparent_28rem)]" />

        <div className="absolute inset-0 animate-pulse bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,0,128,0.16),rgba(0,255,255,0.16),rgba(255,255,0,0.13),rgba(57,255,136,0.15),rgba(130,80,255,0.16),rgba(255,0,128,0.16))]" />

        <div className="absolute left-[-20%] top-[10%] h-40 w-[140%] rotate-12 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent blur-2xl" />
        <div className="absolute left-[-20%] top-[35%] h-40 w-[140%] -rotate-12 bg-gradient-to-r from-transparent via-fuchsia-300/15 to-transparent blur-2xl" />
        <div className="absolute left-[-20%] top-[60%] h-40 w-[140%] rotate-6 bg-gradient-to-r from-transparent via-lime-300/15 to-transparent blur-2xl" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute inset-0 bg-[#02020a]/35" />
      </div>

      <div className="pointer-events-none fixed inset-0 opacity-80">
        {floating.map((item) => (
          <div
            key={item.id}
            className="absolute animate-bounce text-3xl md:text-5xl"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
            }}
          >
            {item.emoji}
          </div>
        ))}

        <div className="absolute left-8 top-20 h-2 w-2 animate-ping rounded-full bg-cyan-300" />
        <div className="absolute right-20 top-32 h-3 w-3 animate-pulse rounded-full bg-fuchsia-300" />
        <div className="absolute bottom-32 left-1/4 h-2 w-2 animate-ping rounded-full bg-lime-300" />
        <div className="absolute bottom-20 right-1/3 h-3 w-3 animate-pulse rounded-full bg-yellow-300" />
        <div className="absolute left-1/2 top-16 h-2 w-2 animate-ping rounded-full bg-white" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_0_60px_rgba(0,234,255,0.16)] backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                MegaSonic living assistant
              </p>

              <h1
                className={`mt-2 bg-gradient-to-r ${moodGradient(
                  mood
                )} bg-clip-text text-5xl font-black lowercase tracking-[0.08em] text-transparent md:text-7xl`}
              >
                et fun money pet
              </h1>

              <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
                tap et, feed him treats, launch quests, complete missions, build
                streaks, and turn your day into a colourful money-hunting game.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TopBadge label="stage" value={stage} />
              <TopBadge label="streak" value={`${streak}x`} />
              <TopBadge label="coins" value={`${coins}`} />
              <TopBadge label="combo" value={`${combo}`} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_0_45px_rgba(255,0,200,0.12)] backdrop-blur md:p-6">
            <div
              className={`relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br ${moodGradient(
                mood
              )} p-1`}
            >
              <div className="relative rounded-[2rem] bg-[#050511] p-5 text-center md:p-8">
                <div className="absolute left-1/2 top-6 h-24 w-40 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-2xl" />
                <div className="absolute bottom-8 left-10 h-24 w-24 animate-pulse rounded-full bg-fuchsia-300/20 blur-xl" />
                <div className="absolute bottom-8 right-10 h-24 w-24 animate-pulse rounded-full bg-lime-300/20 blur-xl" />

                <div className="mx-auto flex h-20 w-32 animate-bounce items-center justify-center rounded-full border border-cyan-300/40 bg-gradient-to-r from-slate-800 via-cyan-950 to-slate-800 text-5xl shadow-[0_0_35px_rgba(0,234,255,0.5)]">
                  🛸
                </div>

                <div className="mx-auto h-20 w-24 bg-gradient-to-b from-cyan-300/30 to-transparent blur-sm" />

                <button
                  type="button"
                  onClick={tapEt}
                  className="group relative mx-auto mt-2 block h-80 w-full max-w-md rounded-[2rem] border border-white/10 bg-black/20 transition hover:scale-[1.02] hover:border-cyan-300/50"
                >
                  <div className="absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 animate-ping rounded-full border border-cyan-300/20" />
                  <div className="absolute left-1/2 top-14 h-48 w-48 -translate-x-1/2 animate-pulse rounded-full bg-cyan-300/10 blur-2xl" />

                  <div className="absolute left-1/2 top-12 -translate-x-1/2 animate-bounce">
                    <div className="relative">
                      <div className="absolute left-1/2 top-[-2rem] h-12 w-1 -translate-x-1/2 rounded-full bg-lime-300" />
                      <div className="absolute left-1/2 top-[-3rem] h-7 w-7 -translate-x-1/2 animate-ping rounded-full bg-yellow-300" />
                      <div className="absolute left-1/2 top-[-3rem] h-7 w-7 -translate-x-1/2 rounded-full bg-yellow-200" />

                      <div className="relative h-52 w-44 rounded-[45%] border border-lime-100/60 bg-gradient-to-br from-lime-200 via-emerald-400 to-cyan-500 shadow-[0_0_70px_rgba(57,255,136,0.45)] transition group-hover:rotate-3">
                        <div className="absolute left-[-2rem] top-20 h-20 w-10 rotate-12 rounded-full bg-gradient-to-b from-emerald-300 to-cyan-500 shadow-[0_0_18px_rgba(57,255,136,0.45)]" />
                        <div className="absolute right-[-2rem] top-20 h-20 w-10 -rotate-12 rounded-full bg-gradient-to-b from-emerald-300 to-cyan-500 shadow-[0_0_18px_rgba(57,255,136,0.45)]" />

                        <div className="flex justify-center gap-6 pt-14">
                          <div className="h-12 w-8 rounded-full bg-black shadow-[0_0_14px_rgba(0,0,0,0.6)]">
                            <div className="mx-auto mt-2 h-4 w-4 animate-pulse rounded-full bg-cyan-200" />
                            <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-white" />
                          </div>
                          <div className="h-12 w-8 rounded-full bg-black shadow-[0_0_14px_rgba(0,0,0,0.6)]">
                            <div className="mx-auto mt-2 h-4 w-4 animate-pulse rounded-full bg-cyan-200" />
                            <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-white" />
                          </div>
                        </div>

                        <div className="mx-auto mt-7 h-5 w-20 rounded-full bg-black/70">
                          <div className="mx-auto h-5 w-10 rounded-full bg-pink-300" />
                        </div>

                        <div className="absolute bottom-[-3rem] left-9 h-16 w-9 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600" />
                        <div className="absolute bottom-[-3rem] right-9 h-16 w-9 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600" />

                        <div className="absolute bottom-8 left-5 rounded-full bg-pink-400 px-2 py-1 text-xs">
                          ★
                        </div>
                        <div className="absolute bottom-8 right-5 rounded-full bg-yellow-300 px-2 py-1 text-xs text-black">
                          $
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
                    tap et
                  </div>
                </button>

                <div className="mx-auto mt-5 max-w-xl rounded-3xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                    et says
                  </p>
                  <p className="mt-2 text-lg font-black text-white">
                    “{speech}”
                  </p>
                </div>

                <p className="mt-4 text-sm text-cyan-100">
                  {moodMessage(mood)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <ActionButton label="feed" onClick={feedEt} tone="lime" />
              <ActionButton label="work" onClick={workEt} tone="cyan" />
              <ActionButton label="focus" onClick={focusEt} tone="blue" />
              <ActionButton label="rave" onClick={raveEt} tone="pink" />
              <ActionButton label="nap" onClick={napEt} tone="purple" />
              <ActionButton label="cosmic" onClick={cosmicEt} tone="yellow" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Meter
                label="xp charge"
                value={xpPercent}
                gradient={moodGradient(mood)}
              />
              <Meter
                label="energy"
                value={energy}
                gradient="from-lime-300 via-yellow-300 to-orange-400"
              />
              <Meter
                label="rainbow power"
                value={rainbow}
                gradient="from-pink-400 via-yellow-300 to-cyan-300"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 backdrop-blur md:p-6">
              <h2 className="text-2xl font-black lowercase tracking-[0.12em] text-white">
                mood controls
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {(
                  [
                    "happy",
                    "focused",
                    "working",
                    "raving",
                    "hungry",
                    "sleepy",
                    "cosmic",
                  ] as Mood[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMood(item);
                      setSpeech(`mood changed to ${item}.`);
                      burst("✨", 8);
                    }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-black lowercase transition hover:-translate-y-1 ${
                      mood === item
                        ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                        : "border-white/10 bg-black/30 text-slate-200 hover:border-cyan-300/40"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 backdrop-blur md:p-6">
              <h2 className="text-2xl font-black lowercase tracking-[0.12em] text-white">
                active missions
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                tap a mission and et will enter focus mode with rewards.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {missions.map((mission, index) => (
                  <button
                    key={mission}
                    type="button"
                    onClick={() => useMission(mission)}
                    className="group rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                          mission {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-200">
                          {mission}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-lg transition group-hover:scale-110">
                        🚀
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 backdrop-blur md:p-6">
              <h2 className="text-2xl font-black lowercase tracking-[0.12em] text-white">
                daily quests
              </h2>

              <div className="mt-4 grid gap-3">
                {quests.map((quest) => {
                  const done = completedQuests.includes(quest);

                  return (
                    <button
                      key={quest}
                      type="button"
                      onClick={() => completeQuest(quest)}
                      disabled={done}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        done
                          ? "border-lime-300/30 bg-lime-300/10 text-lime-100"
                          : "border-white/10 bg-black/30 text-slate-200 hover:-translate-y-1 hover:border-yellow-300/40 hover:bg-yellow-300/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{quest}</span>
                        <span className="text-xl">{done ? "✅" : "🎯"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 backdrop-blur md:p-6">
              <h2 className="text-2xl font-black lowercase tracking-[0.12em] text-white">
                live et log
              </h2>

              <div className="mt-4 space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200"
                  >
                    <span className={`mr-2 ${logDot(log.type)}`}>●</span>
                    {log.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TopBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-black lowercase text-white">{value}</p>
    </div>
  );
}

function Meter({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: "lime" | "cyan" | "blue" | "pink" | "purple" | "yellow";
}) {
  const styles =
    tone === "lime"
      ? "border-lime-300/30 bg-lime-300/10 text-lime-100 hover:bg-lime-300/20"
      : tone === "cyan"
      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
      : tone === "blue"
      ? "border-blue-300/30 bg-blue-300/10 text-blue-100 hover:bg-blue-300/20"
      : tone === "pink"
      ? "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100 hover:bg-fuchsia-300/20"
      : tone === "purple"
      ? "border-purple-300/30 bg-purple-300/10 text-purple-100 hover:bg-purple-300/20"
      : "border-yellow-300/30 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-black lowercase tracking-[0.1em] transition hover:-translate-y-1 ${styles}`}
    >
      {label}
    </button>
  );
}
