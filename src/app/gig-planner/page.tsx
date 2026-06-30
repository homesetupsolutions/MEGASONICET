"use client";

import React, { useMemo, useState } from "react";

type PlatformId = "uber-eats" | "doordash-downtown" | "instacart";

type Platform = {
  id: PlatformId;
  name: string;
  shortName: string;
  mode: string;
  area: string;
  active: boolean;
  goal: number;
};

type TimeBlock = {
  id: string;
  label: string;
  time: string;
  bestFor: PlatformId;
  backup: PlatformId;
  completed: boolean;
  notes: string;
};

const starterPlatforms: Platform[] = [
  {
    id: "uber-eats",
    name: "Uber Eats",
    shortName: "Uber",
    mode: "Drive",
    area: "Flexible / city-wide",
    active: true,
    goal: 80
  },
  {
    id: "doordash-downtown",
    name: "DoorDash Downtown",
    shortName: "DoorDash",
    mode: "Bike",
    area: "Downtown",
    active: true,
    goal: 70
  },
  {
    id: "instacart",
    name: "Instacart",
    shortName: "Instacart",
    mode: "Mostly shopping",
    area: "Grocery / shopping runs",
    active: true,
    goal: 90
  }
];

const starterBlocks: TimeBlock[] = [
  {
    id: "morning",
    label: "Morning",
    time: "8:00 AM - 11:00 AM",
    bestFor: "instacart",
    backup: "uber-eats",
    completed: false,
    notes: "Start with grocery orders before lunch."
  },
  {
    id: "lunch",
    label: "Lunch Rush",
    time: "11:00 AM - 2:00 PM",
    bestFor: "doordash-downtown",
    backup: "uber-eats",
    completed: false,
    notes: "Bike downtown and avoid parking problems."
  },
  {
    id: "afternoon",
    label: "Afternoon",
    time: "2:00 PM - 5:00 PM",
    bestFor: "instacart",
    backup: "doordash-downtown",
    completed: false,
    notes: "Use this as a steady shopping/order window."
  },
  {
    id: "dinner",
    label: "Dinner Rush",
    time: "5:00 PM - 9:00 PM",
    bestFor: "uber-eats",
    backup: "doordash-downtown",
    completed: false,
    notes: "Drive for longer dinner delivery routes."
  },
  {
    id: "late",
    label: "Late Flex",
    time: "9:00 PM - 11:00 PM",
    bestFor: "uber-eats",
    backup: "doordash-downtown",
    completed: false,
    notes: "Only work this if the day goal is not reached."
  }
];

function platformStyle(id: PlatformId) {
  if (id === "uber-eats") {
    return "border-lime-300/40 bg-lime-300/10 text-lime-100";
  }

  if (id === "doordash-downtown") {
    return "border-red-300/40 bg-red-300/10 text-red-100";
  }

  return "border-cyan-300/40 bg-cyan-300/10 text-cyan-100";
}

function getPlatformName(platforms: Platform[], id: PlatformId) {
  return platforms.find((platform) => platform.id === id)?.name || id;
}

function getPlatformShortName(platforms: Platform[], id: PlatformId) {
  return platforms.find((platform) => platform.id === id)?.shortName || id;
}

function isPlatformActive(platforms: Platform[], id: PlatformId) {
  return platforms.some((platform) => platform.id === id && platform.active);
}

