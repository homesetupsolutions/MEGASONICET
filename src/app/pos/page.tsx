"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

type EquipmentType = "vest" | "strap" | "powerbank" | "receiver";
type EquipmentStatus =
  | "available"
  | "selected"
  | "in_use"
  | "needs_cleaning"
  | "charging"
  | "maintenance";

type Equipment = {
  id: string;
  label: string;
  type: EquipmentType;
  barcode: string;
  battery: number;
  status: EquipmentStatus;
};

type ActivityItem = {
  id: string;
  time: string;
  message: string;
  level: "info" | "success" | "warning" | "danger";
};

const packages = [
  { name: "Intro Feel", minutes: 15, price: 15 },
  { name: "Standard FeelBass", minutes: 30, price: 25 },
  { name: "Premium FeelBass", minutes: 45, price: 35 },
  { name: "VIP Full Body Feel", minutes: 60, price: 50 }
];

const starterEquipment: Equipment[] = [
  {
    id: "VEST-001",
    label: "Woojer Vest 001",
    type: "vest",
    barcode: "VEST001",
    battery: 92,
    status: "available"
  },
  {
    id: "VEST-002",
    label: "Woojer Vest 002",
    type: "vest",
    barcode: "VEST002",
    battery: 81,
    status: "available"
  },
  {
    id: "STRAP-001",
    label: "Woojer Strap 001",
    type: "strap",
    barcode: "STRAP001",
    battery: 76,
    status: "available"
  },
  {
    id: "PB-001",
    label: "Powerbank 001",
    type: "powerbank",
    barcode: "PB001",
    battery: 100,
    status: "available"
  },
  {
    id: "PB-002",
    label: "Powerbank 002",
    type: "powerbank",
    barcode: "PB002",
    battery: 63,
    status: "available"
  },
  {
    id: "RX-001",
    label: "Receiver RX 001",
    type: "receiver",
    barcode: "RX001",
    battery: 88,
    status: "available"
  },
  {
    id: "RX-002",
    label: "Receiver RX 002",
    type: "receiver",
    barcode: "RX002",
    battery: 72,
    status: "available"
  }
];

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatTime(ms: number) {
  if (ms <= 0) return "00:00";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function statusStyle(status: EquipmentStatus) {
  if (status === "available") return "border-emerald-400/40 text-emerald-300 bg-emerald-400/10";
  if (status === "selected") return "border-cyan-400/40 text-cyan-300 bg-cyan-400/10";
  if (status === "in_use") return "border-lime-400/40 text-lime-300 bg-lime-400/10";
  if (status === "needs_cleaning") return "border-orange-400/40 text-orange-300 bg-orange-400/10";
  if (status === "charging") return "border-purple-400/40 text-purple-300 bg-purple-400/10";
  return "border-red-400/40 text-red-300 bg-red-400/10";
}

function levelStyle(level: ActivityItem["level"]) {
  if (level === "success") return "border-emerald-400/30 text-emerald-200";
  if (level === "warning") return "border-orange-400/30 text-orange-200";
  if (level === "danger") return "border-red-400/30 text-red-200";
  return "border-cyan-400/20 text-slate-200";
}

export default function FeelBassPOSPage() {
  const scannerRef = useRef<HTMLInputElement | null>(null);

  const [equipment, setEquipment] = useState<Equipment[]>(starterEquipment);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scanValue, setScanValue] = useState("");
  const [activeTab, setActiveTab] = useState<
    "session" | "scanner" | "devices" | "selected" | "activity"
  >("session");

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [packageName, setPackageName] = useState(packages[1].name);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [running, setRunning] = useState(false);
  const [warning, setWarning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState("00:00");
  const [powerbankReturnLevel, setPowerbankReturnLevel] = useState("");

  const [activity, setActivity] = useState<ActivityItem[]>([
    {
      id: crypto.randomUUID(),
      time: currentTime(),
      message: "FeelBass POS loaded inside MegaSonic Command Center.",
      level: "success"
    },
    {
      id: crypto.randomUUID(),
      time: currentTime(),
      message: "Scanner ready. Scan vest/strap, powerbank, then receiver.",
      level: "info"
    }
  ]);

  const selectedPackage = packages.find((item) => item.name === packageName) ?? packages[1];

  const selectedEquipment = useMemo(
    () => equipment.filter((item) => selectedIds.includes(item.id)),
    [equipment, selectedIds]
  );

  const vestOrStrap = selectedEquipment.find(
    (item) => item.type === "vest" || item.type === "strap"
  );
  const powerbank = selectedEquipment.find((item) => item.type === "powerbank");
  const receiver = selectedEquipment.find((item) => item.type === "receiver");

  const readyToGearUp =
    Boolean(vestOrStrap) &&
    Boolean(powerbank) &&
    Boolean(receiver) &&
    Boolean(guestName.trim()) &&
    waiverSigned;

  function log(message: string, level: ActivityItem["level"] = "info") {
    setActivity((prev) => [
      {
        id: crypto.randomUUID(),
        time: currentTime(),
        message,
        level
      },
      ...prev
    ]);
  }

  function updateEquipmentStatus(ids: string[], status: EquipmentStatus) {
    setEquipment((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, status } : item))
    );
  }

  function handleScan() {
    const value = scanValue.trim().toUpperCase();
    if (!value) {
      scannerRef.current?.focus();
      return;
    }

    const found = equipment.find(
      (item) => item.barcode.toUpperCase() === value || item.id.toUpperCase() === value
    );

    if (!found) {
      log(`Unknown scan: ${value}`, "danger");
      setScanValue("");
      scannerRef.current?.focus();
      return;
    }

    if (["in_use", "maintenance"].includes(found.status)) {
      log(`${found.label} cannot be selected. Current status: ${found.status}.`, "danger");
      setScanValue("");
      scannerRef.current?.focus();
      return;
    }

    if (selectedIds.includes(found.id)) {
      log(`${found.label} is already selected.`, "warning");
      setScanValue("");
      scannerRef.current?.focus();
      return;
    }

    const duplicateType =
      found.type === "vest" || found.type === "strap"
        ? selectedEquipment.some((item) => item.type === "vest" || item.type === "strap")
        : selectedEquipment.some((item) => item.type === found.type);

    if (duplicateType) {
      log(`Already selected a ${found.type}. Reset if you need to change it.`, "warning");
      setScanValue("");
      scannerRef.current?.focus();
      return;
    }

    setSelectedIds((prev) => [...prev, found.id]);
    updateEquipmentStatus([found.id], "selected");
    log(`Paired ${found.label}.`, "success");

    setScanValue("");
    scannerRef.current?.focus();
  }

  function openWaiver() {
    if (!guestName.trim()) {
      log("Enter guest name before waiver.", "warning");
      return;
    }

    setWaiverOpen(true);
    log(`Waiver opened for ${guestName}.`, "info");
  }

  function signWaiver() {
    setWaiverSigned(true);
    setWaiverOpen(false);
    log(`Waiver signed. Gear up ${guestName}.`, "success");
  }

  function startSession() {
    if (!readyToGearUp) {
      log("Cannot start. Need gear, guest name, and signed waiver.", "danger");
      return;
    }

    const start = Date.now();
    const end = start + selectedPackage.minutes * 60 * 1000;

    setStartedAt(start);
    setEndsAt(end);
    setRunning(true);
    setWarning(false);
    updateEquipmentStatus(selectedIds, "in_use");
    log(`START TIME pressed. ${guestName} session is running.`, "success");
  }

  function extendSession() {
    if (!endsAt) {
      log("No active session to extend.", "warning");
      return;
    }

    setEndsAt(endsAt + 15 * 60 * 1000);
    setWarning(false);
    log("Session extended by 15 minutes.", "success");
  }

  function completeSession(needsCleaning = true) {
    setRunning(false);
    setWarning(false);
    setRemaining("00:00");
    updateEquipmentStatus(selectedIds, needsCleaning ? "needs_cleaning" : "available");
    log(
      needsCleaning
        ? "Session complete. Gear moved to NEEDS CLEANING."
        : "Session complete. Gear marked available.",
      needsCleaning ? "warning" : "success"
    );
  }

  function setCharging() {
    if (selectedIds.length === 0) {
      log("No selected gear to charge.", "warning");
      return;
    }

    updateEquipmentStatus(selectedIds, "charging");
    log("Selected gear set to CHARGING.", "success");
  }

  function resetSession() {
    setEquipment(starterEquipment);
    setSelectedIds([]);
    setScanValue("");
    setGuestName("");
    setGuestPhone("");
    setPackageName(packages[1].name);
    setWaiverOpen(false);
    setWaiverSigned(false);
    setRunning(false);
    setWarning(false);
    setStartedAt(null);
    setEndsAt(null);
    setRemaining("00:00");
    setPowerbankReturnLevel("");
    log("New POS session started.", "success");
    setTimeout(() => scannerRef.current?.focus(), 100);
  }

  function sendSquareCharge() {
    log(`Square charge prepared for $${selectedPackage.price}.`, "success");
  }

  useEffect(() => {
    scannerRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!running || !endsAt) return;

      const ms = endsAt - Date.now();
      setRemaining(formatTime(ms));

      if (ms <= 5 * 60 * 1000 && ms > 0) {
        setWarning(true);
      }

      if (ms <= 0) {
        setRunning(false);
        setWarning(true);
        setRemaining("00:00");
        log(`TIME UP for ${guestName}. Return gear now.`, "danger");
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, endsAt, guestName]);

  const counts = {
    available: equipment.filter((item) => item.status === "available").length,
    selected: equipment.filter((item) => item.status === "selected").length,
    inUse: equipment.filter((item) => item.status === "in_use").length,
    cleaning: equipment.filter((item) => item.status === "needs_cleaning").length,
    charging: equipment.filter((item) => item.status === "charging").length
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#05050a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,234,255,0.16),transparent_32rem),radial-gradient(circle_at_top_right,rgba(255,43,214,0.12),transparent_34rem),radial-gradient(circle_at_bottom,rgba(57,255,136,0.08),transparent_30rem)]" />

      <section className="relative z-10 border-b border-cyan-400/20 bg-black/40 px-6 py-5 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-cyan-400/30 bg-black shadow-[0_0_35px_rgba(0,234,255,0.18)]">
              <Image
                src="/logos/feelbass-logo.jpg"
                alt="FeelBass VIP"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-cyan-300">
                MegaSonic Command Center
              </p>
              <h1 className="mt-1 font-black uppercase tracking-[0.12em] text-transparent bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-lime-300 bg-clip-text text-4xl">
                FeelBass VIP POS
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Guests don&apos;t just hear the music — they feel it through their whole body.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Available" value={counts.available} color="cyan" />
            <Stat label="Selected" value={counts.selected} color="purple" />
            <Stat label="In Use" value={counts.inUse} color="green" />
            <Stat label="Cleaning" value={counts.cleaning} color="orange" />
            <Stat label="Charging" value={counts.charging} color="pink" />
          </div>
        </div>
      </section>

      <section className="relative z-10 grid gap-5 p-5 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(0,234,255,0.08)] backdrop-blur-xl">
          <div className="mb-5 flex flex-wrap gap-2">
            {(["session", "scanner", "devices", "selected", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition ${
                  activeTab === tab
                    ? "border-cyan-300 bg-cyan-300/15 text-cyan-200 shadow-[0_0_22px_rgba(0,234,255,0.2)]"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-cyan-300/40 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "session" && (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                  Scan Flow
                </p>

                <div className="mt-4 space-y-3">
                  <FlowItem label="Vest or Strap" item={vestOrStrap?.label} />
                  <FlowItem label="Powerbank" item={powerbank?.label} />
                  <FlowItem label="Receiver / RX" item={receiver?.label} />
                  <FlowItem label="Waiver" item={waiverSigned ? "Signed" : "Not Signed"} />
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Scanner Input
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      ref={scannerRef}
                      value={scanValue}
                      onChange={(event) => setScanValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleScan();
                      }}
                      placeholder="Scan or type VEST001 / PB001 / RX001"
                      className="min-w-0 flex-1 rounded-2xl border border-cyan-400/20 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <button
                      onClick={handleScan}
                      className="rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 text-xs font-black uppercase text-cyan-100"
                    >
                      Scan
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">
                      Session
                    </p>
                    <h2 className="mt-2 text-2xl font-black uppercase text-white">
                      Guest Setup
                    </h2>
                  </div>

                  <div
                    className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase ${
                      readyToGearUp
                        ? "border-lime-300/40 bg-lime-300/10 text-lime-200"
                        : "border-orange-300/40 bg-orange-300/10 text-orange-200"
                    }`}
                  >
                    {readyToGearUp ? "Gear Up Guest" : "Setup Needed"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <Field label="Guest Name" value={guestName} onChange={setGuestName} />
                  <Field label="Guest Phone" value={guestPhone} onChange={setGuestPhone} />
                </div>

                <label className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Package
                </label>
                <select
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-300"
                >
                  {packages.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} — {item.minutes} min — ${item.price}
                    </option>
                  ))}
                </select>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <button
                    onClick={openWaiver}
                    className="rounded-2xl border border-fuchsia-300/40 bg-fuchsia-300/10 px-4 py-3 text-xs font-black uppercase text-fuchsia-100"
                  >
                    Open Waiver
                  </button>
                  <button
                    onClick={startSession}
                    className="rounded-2xl border border-lime-300/40 bg-lime-300/10 px-4 py-3 text-xs font-black uppercase text-lime-100"
                  >
                    Start Time
                  </button>
                  <button
                    onClick={sendSquareCharge}
                    className="rounded-2xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3 text-xs font-black uppercase text-emerald-100"
                  >
                    Square ${selectedPackage.price}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scanner" && (
            <Panel title="Scanner Console">
              <div className="rounded-3xl border border-cyan-400/20 bg-black/50 p-6">
                <p className="text-sm text-slate-300">
                  Hardware scanner mode. Keep this field focused and scan barcodes/RFID values.
                </p>
                <input
                  ref={scannerRef}
                  value={scanValue}
                  onChange={(event) => setScanValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleScan();
                  }}
                  placeholder="Scanner ready..."
                  className="mt-4 w-full rounded-3xl border border-cyan-400/30 bg-black px-5 py-5 text-xl font-black tracking-widest text-cyan-100 outline-none focus:border-cyan-200"
                />
              </div>
            </Panel>
          )}

          {activeTab === "devices" && (
            <Panel title="Devices">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {equipment.map((item) => (
                  <DeviceCard key={item.id} item={item} />
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "selected" && (
            <Panel title="Selected Gear">
              <div className="grid gap-4 md:grid-cols-3">
                {selectedEquipment.map((item) => (
                  <DeviceCard key={item.id} item={item} />
                ))}
              </div>
              {selectedEquipment.length === 0 && (
                <p className="text-sm text-slate-400">No gear selected yet.</p>
              )}
            </Panel>
          )}

          {activeTab === "activity" && (
            <Panel title="Activity Log">
              <ActivityList activity={activity} />
            </Panel>
          )}
        </div>

        <aside className="space-y-5">
          <div
            className={`rounded-3xl border p-6 text-center shadow-[0_0_45px_rgba(0,234,255,0.12)] ${
              warning
                ? "border-red-400/40 bg-red-950/40"
                : running
                  ? "border-lime-400/30 bg-lime-950/20"
                  : "border-cyan-400/20 bg-slate-950/70"
            }`}
          >
            <p className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-400">
              Session Timer
            </p>
            <div className="mt-4 font-mono text-7xl font-black tracking-widest text-white">
              {running || warning ? remaining : "READY"}
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {warning
                ? "Warning / Time up — return gear."
                : running
                  ? `${guestName} is active.`
                  : readyToGearUp
                    ? "Gear up guest, then press START TIME."
                    : "Complete setup first."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={extendSession}
                className="rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 text-xs font-black uppercase text-cyan-100"
              >
                Extend +15
              </button>
              <button
                onClick={() => completeSession(true)}
                className="rounded-2xl border border-orange-300/40 bg-orange-300/10 px-4 py-3 text-xs font-black uppercase text-orange-100"
              >
                Complete + Cleaning
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300">
              Return Check
            </p>
            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Powerbank Return Level
            </label>
            <input
              value={powerbankReturnLevel}
              onChange={(event) => setPowerbankReturnLevel(event.target.value)}
              placeholder="Example: 72%"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-orange-300"
            />

            <div className="mt-4 grid gap-3">
              <button
                onClick={setCharging}
                className="rounded-2xl border border-purple-300/40 bg-purple-300/10 px-4 py-3 text-xs font-black uppercase text-purple-100"
              >
                Set Charging
              </button>
              <button
                onClick={resetSession}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white"
              >
                New Session
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
              Recent Activity
            </p>
            <div className="mt-4">
              <ActivityList activity={activity.slice(0, 5)} />
            </div>
          </div>
        </aside>
      </section>

      {waiverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-xl">
          <div className="max-w-2xl rounded-3xl border border-fuchsia-300/30 bg-slate-950 p-6 shadow-[0_0_55px_rgba(255,43,214,0.18)]">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">
              Digital Waiver
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase text-white">
              FeelBass VIP Rental Waiver
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              I, {guestName || "Guest"}, understand that FeelBass VIP wearable bass devices
              create physical vibration sensations. I agree to use the equipment responsibly,
              follow staff instructions, return all equipment, and report discomfort immediately.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setWaiverOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-black uppercase text-white"
              >
                Cancel
              </button>
              <button
                onClick={signWaiver}
                className="rounded-2xl border border-lime-300/40 bg-lime-300/10 px-5 py-4 text-xs font-black uppercase text-lime-100"
              >
                Guest Signs Waiver
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: "cyan" | "purple" | "green" | "orange" | "pink";
}) {
  const colorClass = {
    cyan: "border-cyan-400/30 text-cyan-200",
    purple: "border-purple-400/30 text-purple-200",
    green: "border-lime-400/30 text-lime-200",
    orange: "border-orange-400/30 text-orange-200",
    pink: "border-fuchsia-400/30 text-fuchsia-200"
  }[color];

  return (
    <div className={`rounded-2xl border bg-black/40 px-4 py-3 ${colorClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function FlowItem({ label, item }: { label: string; item?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <span
        className={`text-sm font-black ${
          item && item !== "Not Signed" ? "text-lime-300" : "text-orange-300"
        }`}
      >
        {item || "Needed"}
      </span>
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
    <label>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-black uppercase tracking-[0.12em] text-white">
        {title}
      </h2>
      {children}
    </div>
  );
}

function DeviceCard({ item }: { item: Equipment }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            {item.type}
          </p>
          <h3 className="mt-1 text-lg font-black text-white">{item.label}</h3>
          <p className="mt-1 font-mono text-xs text-slate-400">{item.barcode}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${statusStyle(item.status)}`}>
          {item.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Battery</span>
          <span>{item.battery}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-lime-300 to-fuchsia-300"
            style={{ width: `${item.battery}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ActivityList({ activity }: { activity: ActivityItem[] }) {
  return (
    <div className="space-y-2">
      {activity.map((item) => (
        <div
          key={item.id}
          className={`rounded-2xl border bg-black/30 px-4 py-3 text-sm ${levelStyle(item.level)}`}
        >
          <span className="mr-3 font-mono text-xs text-slate-500">{item.time}</span>
          {item.message}
        </div>
      ))}
    </div>
  );
}
