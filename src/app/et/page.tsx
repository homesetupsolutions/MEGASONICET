"use client";

import React, { useMemo, useState } from "react";

type Mood = "happy" | "focused" | "working" | "raving";

type LogItem = {
  id: string;
  text: string;
  type: "system" | "money" | "care";
};

const quickActions = [
  "Find money ideas for FeelBassVIP",
  "Find money ideas for Home Setup Solutions",
  "Tell me who to follow up with",
  "Give me a call script",
  "Tell me what to post today",
  "Help me fill my calendar"
];

function moodMessage(mood: Mood) {
  if (mood === "focused") {
    return "ET is focused on filling your calendar and finding your next money move.";
  }

  if (mood === "working") {
    return "ET is working hard. Time to hunt leads, bookings, and delivery income.";
  }

  if (mood === "raving") {
    return "ET is in rainbow rave mode. Big energy. Big money hunt.";
  }

  return "ET is happy and ready to help.";
}

export default function ETPage() {
  const [mood, setMood] = useState<Mood>("happy");
  const [xp, setXp] = useState(25);
  const [coins, setCoins] = useState(10);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: "start",
      text: "ET is awake inside MegaSonic and ready to hunt money.",
      type: "system"
    }
  ]);

  const stage = useMemo(() => {
    if (xp < 50) return "Hatchling";
    if (xp < 100) return "Teen";
    if (xp < 150) return "Adult";
    return "Money Deity";
  }, [xp]);

  function addLog(text: string, type: LogItem["type"]) {
    setLogs((prev) => [
      {
        id: `${Date.now()}`,
        text,
        type
      },
      ...prev
    ]);
  }

  function feedET() {
    setCoins((prev) => prev + 5);
    setXp((prev) => prev + 10);
    setMood("happy");
    addLog("You fed ET. ET gained XP and coins.", "care");
  }

  function workET() {
    setCoins((prev) => prev + 20);
    setXp((prev) => prev + 15);
    setMood("working");
    addLog("ET started hunting for leads and money ideas.", "money");
  }

  function raveET() {
    setXp((prev) => prev + 8);
    setMood("raving");
    addLog("ET entered rainbow rave mode.", "system");
  }

  function useQuickAction(action: string) {
    setMood("focused");
    setXp((prev) => prev + 5);
    addLog(`ET task selected: ${action}.`, "money");
  }

  return (
    <main className="min-h-screen bg-[#05050a] p-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,234,255,0.16),transparent_32rem),radial-gradient(circle_at_top_right,rgba(255,0,180,0.14),transparent_34rem),radial-gradient(circle_at_bottom,rgba(57,255,136,0.1),transparent_30rem)]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_35px_rgba(0,234,255,0.08)]">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            MegaSonic ET
          </p>

          <h1 className="mt-2 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-lime-300 bg-clip-text text-4xl font-black uppercase tracking-[0.1em] text-transparent">
            ET Money Pet
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            ET helps you hunt leads, money ideas, follow-ups, bookings, delivery
            work, and daily action steps.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 text-center">
              <div className="text-8xl">👽</div>

              <h2 className="mt-4 text-3xl font-black text-white">
                ET is {stage}
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                {moodMessage(mood)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Stat label="Mood" value={mood} />
              <Stat label="XP" value={String(xp)} />
              <Stat label="Coins" value={String(coins)} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={feedET}
                className="rounded-2xl border border-lime-300/30 bg-lime-300/10 px-4 py-3 text-sm font-black uppercase text-lime-100"
              >
                Feed ET
              </button>

              <button
                type="button"
                onClick={workET}
                className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-black uppercase text-cyan-100"
              >
                Work ET
              </button>

              <button
                type="button"
                onClick={raveET}
                className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-3 text-sm font-black uppercase text-fuchsia-100"
              >
                Rave ET
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
                ET Quick Hunts
              </h2>

              <div className="mt-4 grid gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => useQuickAction(action)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:border-cyan-300/40"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
                ET Log
              </h2>

              <div className="mt-4 space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200"
                  >
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}