export default function DeliveryPlannerPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(starterPlatforms);
  const [blocks, setBlocks] = useState<TimeBlock[]>(starterBlocks);
  const [dayGoal, setDayGoal] = useState("180");
  const [actualEarned, setActualEarned] = useState("");
  const [dayNotes, setDayNotes] = useState("");

  const activePlatforms = platforms.filter((platform) => platform.active);

  const totals = useMemo(() => {
    const activeGoal = platforms
      .filter((platform) => platform.active)
      .reduce((sum, platform) => sum + platform.goal, 0);

    const completedBlocks = blocks.filter((block) => block.completed).length;
    const remainingGoal = Math.max(Number(dayGoal || 0) - Number(actualEarned || 0), 0);

    return {
      activeApps: activePlatforms.length,
      activeGoal,
      completedBlocks,
      remainingGoal
    };
  }, [platforms, blocks, dayGoal, actualEarned, activePlatforms.length]);

  function togglePlatform(id: PlatformId) {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id
          ? { ...platform, active: !platform.active }
          : platform
      )
    );
  }

  function updatePlatformGoal(id: PlatformId, value: string) {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id
          ? { ...platform, goal: Number(value || 0) }
          : platform
      )
    );
  }

  function toggleBlockComplete(id: string) {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, completed: !block.completed } : block
      )
    );
  }

  function updateBlockNote(id: string, value: string) {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, notes: value } : block
      )
    );
  }

  function chooseRecommendedPlatform(block: TimeBlock) {
    if (isPlatformActive(platforms, block.bestFor)) {
      return block.bestFor;
    }

    if (isPlatformActive(platforms, block.backup)) {
      return block.backup;
    }

    return block.bestFor;
  }

  return (
    <main className="min-h-screen bg-[#05050a] p-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,136,0.14),transparent_32rem),radial-gradient(circle_at_top_right,rgba(255,70,70,0.12),transparent_34rem),radial-gradient(circle_at_bottom,rgba(0,234,255,0.1),transparent_30rem)]" />

      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_35px_rgba(0,234,255,0.08)] backdrop-blur-xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            Daily Delivery Planner
          </p>

          <h1 className="mt-2 bg-gradient-to-r from-lime-300 via-cyan-300 to-red-300 bg-clip-text text-4xl font-black uppercase tracking-[0.1em] text-transparent">
            Plan My Day
          </h1>

          <p className="mt-3 max-w-4xl text-sm text-slate-300">
            Toggle your delivery apps, set goals, mark time blocks complete, and
            choose the best app for each part of the day.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Stat label="Apps On" value={String(totals.activeApps)} />
            <Stat label="App Goal Total" value={`$${totals.activeGoal}`} />
            <Stat label="Blocks Done" value={`${totals.completedBlocks}/${blocks.length}`} />
            <Stat label="Remaining" value={`$${totals.remainingGoal}`} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <Panel title="Toggle Apps">
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`rounded-3xl border p-4 transition ${
                      platform.active
                        ? "border-cyan-300/30 bg-white/[0.06]"
                        : "border-white/10 bg-black/40 opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white">
                          {platform.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-300">
                          {platform.mode} • {platform.area}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                          platform.active
                            ? "border-lime-300/40 bg-lime-300/10 text-lime-100"
                            : "border-white/10 bg-white/[0.04] text-slate-400"
                        }`}
                      >
                        {platform.active ? "On" : "Off"}
                      </button>
                    </div>

                    <label className="mt-4 block">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Goal
                      </span>

                      <input
                        value={platform.goal}
                        onChange={(event) =>
                          updatePlatformGoal(platform.id, event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Money Tracker">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Day Goal"
                  value={dayGoal}
                  onChange={setDayGoal}
                  placeholder="180"
                />

                <Field
                  label="Actual Earned"
                  value={actualEarned}
                  onChange={setActualEarned}
                  placeholder="0"
                />
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Day Notes
                </span>

                <textarea
                  value={dayNotes}
                  onChange={(event) => setDayNotes(event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  placeholder="Example: start Instacart, switch downtown for lunch, drive dinner rush..."
                />
              </label>
            </Panel>
          </div>

          <Panel title="Time Block Plan">
            <div className="space-y-3">
              {blocks.map((block) => {
                const selectedPlatform = chooseRecommendedPlatform(block);
                const selectedIsActive = isPlatformActive(platforms, selectedPlatform);

                return (
                  <div
                    key={block.id}
                    className={`rounded-3xl border p-5 transition ${
                      block.completed
                        ? "border-lime-300/40 bg-lime-300/10"
                        : selectedIsActive
                          ? "border-cyan-300/30 bg-black/40"
                          : "border-white/10 bg-black/20 opacity-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          {block.label}
                        </p>

                        <h3 className="mt-1 text-xl font-black text-white">
                          {block.time}
                        </h3>

                        <p className="mt-3 text-sm text-slate-300">
                          {block.notes}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Backup: {getPlatformName(platforms, block.backup)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-black uppercase ${platformStyle(
                            selectedPlatform
                          )}`}
                        >
                          {getPlatformShortName(platforms, selectedPlatform)}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleBlockComplete(block.id)}
                          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                            block.completed
                              ? "border-lime-300/40 bg-lime-300/10 text-lime-100"
                              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/40"
                          }`}
                        >
                          {block.completed ? "Done" : "Mark Done"}
                        </button>
                      </div>
                    </div>

                    <label className="mt-4 block">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        Block Note
                      </span>

                      <input
                        value={block.notes}
                        onChange={(event) =>
                          updateBlockNote(block.id, event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-lime-300/20 bg-lime-300/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-200">
                Active Plan
              </p>

              <p className="mt-2 text-sm text-lime-50">
                Today you are running:{" "}
                <strong>
                  {activePlatforms.length
                    ? activePlatforms
                        .map((platform) => platform.name)
                        .join(", ")
                    : "No apps selected"}
                </strong>
              </p>

              <p className="mt-3 text-sm text-slate-300">
                Simple flow: Instacart for grocery windows, DoorDash Downtown on
                bike for lunch, and Uber Eats driving for dinner.
              </p>

              {dayNotes.trim() && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Your Day Notes
                  </p>

                  <p className="mt-2 text-sm text-slate-200">{dayNotes}</p>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
      <h2 className="mb-5 text-xl font-black uppercase tracking-[0.12em] text-white">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
