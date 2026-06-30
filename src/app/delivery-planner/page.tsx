"use client";

import React, { useMemo, useState } from "react";

type PlatformId = "uber-eats" | "doordash-downtown" | "instacart";

type Platform = {
  id: PlatformId;
  name: string;
  shortName: string;
  mode: string;
  bestArea: string;
  active: boolean;
  goal: number;
  strength: string;
};

type TimeBlock = {
  id: string;
  label: string;
  time: string;
  hourStart: number;
  bestFor: PlatformId;
  backup: PlatformId;
  completed: boolean;
  notes: string;
};

type AiPlan = {
  app: PlatformId;
  location: string;
  action: string;
  reason: string;
  backup: string;
  urgency: "Low" | "Medium" | "High";
};

const starterPlatforms: Platform[] = [
  {
    id: "uber-eats",
    name: "Uber Eats",
    shortName: "Uber",
    mode: "Drive",
    bestArea: "busy restaurant zones, suburbs, longer dinner routes",
    active: true,
    goal: 80,
    strength: "Best when driving, especially dinner and longer trips."
  },
  {
    id: "doordash-downtown",
    name: "DoorDash Downtown",
    shortName: "DoorDash",
    mode: "Bike",
    bestArea: "Downtown restaurant clusters",
    active: true,
    goal: 70,
    strength: "Best downtown when parking is hard and bike speed matters."
  },
  {
    id: "instacart",
    name: "Instacart",
    shortName: "Instacart",
    mode: "Mostly shopping",
    bestArea: "grocery stores, Costco, Walmart, Superstore, Safeway zones",
    active: true,
    goal: 90,
    strength: "Best for grocery shopping windows and steady daytime batches."
  }
];

