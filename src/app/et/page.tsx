"use client";

import React, { useEffect, useMemo, useState } from "react";

type Stage =
  | "Egg"
  | "Hatchling"
  | "Baby"
  | "Kid"
  | "Teen"
  | "Adult"
  | "Cosmic"
  | "Money Deity";

type Mood =
  | "sleepy"
  | "happy"
  | "excited"
  | "focused"
  | "hungry"
  | "messy"
  | "working"
  | "raving";

type LogItem = {
  id: string;
  time: string;
  text: string;
  type: "care" | "money" | "system" | "cute";
};

const monthlyForms = [
  { month: "January", animal: "Rainbow Fox", emoji: "🦊", trait: "clever lead finder", gradient: "from-orange-300 via-pink-400 to-purple-500" },
  { month: "February", animal: "Love Bunny", emoji: "🐰", trait: "customer follow-up sweetheart", gradient: "from-pink-300 via-fuchsia-400 to-red-400" },
  { month: "March", animal: "Lucky Frog", emoji: "🐸", trait: "lucky money finder", gradient: "from-green-300 via-emerald-400 to-teal-400" },
  { month: "April", animal: "Cloud Lamb", emoji: "🐑", trait: "gentle cloud dreamer", gradient: "from-sky-200 via-white to-purple-400" },
  { month: "May", animal: "Flower Dragon", emoji: "🐉", trait: "creative growth builder", gradient: "from-green-300 via-yellow-300 to-pink-400" },
  { month: "June", animal: "Pride Alien", emoji: "👽", trait: "rainbow rainbow alien money hunter", gradient: "from-pink-300 via-purple-400 to-cyan-400" },
  { month: "July", animal: "Disco Cat", emoji: "🐱", trait: "party and nightlife lead hunter", gradient: "from-yellow-300 via-pink-400 to-cyan-400" },
  { month: "August", animal: "Solar Lion", emoji: "🦁", trait: "premium upsell closer", gradient: "from-yellow-300 via-orange-400 to-red-500" },
  { month: "September", animal: "Book Owl", emoji: "🦉", trait: "smart research assistant", gradient: "from-amber-300 via-purple-400 to-blue-500" },
  { month: "October", animal: "Ghost Bat", emoji: "🦇", trait: "spooky promo maker", gradient: "from-purple-500 via-slate-300 to-orange-400" },
  { month: "November", animal: "Cozy Bear", emoji: "🐻", trait: "repeat customer nurturer", gradient: "from-amber-500 via-orange-300 to-pink-400" },
  { month: "December", animal: "Snow Penguin", emoji: "🐧", trait: "holiday booking closer", gradient: "from-cyan-200 via-blue-300 to-fuchsia-300" },
];

const quickQuestions = [
  "How do I fill my calendar today?",
  "Find money ideas for FeelBassVIP.",
  "Find money ideas for Home Setup Solutions.",
  "What should I follow up on?",
  "Give me a call script.",
  "What should I post on social media?",
  "How do I sell more event rentals?",
  "What should ET hunt next?",
];

const starterLogs = [
  { id: "start-1", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "ET woke up inside MegaSonic and is ready to hunt.", type: "cute" as const },
  { id: "start-2", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "ET is ready to hunt leads and hunt money.", type: "system" },
];

function stageFromXp(xp: number): Stage {
  if (xp < 20) return "Egg";
  if (xp < 50) return "Hatchling";
  if (xp < 70) return "Baby";
  if (xp < 100) return "Kid";
  if (xp < 100) return "Teen";
  if (xp < 150) return "Adult";
  if (xp >= 100 && xp < 150) return "Cosmic";
  return "Money Deity";
}

function moodText(mood: Mood) {
  const lines: Record<Mood, string> = {
    sleepy: "ET is sleepy. Let him nap before a big money hunt.",
    happy: "ET is happy and ready to help.",
    excited: "ET is excited! This is a good time to chase leads.",
    focused: "ET is focused on filling your calendar.",
    hungry: "ET is hungry. Feed him a treat.",
    messy: "ET feels messy. Clean him up.",
    working: "ET is working. He is hunting leads and money ideas.",
    raving: "ET is in rainbow rave mode. Slay.",
  };
  return lines[mood];
}
