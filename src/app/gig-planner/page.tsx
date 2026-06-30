"use client";

import React, { useMemo, useState } from "react";

type GigType = "TaskRabbit" | "Home Setup" | "FeelBassVIP" | "Personal";
type GigStatus = "Open" | "Booked" | "Completed" | "Blocked";

type GigItem = {
  id: string;
  title: string;
  type: GigType;
  date: string;
  time: string;
  value: number;
  status: GigStatus;
  notes: string;
};

const starterGigs: GigItem[] = [
  {
    id: "GIG-001",
    title: "TaskRabbit availability window",
    type: "TaskRabbit",
    date: "Today",
    time: "2:00 PM - 6:00 PM",
    value: 220,
    status: "Open",
    notes: "Keep this window free unless Google Calendar blocks it."
  },
  {
    id: "GIG-002",
    title: "Home Setup install slot",
    type: "Home Setup",
    date: "Tomorrow",
    time: "10:00 AM - 1:00 PM",
    value: 180,
    status: "Open",
    notes: "Good for TV mounting, WiFi, smart home, or home theatre."
  },
  {
    id: "GIG-003",
    title: "FeelBass event rental prospect",
    type: "FeelBassVIP",
    date: "Friday",
    time: "7:00 PM - 11:00 PM",
    value: 650,
    status: "Open",
    notes: "Target DJs, events, corporate activations, parties."
  }
];

function statusClass(status: GigStatus) {
  if (status === "Open") return "border-cyan-300/40 bg-cyan-300/10 text-cyan-100";
  if (status === "Booked") return "border-lime-300/40 bg-lime-300/10 text-lime-100";
  if (status === "Completed") return "border-purple-300/40 bg-purple-300/10 text-purple-100";
  return "border-red-300/40 bg-red-300/10 text-red-100";
}

export default function GigPlannerPage() {
  const [gigs, setGigs] = useState<GigItem[]>(starterGigs);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GigType>("TaskRabbit");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const totals = useMemo(() => {
    const open = gigs.filter((gig) => gig.status === "Open").length;
    const booked = gigs.filter((gig) => gig.status === "Booked").length;
    const potential = gigs.reduce((sum, gig) => sum + gig.value, 0);

    return { open, booked, potential };
  }, [gigs]);

  function addGig() {
    if (!title.trim()) return;

    const newGig: GigItem = {
      id: crypto.randomUUID(),
      title,
      type,
      date: date || "Unscheduled",
      time: time || "Flexible",
      value: Number(value || 0),
      status: "Open",
      notes: notes || "No notes yet."
    };

    setGigs((prev) => [newGig, ...prev]);
    setTitle("");
    setType("TaskRabbit");
    setDate("");
    setTime("");
    setValue("");
    setNotes("");
  }

  function updateStatus(id: string, status: GigStatus) {
    setGigs((prev) =>
      prev.map((gig) => (gig.id === id ? { ...gig, status } : gig))
    );
  }

  return (
    <main className="min-h-screen bg-[#05050a] p-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,234,255,0.14),transparent_32rem),radial-gradient(circle_at_top_right,rgba(255,43,214,0.12),transparent_34rem),radial-gradient(circle_at_bottom,rgba(57,255,136,0.08),transparent_30rem)]" />

      <section className="relative z-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6 shadow-[0_0_35px_rgba(0,234,255,0.08)] backdrop-blur-xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            MegaSonic Scheduler
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[0.1em] text-transparent bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-lime-300 bg-clip-text">
            Gig Planner
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-slate-300">
            Plan TaskRabbit availability, Home Setup jobs, FeelBassVIP rentals, blocked
            time, and high-value opportunities in one place.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Stat label="Open Windows" value={String(totals.open)} />
            <Stat label="Booked Windows" value={String(totals.booked)} />
            <Stat label="Potential Value" value={`$${totals.potential}`} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
              Add Window
            </h2>

            <div className="mt-5 space-y-3">
              <Field label="Title" value={title} onChange={setTitle} />

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Type
                </span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as GigType)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                >
                  <option>TaskRabbit</option>
                  <option>Home Setup</option>
                  <option>FeelBassVIP</option>
                  <option>Personal</option>
                </select>
              </label>

              <Field label="Date" value={date} onChange={setDate} />
              <Field label="Time" value={time} onChange={setTime} />
              <Field label="Potential Value" value={value} onChange={setValue} />
              <Field label="Notes" value={notes} onChange={setNotes} />

              <button
                onClick={addGig}
                className="w-full rounded-2xl border border-lime-300/40 bg-lime-300/10 px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-lime-100 transition hover:bg-lime-300/20"
              >
                Add Gig Window
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white">
              Schedule Board
            </h2>

            <div className="mt-5 space-y-3">
              {gigs.map((gig) => (
                <div
                  key={gig.id}
                  className="rounded-3xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                        {gig.type}
                      </p>
                      <h3 className="mt-1 text-xl font-black text-white">{gig.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        {gig.date} • {gig.time}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">{gig.notes}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-lime-300">${gig.value}</p>
                      <span
                        className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClass(
                          gig.status
                        )}`}
                      >
                        {gig.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["Open", "Booked", "Completed", "Blocked"] as GigStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(gig.id, status)}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
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

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
