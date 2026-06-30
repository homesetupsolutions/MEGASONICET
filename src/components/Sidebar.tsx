"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarClock,
  CalendarDays,
  CreditCard,
  DollarSign,
  Headphones,
  Home,
  LayoutDashboard,
  ListChecks,
  PhoneCall,
  Radar,
  Settings,
  Sparkles,
  Users,
  Wrench
} from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "from-cyan-300 to-blue-500"
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: CalendarClock,
    color: "from-violet-300 to-fuchsia-500"
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    color: "from-sky-300 to-cyan-500"
  },
  {
    label: "FeelBass POS",
    href: "/pos",
    icon: Headphones,
    color: "from-lime-300 to-cyan-400"
  },
  {
    label: "ET Pet",
    href: "/et",
    icon: Sparkles,
    color: "from-pink-300 via-yellow-300 to-cyan-400"
  },
  {
    label: "Gig Planner",
    href: "/gig-planner",
    icon: Wrench,
    color: "from-orange-300 to-pink-500"
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Radar,
    color: "from-emerald-300 to-cyan-400"
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    color: "from-blue-300 to-indigo-500"
  },
  {
    label: "Earnings",
    href: "/earnings",
    icon: DollarSign,
    color: "from-yellow-300 to-orange-500"
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    color: "from-green-300 to-emerald-500"
  },
  {
    label: "Square",
    href: "/square",
    icon: CreditCard,
    color: "from-emerald-300 to-lime-500"
  },
  {
    label: "PBX / Calls",
    href: "/pbx",
    icon: PhoneCall,
    color: "from-cyan-300 to-purple-500"
  },
  {
    label: "Reminders",
    href: "/reminders",
    icon: ListChecks,
    color: "from-red-300 to-orange-500"
  },
  {
    label: "MONICA AI",
    href: "/ai",
    icon: Bot,
    color: "from-purple-300 to-cyan-400"
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
    color: "from-pink-300 to-purple-500"
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    color: "from-slate-300 to-slate-500"
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-72 shrink-0 border-r border-cyan-400/20 bg-black/70 px-4 py-5 text-white shadow-[0_0_35px_rgba(0,234,255,0.08)] backdrop-blur-xl">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-3 rounded-3xl border border-cyan-400/20 bg-white/[0.03] p-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
          <Home size={24} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
            MegaSonic
          </p>
          <h1 className="text-lg font-black uppercase tracking-[0.08em] text-white">
            Command Center
          </h1>
        </div>
      </Link>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                active
                  ? "border-cyan-300/40 bg-cyan-300/10 text-white shadow-[0_0_22px_rgba(0,234,255,0.14)]"
                  : "border-white/5 bg-white/[0.025] text-slate-400 hover:border-cyan-300/30 hover:bg-cyan-300/5 hover:text-white"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-black shadow-[0_0_18px_rgba(0,234,255,0.12)]`}
              >
                <Icon size={19} />
              </div>

              <span className="text-sm font-bold uppercase tracking-[0.08em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/5 p-4">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
          ET Status
        </p>
        <p className="mt-2 text-sm text-slate-300">
          ET is your Tamagotchi-style rainbow business pet for hunting leads, filling your
          calendar, learning money ideas, and helping run MegaSonic.
        </p>

        <Link
          href="/et"
          className="mt-4 block rounded-2xl border border-pink-300/30 bg-gradient-to-r from-pink-300/15 via-yellow-300/15 to-cyan-300/15 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
        >
          Open ET Pet
        </Link>
      </div>
    </aside>
  );
}
