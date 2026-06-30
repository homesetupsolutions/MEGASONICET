"use client";

import React, { useMemo, useState } from "react";

type PlatformId = "uber-eats" | "doordash-downtown" | "instacart";

type Platform = {
  id: PlatformId;
  name: string;
  mode: string;
  area: string;
  color: string;
  active: boolean;
  goal: number;
};

const starterPlatforms: Platform[] = [
  {
    id: "uber-eats",
    name: "Uber Eats",
    mode: "Drive",
    area: "Flexible / city-wide",
    color: "lime",
    active: true,
    goal: 80
  },
  {
    id: "doordash-downtown",
    name: "DoorDash Downtown",
    mode: "Bike",
    area: "Downtown",
    color: "red",
    active: true,
    goal: 70
  },
  {
    id: "instacart",
    name: "Instacart",
    mode: "Mostly",
    area: "Grocery / shopping runs",
    color: "cyan",
    active: true,
    goal: 90
  }
];

const timeBlocks = [
  {
    label: "Morning",
    time: "8:00 AM - 11:00 AM",
    bestFor: "Instacart",
    reason: "Good grocery order window before lunch rush."
  },
  {
    label: "Lunch Rush",
    time: "11:00 AM - 2:00 PM",
    bestFor: "DoorDash Downtown",
    reason: "Bike downtown to avoid parking and catch restaurant orders."
  },
  {
    label: "Afternoon",
    time: "2:00 PM - 5:00 PM",
    bestFor: "Instacart",
    reason: "Steady shopping orders and less restaurant pressure."
  },
  {
    label: "Dinner Rush",
    time: "5:00 PM - 9:00 PM",
    bestFor: "Uber Eats",
    reason: "Driving works better for longer dinner delivery routes."
  }
];

function badgeClass(platformName: string) {
  if (platformName.includes("Uber")) {
    return "border-lime-300/40 bg-lime-300/10 text-lime-100";
  }

  if (platformName.includes("DoorDash")) {
    return "border-red-300/40 bg-red-300/10 text-red-100";
  }

  return "border-cyan-300/40 bg-cyan-300/10 text-cyan-100";
}

export default function GigPlannerPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(starterPlatforms);
  const [dayGoal, setDayGoal] = useState("180");
  const [notes, setNotes] = useState("");

  const activePlatforms = platforms.filter((platform) => platform.active);

  const totals = useMemo(() => {
    const activeCount = platforms.filter((platform) => platform.active).length;
    const potential = platforms
      .filter((platform) => platform.active)
      .reduce((sum, platform) => sum + platform.goal, 0);

    return { activeCount, potential };
  }, [platforms]);

  function togglePlatform(id: PlatformId) {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id ? { ...platform, active: !platform.active } : platform
      )
    );
  }

  function updateGoal(id: PlatformId, value: string) {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id
          ? { ...platform, goal: Number(value || 0) }
          : platform
      )
    );
  }

  function recommendedPlatform(bestFor: string) {
    const matching = platforms.find((platform) => platform.name === bestFor);
    if (!matching) return false;
    return matching.active;
  }

  return (
    <main className="min-h-screen bg-[#05050a] p-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,136,0.14),transparent_32rem),radial-gradient(circle_at_top_right,rgba(255,70,70,0.12),transparent_34rem),radial-gradient(circle_at_bottom,rgba(0,234,255,0.1),transparent_30rem)]" />

      <section className="relative z-10">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_35px_rgba(0,234,255,0.08)] backdrop-blur-xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            Daily Delivery Planner
          </p>

          <h1 className="mt-2 bg-gradient-to-r from-lime-300 via-cyan-300 to-red-300 bg-clip-text text-4xl font-black uppercase tracking-[0.1em] text-transparent">
            Gig Planner
          </h1>

          <p className="mt-3 max-w-4xl text-sm text-slate-300">
            Toggle your active apps for the day and plan around the best delivery
            windows: Uber Eats by car, DoorDash Downtown by bike, and Instacart
            mostly for shopping runs.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Stat label="Apps On" value={String(totals.activeCount)} />
            <Stat label="App Goal Total" value={`$${totals.potential}`} />
            <Stat label="Your Day Goal" value={`$${Number(dayGoal || 0)}`} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
                Toggle Apps
              </h2>

              <div className="mt-5 space-y-3">
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
                          updateGoal(platform.id, event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
                Day Goal
              </h2>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Target Earnings
                </span>

                <input
                  value={dayGoal}
                  onChange={(event) => setDayGoal(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Notes
                </span>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  placeholder="Example: start with Instacart, switch downtown for lunch, drive dinner rush..."
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
              Suggested Day Plan
            </h2>

            <div className="mt-5 space-y-3">
              {timeBlocks.map((block) => {
                const isActive = recommendedPlatform(block.bestFor);

                return (
                  <div
                    key={block.label}
                    className={`rounded-3xl border p-5 transition ${
                      isActive
                        ? "border-cyan-300/30 bg-black/40"
                        : "border-white/10 bg-black/20 opacity-40"
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
                          {block.reason}
                        </p>
                      </div>

                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-black uppercase ${badgeClass(
                          block.bestFor
                        )}`}
                      >
                        {block.bestFor}
                      </span>
                    </div>

                    {!isActive && (
                      <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">
                        This block is dimmed because {block.bestFor} is toggled
                        off.
                      </p>
                    )}
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
                    ? activePlatforms.map((platform) => platform.name).join(", ")
                    : "No apps selected"}
                </strong>
              </p>

              <p className="mt-3 text-sm text-slate-300">
                Best simple flow: Instacart for grocery windows, DoorDash
                Downtown on bike for lunch, and Uber Eats driving for dinner.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
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