const starterBlocks: TimeBlock[] = [
  {
    id: "morning",
    label: "Morning",
    time: "8:00 AM - 11:00 AM",
    hourStart: 8,
    bestFor: "instacart",
    backup: "uber-eats",
    completed: false,
    notes: "Start near grocery stores. Watch for good Instacart batches."
  },
  {
    id: "lunch",
    label: "Lunch Rush",
    time: "11:00 AM - 2:00 PM",
    hourStart: 11,
    bestFor: "doordash-downtown",
    backup: "uber-eats",
    completed: false,
    notes: "Go downtown by bike. Focus on fast restaurant pickups."
  },
  {
    id: "afternoon",
    label: "Afternoon",
    time: "2:00 PM - 5:00 PM",
    hourStart: 14,
    bestFor: "instacart",
    backup: "doordash-downtown",
    completed: false,
    notes: "Return to grocery/store zones. Use this as a steady order window."
  },
  {
    id: "dinner",
    label: "Dinner Rush",
    time: "5:00 PM - 9:00 PM",
    hourStart: 17,
    bestFor: "uber-eats",
    backup: "doordash-downtown",
    completed: false,
    notes: "Drive dinner routes. Prioritize high-value restaurant orders."
  },
  {
    id: "late",
    label: "Late Flex",
    time: "9:00 PM - 11:00 PM",
    hourStart: 21,
    bestFor: "uber-eats",
    backup: "doordash-downtown",
    completed: false,
    notes: "Only work late if your day goal is not reached."
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

function getPlatform(platforms: Platform[], id: PlatformId) {
  return platforms.find((platform) => platform.id === id);
}

function getPlatformName(platforms: Platform[], id: PlatformId) {
  return getPlatform(platforms, id)?.name || id;
}

function getPlatformShortName(platforms: Platform[], id: PlatformId) {
  return getPlatform(platforms, id)?.shortName || id;
}

function isPlatformActive(platforms: Platform[], id: PlatformId) {
  return platforms.some((platform) => platform.id === id && platform.active);
}

function getCurrentHourOverride(value: string) {
  if (!value) return null;

  const hour = Number(value);

  if (Number.isNaN(hour)) return null;
  if (hour < 0) return 0;
  if (hour > 23) return 23;

  return hour;
}

function getCurrentBlock(blocks: TimeBlock[], overrideHour: number | null) {
  const realHour = new Date().getHours();
  const hour = overrideHour ?? realHour;

  if (hour >= 8 && hour < 11) {
    return blocks.find((block) => block.id === "morning") || blocks[0];
  }

  if (hour >= 11 && hour < 14) {
    return blocks.find((block) => block.id === "lunch") || blocks[0];
  }

  if (hour >= 14 && hour < 17) {
    return blocks.find((block) => block.id === "afternoon") || blocks[0];
  }

  if (hour >= 17 && hour < 21) {
    return blocks.find((block) => block.id === "dinner") || blocks[0];
  }

  return blocks.find((block) => block.id === "late") || blocks[blocks.length - 1];
}

function chooseRecommendedPlatform(
  platforms: Platform[],
  block: TimeBlock,
  remainingGoal: number
) {
  if (remainingGoal > 120 && isPlatformActive(platforms, "instacart")) {
    return "instacart";
  }

  if (isPlatformActive(platforms, block.bestFor)) {
    return block.bestFor;
  }

  if (isPlatformActive(platforms, block.backup)) {
    return block.backup;
  }

  const firstActive = platforms.find((platform) => platform.active);

  return firstActive?.id || block.bestFor;
}

function buildAiPlan({
  platforms,
  block,
  selectedPlatform,
  remainingGoal,
  actualEarned
}: {
  platforms: Platform[];
  block: TimeBlock;
  selectedPlatform: PlatformId;
  remainingGoal: number;
  actualEarned: number;
}): AiPlan {
  const platform = getPlatform(platforms, selectedPlatform);

  if (selectedPlatform === "instacart") {
    return {
      app: selectedPlatform,
      location: "Go near major grocery stores or shopping plazas.",
      action:
        "Open Instacart first. Wait for a strong batch before moving too far. Avoid low-pay heavy orders.",
      reason:
        remainingGoal > 120
          ? "You still have a lot left to earn, so a higher-value shopping batch can help catch up."
          : "This time block is better for grocery and shopping runs.",
      backup: "If no good batch appears in 15 minutes, switch to DoorDash Downtown or Uber Eats.",
      urgency: remainingGoal > 100 ? "High" : "Medium"
    };
  }

  if (selectedPlatform === "doordash-downtown") {
    return {
      app: selectedPlatform,
      location: "Go Downtown near dense restaurant clusters.",
      action:
        "Use the bike. Take short, fast orders with easy pickup and drop-off. Avoid long waits.",
      reason:
        "Downtown lunch and busy restaurant periods are better by bike because parking slows down driving.",
      backup: "If downtown is slow, switch to Uber Eats driving near restaurant zones.",
      urgency: remainingGoal > 80 ? "High" : "Medium"
    };
  }

  return {
    app: selectedPlatform,
    location: "Drive toward busy restaurant zones and areas with easy parking.",
    action:
      "Open Uber Eats. Prioritize dinner routes, longer trips with good pay, and stacked orders that make sense.",
    reason:
      block.id === "dinner"
        ? "Dinner rush is usually the strongest driving window."
        : "Driving gives you flexibility if the other apps are slow or toggled off.",
    backup: "If Uber Eats is slow, check DoorDash Downtown or wait near restaurants.",
    urgency: actualEarned <= 0 || remainingGoal > 100 ? "High" : "Medium"
  };
}

export default function DeliveryPlannerPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(starterPlatforms);
  const [blocks, setBlocks] = useState<TimeBlock[]>(starterBlocks);
  const [dayGoal, setDayGoal] = useState("180");
  const [actualEarned, setActualEarned] = useState("");
  const [timeOverride, setTimeOverride] = useState("");
  const [dayNotes, setDayNotes] = useState("");

  const activePlatforms = platforms.filter((platform) => platform.active);

  const totals = useMemo(() => {
    const activeGoal = platforms
      .filter((platform) => platform.active)
      .reduce((sum, platform) => sum + platform.goal, 0);

    const completedBlocks = blocks.filter((block) => block.completed).length;

    const remainingGoal = Math.max(
      Number(dayGoal || 0) - Number(actualEarned || 0),
      0
    );

    return {
      activeApps: activePlatforms.length,
      activeGoal,
      completedBlocks,
      remainingGoal
    };
  }, [platforms, blocks, dayGoal, actualEarned, activePlatforms.length]);

  const currentBlock = useMemo(() => {
    return getCurrentBlock(blocks, getCurrentHourOverride(timeOverride));
  }, [blocks, timeOverride]);

  const aiSelectedPlatform = useMemo(() => {
    return chooseRecommendedPlatform(
      platforms,
      currentBlock,
      totals.remainingGoal
    );
  }, [platforms, currentBlock, totals.remainingGoal]);

  const aiPlan = useMemo(() => {
    return buildAiPlan({
      platforms,
      block: currentBlock,
      selectedPlatform: aiSelectedPlatform,
      remainingGoal: totals.remainingGoal,
      actualEarned: Number(actualEarned || 0)
    });
  }, [
    platforms,
    currentBlock,
    aiSelectedPlatform,
    totals.remainingGoal,
    actualEarned
  ]);

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

  return (
    <main className="min-h-screen bg-[#05050a] p-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,136,0.14),transparent_32rem),radial-gradient(circle_at_top_right,rgba(255,70,70,0.12),transparent_34rem),radial-gradient(circle_at_bottom,rgba(0,234,255,0.1),transparent_30rem)]" />

      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_35px_rgba(0,234,255,0.08)] backdrop-blur-xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            AI Delivery Dispatch
          </p>

          <h1 className="mt-2 bg-gradient-to-r from-lime-300 via-cyan-300 to-red-300 bg-clip-text text-4xl font-black uppercase tracking-[0.1em] text-transparent">
            AI Plan My Next Move
          </h1>

          <p className="mt-3 max-w-4xl text-sm text-slate-300">
            This planner decides your next best move using your active apps,
            current time block, earnings goal, and completed work blocks.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Stat label="Apps On" value={String(totals.activeApps)} />
            <Stat label="App Goal Total" value={`$${totals.activeGoal}`} />
            <Stat
              label="Blocks Done"
              value={`${totals.completedBlocks}/${blocks.length}`}
            />
            <Stat label="Remaining" value={`$${totals.remainingGoal}`} />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-lime-300/30 bg-lime-300/10 p-6 shadow-[0_0_35px_rgba(57,255,136,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-200">
                Next Best Move
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Work {getPlatformName(platforms, aiPlan.app)}
              </h2>

              <p className="mt-2 text-lg font-bold text-lime-100">
                {aiPlan.location}
              </p>
            </div>

            <span
              className={`inline-block rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${platformStyle(
                aiPlan.app
              )}`}
            >
              Urgency: {aiPlan.urgency}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <AiCard title="Do This" text={aiPlan.action} />
            <AiCard title="Why" text={aiPlan.reason} />
            <AiCard title="Backup Move" text={aiPlan.backup} />
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
                          {platform.mode} • {platform.bestArea}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {platform.strength}
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

            <Panel title="Money + Time">
              <div className="grid gap-4 md:grid-cols-3">
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

                <Field
                  label="Time Override 0-23"
                  value={timeOverride}
                  onChange={setTimeOverride}
                  placeholder="Leave blank for real time"
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
                  placeholder="Example: downtown is slow, car has gas, avoid heavy Instacart orders..."
                />
              </label>
            </Panel>
          </div>

          <Panel title="Work Blocks">
            <div className="space-y-3">
              {blocks.map((block) => {
                const selectedPlatform = chooseRecommendedPlatform(
                  platforms,
                  block,
                  totals.remainingGoal
                );

                const selectedIsActive = isPlatformActive(
                  platforms,
                  selectedPlatform
                );

                const isCurrent = block.id === currentBlock.id;

                return (
                  <div
                    key={block.id}
                    className={`rounded-3xl border p-5 transition ${
                      block.completed
                        ? "border-lime-300/40 bg-lime-300/10"
                        : isCurrent
                          ? "border-fuchsia-300/40 bg-fuchsia-300/10"
                          : selectedIsActive
                            ? "border-cyan-300/30 bg-black/40"
                            : "border-white/10 bg-black/20 opacity-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          {block.label} {isCurrent ? "• Current" : ""}
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

function AiCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-sm text-slate-100">{text}</p>
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
