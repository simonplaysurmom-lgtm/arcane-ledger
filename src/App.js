import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import {
  Menu, X, Book, Clock, ShoppingBag, Plus, Play,
  CheckCircle2, Skull, Sparkles, Volume2, VolumeX, Save, LogOut, Info, Zap, Eye
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, setDoc, onSnapshot
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';

// --- CONFIGURATION & FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyDWyii4gtmouZTjajGx4K-BPUf5mDn09lk",
  authDomain: "arcane-ledger-8afc5.firebaseapp.com",
  projectId: "arcane-ledger-8afc5",
  storageBucket: "arcane-ledger-8afc5.firebasestorage.app",
  messagingSenderId: "907274032439",
  appId: "1:907274032439:web:f3a168a56d4f1b72e576b2",
  measurementId: "G-NZYMHRCWN3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'arcane-ledger-v1'; 

// --- PIXEL ASSETS & LORE DATA ---
const PIXEL_ASSETS = {
  wizards: {
    apprentice: {
      name: "Ashen Apprentice",
      lore: "A timid mage who studies beside dying embers, believing even the faintest flame remembers the sun.",
      colors: { 'H': '#2A2A2A', 'F': '#E3DAC9', 'R': '#4B3F72', 'E': '#FFD700', 'L': '#FFD700', 'S': '#111' },
      data: [
        "      HHHH      ",
        "     HHHHHH     ",
        "    HHHHHHHH    ",
        "    HH E  EHH   ",
        "    HHHHHHHH    ",
        "     HHHHHH     ",
        "      RRRR      ",
        "     RRRRRR     ",
        "    RRRRRRRR L  ",
        "    RRRRRRRR LL ",
        "     RRRRRR  L  ",
        "      SS SS     "
      ]
    },
    scholar: {
      name: "The Hollow Scholar",
      lore: "Bound to a library that no longer exists, he seeks the final chapter of a story that hasn't been written.",
      colors: { 'H': '#111', 'F': '#A0A0A0', 'R': '#1A1A1A', 'E': '#00FFFF', 'B': '#E3DAC9', 'S': '#000', 'K': '#4B3F72' },
      data: [
        "      HHHH      ",
        "     HHHHHH     ",
        "    HHHHHHHH    ",
        "    HH E  EHH   ",
        "    HHHHHHHH    ",
        "  BB HHHHHH     ",
        " BBB RRRR       ",
        " BBB RRRRRR     ",
        "  BB RRRRRRRR   ",
        "     RRRRRRRR   ",
        "     RRRRRR     ",
        "      SS SS     "
      ]
    },
    sage: {
      name: "The Ember Sage",
      lore: "He carries the warmth of a thousand hearths in his robes, warming the souls of those lost in the winter void.",
      colors: { 'H': '#5A2A1A', 'F': '#E3DAC9', 'R': '#C4622D', 'E': '#FF8C00', 'G': '#FF4500', 'S': '#331A0D', 'W': '#8B4513' },
      data: [
        "      HHHH      ",
        "     HHHHHH     ",
        "    HHHHHHHH    ",
        "    HH E  EHH G ",
        "    HHHHHHHH GGG",
        "     HHHHHH  W G",
        "      RRRR   W  ",
        "     RRRRRR  W  ",
        "    RRRRRRRR W  ",
        "    RRRRRRRR W  ",
        "     RRRRRR  W  ",
        "      SS SS     "
      ]
    },
    magus: {
      name: "The Storm Magus",
      lore: "A conduit for the sky's rage. He does not control the lightning; he simply invites it to stay for tea.",
      colors: { 'H': '#0A2A20', 'F': '#A8E6CF', 'R': '#2F6B5F', 'E': '#00FFFF', 'Z': '#FFFFFF', 'S': '#051510', 'T': '#000' },
      data: [
        "    ZZ HHHH      ",
        "   ZZ HHHHHH     ",
        "    HHHHHHHH    ",
        "    HH E  EHH T ",
        "    HHHHHHHH TTT",
        "     HHHHHH   T ",
        "      RRRR    T ",
        "     RRRRRR   T ",
        "    RRRRRRRR  T ",
        "   ZZ RRRRRRRR T ",
        " ZZ  RRRRRR     ",
        "      SS SS     "
      ]
    },
    seer: {
      name: "The Blind Seer",
      lore: "Eyes closed to the present, she watches the threads of tomorrow tangle and untangle in the silence.",
      colors: { 'H': '#333', 'F': '#E3DAC9', 'R': '#222', 'E': '#FFF', 'X': '#D4AF37', 'S': '#111', 'O': '#D4AF37' },
      data: [
        "      HHHH  O   ",
        "     HHHHHH     ",
        "    HHHHHHHH    ",
        "    HHHHHHHH    ",
        "    H XXXXX H   ",
        "   O HHHHHHHH   ",
        "      RRRR      ",
        "     RRRRRR   O ",
        "    RRRRRRRR    ",
        "    RRRRRRRR    ",
        "   O RRRRRR     ",
        "      SS SS     "
      ]
    }
  },
  backgrounds: {
    observatory: {
      name: "Moonlit Observatory",
      gradient: "radial-gradient(circle at 70% 20%, #1a1a4a 0%, #050510 100%)",
      colors: { 'D': '#0A0A1A', 'S': '#FFFFFF', 'M': '#D4AF37', 'W': '#111', 'B': '#1A1A2A', 'G': '#4B3F72' },
      data: ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "DDSDDDDDDDDDDDDDMMMDDDDDDDDDSDDD", "DDDDDDDDSDDDDDDDMMMDDDDDDDDDDDDD", "DDDDDDDDDDDDDDDDMMMDDDDDDDDDDDDD", "DDDDSDDDDDDDDDDDDDDDDDDDDDSDDDDD", "DDDDDDDDDDDDDDDDDDDDSDDDDDDDDDDD", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "WWBWWWWWWWWWWWWWWWWWWWWWWWWWWWBW", "WWBWWWWWWWWWWWWWWWWWWWWWWWWWWWBW", "WWBWWWWWWWWWWWWWWWWWWWWWWWWWWWBW", "WWBWGGGGWWWWWWWWWWWWWWWGGGGWWBW", "WWBWWWWWWWWWWWWWWWWWWWWWWWWWWWBW", "WWBWWWWWWWWWWWWWWWWWWWWWWWWWWWBW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"]
    },
    library: {
      name: "Ancient Library",
      gradient: "linear-gradient(to bottom, #1A110A 0%, #050505 100%)",
      colors: { 'D': '#1A110A', 'B': '#3A2010', 'P': '#E3DAC9', 'S': '#111', 'G': '#4B3F72', 'K': '#000' },
      data: ["KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK", "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "BPPBBPBBPBBBBBBBBBBBPBBPBBPBBBBP", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "BPBBBPBBBBBBBPBPBBBBBBBPBPBBBBBB", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "BPBPBPBPBPBPBPBPBPBPBPBPBPBPBPBP", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "DDDDDDGDDDDDDDDDDDDDDGDDDDDDDDDD", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"]
    },
    cavern: {
      name: "Crystal Cavern",
      gradient: "radial-gradient(circle at 50% 50%, #0A2F2A 0%, #050505 100%)",
      colors: { 'D': '#050505', 'C': '#2F6B5F', 'L': '#A8E6CF', 'S': '#0A0A0A', 'R': '#111' },
      data: ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "DDDDDDCDDDDDDDDDDDDDDDDDCDDDDDDD", "DDDDDCCCDDDDDDDDDDDDDDDCCCDDDDDD", "DDDDCCLCCDDDDDDDDDDDDDCCLCCDDDDD", "DDDDDCCCDDDDDDDDDDDDDDDCCCDDDDDD", "DDDDDDCDDDDDDDDDDDDDDDDDCDDDDDDD", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", "SSSSDSSSSSSSSSSSSSSSSDSSSSSSSSSS", "SSSDCDSSSSSSSSSSSSSSDCDSSSSSSSSS", "SSDCCCDSSSSSSSSSSSSDCCCDSSSSSSSS", "SDCCLCCDSSSSSSSSSSDCCLCCDSSSSSSS", "SSDCCCDSSSSSSSSSSSSDCCCDSSSSSSSS"]
    },
    tower: {
      name: "Ruined Mage Tower",
      gradient: "linear-gradient(to top, #111 0%, #1A0010 100%)",
      colors: { 'D': '#0A0010', 'S': '#2A2A2A', 'R': '#C4622D', 'W': '#111', 'M': '#4B3F72' },
      data: ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "DDDDDDDDDDMMMDDDDDDDDDDDDDDDDDDD", "DDDDDDDDDDMMMDDDDDDDDDDDDDDDDDDD", "DDDDDDDDDDMMMDDDDDDDDDDDDDDDDDDD", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", "WWWWWWWWWWWWWWWWWSSSWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWSSSSSWWWWWWWWWWW", "WWWWWWWWWWWWWWWSSSSSSSWWWWWWWWWW", "WWWWWWWWRRWWWWWWWWWWWWWWWWWWRRWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"]
    }
  }
};

const OMENS = [
  "The stars do not guide us; they merely watch as we burn our own paths through the dark.",
  "True power is not the ability to change the world, but the discipline to remain unchanged by it.",
  "A spell is but a whisper in the ear of the universe—be careful what you ask it to remember.",
  "Time is the only ingredient we cannot brew, yet it is the one that seasons every soul.",
  "Do not mistake my silence for peace; the loudest storms are those brewed in a quiet mind.",
  "Every light casts a shadow, but only the greatest flames create shadows long enough to hide in.",
  "Knowledge is a heavy cloak; many crave the warmth, but few can endure the weight.",
  "To master the elements, one must first realize they are but a guest within them.",
  "We spend our youth seeking the keys to the universe, only to find the locks were internal all along.",
  "The difference between a miracle and a catastrophe is often just a matter of perspective—and a few seconds of casting."
];

// --- COMPONENTS ---

const PixelImage = memo(({ data, colors, scale = 4, className = "", animate = true }) => {
  if (!data || !data[0]) return null;
  const width = data[0].length;
  const height = data.length;
 
  return (
    <div className={`relative inline-block ${className} ${animate ? 'animate-float-cozy' : ''}`}>
      <svg
        width={width * scale}
        height={height * scale}
        viewBox={`0 0 ${width} ${height}`}
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {data.map((row, y) => row.split('').map((char, x) => {
          if (char === ' ') return null;
          const isGlow = "ELGZO".includes(char);
          return (
            <rect
              key={`${x}-${y}`}
              x={x} y={y}
              width="1.05" height="1.05"
              fill={colors[char] || '#F0F'}
              className={isGlow && animate ? 'animate-eye-glow' : ''}
            />
          )
        }))}
      </svg>
    </div>
  );
});

const GlobalBackground = memo(({ backgroundId }) => {
  const bg = PIXEL_ASSETS.backgrounds[backgroundId] || PIXEL_ASSETS.backgrounds.observatory;
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000 bg-black" style={{ background: bg.gradient }}>
      <div className="absolute inset-0 flex items-center justify-center opacity-85">
        <PixelImage data={bg.data} colors={bg.colors} scale={60} animate={false} className="w-full h-full min-w-[100vw] min-h-[100vh] object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
});

const HomeView = memo(({
  tasks, handleAddTask, animatingTaskAdd, equipped, completeTask, abandonTask, setView
}) => {
  const [localTitle, setLocalTitle] = useState("");
  const [localSize, setLocalSize] = useState("medium");

  const onSeal = (e) => {
    e.preventDefault();
    if (!localTitle) return;
    handleAddTask(localTitle, localSize);
    setLocalTitle("");
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl text-[#E3DAC9] font-serif tracking-[0.25em] uppercase drop-shadow-[0_0_8px_rgba(227,218,201,0.5)]">Ritual Chamber</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col gap-6">
          <form onSubmit={onSeal} className="bg-black/15 backdrop-blur-[2px] border border-[#4B3F72]/50 p-6 rounded-lg shadow-[inset_0_0_20px_rgba(75,63,114,0.1)] relative transition-all">
            <h3 className="text-[#D4AF37] font-serif mb-4 text-lg flex items-center gap-2"><Sparkles size={18} /> Inscribe Ritual</h3>
            <div className="space-y-4">
              <input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                required
                placeholder="What spell shall be cast?..."
                className="w-full bg-black/40 border border-[#4B3F72]/50 text-[#E3DAC9] p-4 rounded-md font-serif focus:outline-none focus:border-[#C4622D] transition-all hover:bg-black/60"
              />
              <div className="flex gap-3">
                <select
                  value={localSize}
                  onChange={(e) => setLocalSize(e.target.value)}
                  className="bg-black/40 border border-[#4B3F72]/50 text-[#E3DAC9] p-3 rounded-md flex-1 font-serif focus:outline-none cursor-pointer"
                >
                  <option value="small">Minor Incantation (+5)</option>
                  <option value="medium">Standard Ritual (+10)</option>
                  <option value="large">Grand Evocation (+20)</option>
                </select>
                <button type="submit" className="bg-[#4B3F72]/60 hover:bg-[#4B3F72]/90 border border-[#4B3F72] text-[#E3DAC9] px-6 py-3 rounded-md font-serif transition-all flex items-center gap-2 group shadow-lg active:scale-95">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  Seal
                </button>
              </div>
            </div>
            {animatingTaskAdd && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-[#4B3F72]/10 backdrop-blur-[1px] animate-fadeIn">
                 <div className="w-24 h-24 border-4 border-[#D4AF37] border-dashed rounded-full animate-[spin_2s_linear_infinite] opacity-50" />
              </div>
            )}
          </form>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-20 scrollbar-hide">
            {tasks.length === 0 && (
              <div className="text-center p-12 border border-dashed border-[#4B3F72]/30 rounded-lg text-[#A0A0A0] italic font-serif">
                The Ledger is empty. No rituals active.
              </div>
            )}
            {tasks.map(task => (
              <div key={task.id} className="bg-black/20 backdrop-blur-[1px] border border-[#4B3F72]/30 p-4 rounded-md flex justify-between items-center group hover:bg-black/40 transition-all border-l-4 border-l-[#D4AF37] animate-ritual-in">
                <div>
                  <h4 className="text-[#E3DAC9] font-serif text-lg">{task.title}</h4>
                  <p className="text-[10px] text-[#A0A0A0] uppercase tracking-widest">{task.size} essence</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => completeTask(task)} className="p-2 text-[#2F6B5F] hover:bg-[#2F6B5F]/20 rounded transition-colors" title="Complete Ritual">
                    <CheckCircle2 size={24} />
                  </button>
                  <button onClick={() => abandonTask(task.id)} className="p-2 text-[#A0A0A0] hover:text-[#C4622D] rounded transition-colors" title="Abandon Ritual">
                    <Skull size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center border border-[#4B3F72]/30 rounded-lg bg-black/10 backdrop-blur-[1px] relative overflow-hidden p-8 shadow-inner">
          <PixelImage
            data={PIXEL_ASSETS.wizards[equipped.wizard].data}
            colors={PIXEL_ASSETS.wizards[equipped.wizard].colors}
            scale={14}
          />
          <div className="mt-10 text-center">
            <h3 className="text-[#E3DAC9] font-serif text-2xl tracking-[0.2em] uppercase drop-shadow-md">{PIXEL_ASSETS.wizards[equipped.wizard].name}</h3>
          </div>
        </div>
      </div>
     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto pt-6 border-t border-[#4B3F72]/30">
        <button onClick={() => setView('sanctum')} className="flex items-center justify-center gap-3 bg-black/40 hover:bg-[#4B3F72]/40 border border-[#4B3F72] text-[#E3DAC9] p-4 rounded-md font-serif uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
          <Clock size={20} /> Inner Sanctum
        </button>
        <button onClick={() => setView('journal')} className="flex items-center justify-center gap-3 bg-black/40 hover:bg-[#4B3F72]/40 border border-[#4B3F72] text-[#E3DAC9] p-4 rounded-md font-serif uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
          <Book size={20} /> Journal
        </button>
        <button onClick={() => setView('bazaar')} className="flex items-center justify-center gap-3 bg-black/40 hover:bg-[#4B3F72]/40 border border-[#4B3F72] text-[#E3DAC9] p-4 rounded-md font-serif uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
          <ShoppingBag size={20} /> Bazaar
        </button>
      </div>
    </div>
  );
});

const BazaarView = memo(({ souls, inventory, equipped, buyItem, equipItem, setView }) => {
  const [lorePopup, setLorePopup] = useState(null);

  return (
    <div className="p-8 h-full overflow-y-auto relative z-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-serif text-[#D4AF37] uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">Bazaar of Arcana</h2>
        <button onClick={() => setView('home')} className="text-[#A0A0A0] hover:text-[#E3DAC9] hover:rotate-90 transition-transform"><X size={40} /></button>
      </div>

      <h3 className="text-xl font-serif text-[#E3DAC9] mb-6 border-b border-[#4B3F72]/30 pb-2 flex items-center gap-2">
        <Zap size={20} className="text-[#D4AF37]" /> Spirit Companions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {Object.keys(PIXEL_ASSETS.wizards).map(id => {
          const item = PIXEL_ASSETS.wizards[id];
          const cost = id === 'apprentice' ? 0 : id === 'scholar' ? 150 : id === 'sage' ? 300 : id === 'magus' ? 500 : 750;
          const isOwned = inventory.wizards.includes(id);
          const isEquipped = equipped.wizard === id;

          return (
            <div key={id} className="bg-black/30 backdrop-blur-[2px] border border-[#2A2A2A] rounded-lg p-5 flex flex-col items-center group relative hover:border-[#D4AF37] transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <button
                onClick={() => setLorePopup(item)}
                className="absolute top-3 right-3 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
              >
                <Info size={16} />
              </button>
              <div className="h-28 flex items-center justify-center">
                <PixelImage data={item.data} colors={item.colors} scale={5} animate={isEquipped} />
              </div>
              <h4 className="text-[#E3DAC9] font-serif mt-4 text-center text-sm">{item.name}</h4>
              <div className="mt-5 w-full">
                {isEquipped ? (
                  <button className="w-full py-2 bg-[#2F6B5F]/30 text-[#A8E6CF] border border-[#2F6B5F] rounded font-serif uppercase text-[10px] tracking-widest cursor-default">Manifested</button>
                ) : isOwned ? (
                  <button onClick={() => equipItem('wizard', id)} className="w-full py-2 bg-[#4B3F72]/40 text-[#E3DAC9] border border-[#4B3F72] rounded font-serif uppercase text-[10px] tracking-widest hover:bg-[#4B3F72]/60 transition-colors">Summon</button>
                ) : (
                  <button onClick={() => buyItem('wizards', id, cost)} className={`w-full py-2 border rounded font-serif uppercase text-[10px] tracking-widest transition-all ${souls >= cost ? 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/20' : 'border-[#2A2A2A] text-[#444] cursor-not-allowed'}`}>
                    {cost} Souls
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-xl font-serif text-[#E3DAC9] mb-6 border-b border-[#4B3F72]/30 pb-2 flex items-center gap-2"><Eye size={20} className="text-[#4B3F72]" /> Reality Planes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(PIXEL_ASSETS.backgrounds).map(id => {
          const item = PIXEL_ASSETS.backgrounds[id];
          const cost = id === 'observatory' ? 0 : id === 'library' ? 120 : id === 'cavern' ? 200 : 350;
          const isOwned = inventory.backgrounds.includes(id);
          const isEquipped = equipped.background === id;

          return (
            <div key={id} className="bg-black/30 backdrop-blur-[2px] border border-[#2A2A2A] rounded-lg p-5 flex flex-col items-center hover:border-[#4B3F72] transition-all">
              <div className="h-24 w-full bg-black/40 rounded mb-4 overflow-hidden flex items-center justify-center opacity-60">
                 <PixelImage data={item.data} colors={item.colors} scale={4} animate={false} />
              </div>
              <h4 className="text-[#E3DAC9] font-serif text-center">{item.name}</h4>
              <div className="mt-5 w-full">
                {isEquipped ? (
                  <button className="w-full py-2 bg-[#2F6B5F]/30 text-[#A8E6CF] border border-[#2F6B5F] rounded font-serif uppercase text-[10px] tracking-widest cursor-default">Active Plane</button>
                ) : isOwned ? (
                  <button onClick={() => equipItem('background', id)} className="w-full py-2 bg-[#4B3F72]/40 text-[#E3DAC9] border border-[#4B3F72] rounded font-serif uppercase text-[10px] tracking-widest hover:bg-[#4B3F72]/60 transition-colors">Shift</button>
                ) : (
                  <button onClick={() => buyItem('backgrounds', id, cost)} className={`w-full py-2 border rounded font-serif uppercase text-[10px] tracking-widest transition-all ${souls >= cost ? 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/20' : 'border-[#2A2A2A] text-[#444] cursor-not-allowed'}`}>
                    {cost} Souls
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lorePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1818] border-2 border-[#3A2010] p-10 rounded-lg max-w-md shadow-2xl relative text-center">
            <button onClick={() => setLorePopup(null)} className="absolute top-4 right-4 text-[#A0A0A0] hover:text-[#C4622D]"><X size={24} /></button>
            <PixelImage data={lorePopup.data} colors={lorePopup.colors} scale={8} />
            <h3 className="text-2xl font-serif text-[#D4AF37] uppercase mt-6 tracking-widest">{lorePopup.name}</h3>
            <p className="text-[#E3DAC9] font-serif italic text-lg leading-relaxed mt-4">"{lorePopup.lore}"</p>
          </div>
        </div>
      )}
    </div>
  );
});

const JournalView = memo(({ journalText, setJournalText, saveJournal, setView }) => (
  <div className="p-8 h-full flex flex-col max-w-4xl mx-auto w-full relative z-10">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-serif text-[#D4AF37] uppercase tracking-[0.25em]">Grimoire Journal</h2>
      <button onClick={() => setView('home')} className="text-[#A0A0A0] hover:text-[#E3DAC9] transition-transform hover:scale-110"><X size={32} /></button>
    </div>
    <div className="flex-1 relative bg-black/20 backdrop-blur-[1px] p-10 rounded-lg shadow-2xl border border-[#3A2010]">
      <textarea
        className="w-full h-full bg-transparent text-[#E3DAC9] font-serif text-xl leading-relaxed resize-none focus:outline-none placeholder-[#4A4A4A]"
        placeholder="Bind your thoughts to the arcane pages..."
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
      />
    </div>
    <div className="mt-8 flex justify-end">
      <button onClick={saveJournal} className="flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/30 border border-[#D4AF37] text-[#D4AF37] px-10 py-4 rounded-md font-serif uppercase tracking-widest transition-all shadow-lg active:scale-95">
        <Save size={20} /> Seal Entry
      </button>
    </div>
  </div>
));

const TimerModeView = memo(({ timer, formatTime, exit, wizardId }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
    <button onClick={exit} className="absolute top-8 left-8 text-[#A0A0A0] hover:text-[#E3DAC9] flex items-center gap-2 font-serif uppercase tracking-widest bg-black/60 px-6 py-3 rounded-md backdrop-blur-md border border-[#4B3F72] transition-all hover:bg-black/90">
      <LogOut size={22} /> Break Circle
    </button>
    <div className="mb-12 relative">
      <div className="absolute -inset-20 bg-[#D4AF37]/5 blur-[100px] animate-pulse rounded-full" />
      <div className="text-[140px] md:text-[240px] font-mono leading-none text-[#E3DAC9] drop-shadow-[0_0_40px_rgba(212,175,55,0.4)] relative">
        {formatTime(timer.timeRemaining)}
      </div>
      <p className="text-[#D4AF37] font-serif italic text-2xl tracking-[0.3em] mt-6 animate-pulse uppercase">Focus Manifesting...</p>
    </div>
    <div className="relative">
       <PixelImage data={PIXEL_ASSETS.wizards[wizardId].data} colors={PIXEL_ASSETS.wizards[wizardId].colors} scale={20} />
       <div className="absolute -inset-10 border border-[#D4AF37]/10 rounded-full animate-[spin_10s_linear_infinite]" />
    </div>
  </div>
));

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [souls, setSouls] = useState(100);
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState({ wizards: ['apprentice'], backgrounds: ['observatory'] });
  const [equipped, setEquipped] = useState({ wizard: 'apprentice', background: 'observatory' });
  const [activeOmen, setActiveOmen] = useState(OMENS[0]);
  const [journalText, setJournalText] = useState("");
  const [focusTimer, setFocusTimer] = useState(null);
  const [animatingTaskAdd, setAnimatingTaskAdd] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'ledger_state', 'data');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSouls(data.souls ?? 100);
        setTasks(data.tasks || []);
        setInventory(data.inventory || { wizards: ['apprentice'], backgrounds: ['observatory'] });
        setEquipped(data.equipped || { wizard: 'apprentice', background: 'observatory' });
        setJournalText(data.journalText || "");
      } else {
        setDoc(docRef, {
          souls: 100, tasks: [],
          inventory: { wizards: ['apprentice'], backgrounds: ['observatory'] },
          equipped: { wizard: 'apprentice', background: 'observatory' },
          journalText: ""
        });
      }
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [user]);

  const syncToCloud = useCallback(async (updates) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'ledger_state', 'data');
    await setDoc(docRef, updates, { merge: true });
  }, [user]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (focusTimer && focusTimer.active) {
        setFocusTimer(prev => {
          if (!prev) return null;
          const nextTime = prev.timeRemaining - 1;
          if (nextTime <= 0) {
            const n = (souls || 100) + 15;
            setSouls(n);
            syncToCloud({ souls: n });
            setView('home'); return null;
          }
          return { ...prev, timeRemaining: nextTime };
        });
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [focusTimer, syncToCloud, souls]);

  const handleAddTask = useCallback(async (title, size) => {
    setAnimatingTaskAdd(true);
    setTimeout(() => setAnimatingTaskAdd(false), 2000);
    const newTask = { id: Date.now().toString(), title, size, status: 'idle' };
    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    await syncToCloud({ tasks: nextTasks });
  }, [tasks, syncToCloud]);

  const completeTask = useCallback(async (task) => {
    const rewards = { small: 5, medium: 10, large: 20 };
    const nextSouls = (souls || 100) + (rewards[task.size] || 0);
    const nextTasks = tasks.filter(t => t.id !== task.id);
    setSouls(nextSouls);
    setTasks(nextTasks);
    await syncToCloud({ souls: nextSouls, tasks: nextTasks });
  }, [souls, tasks, syncToCloud]);

  const abandonTask = useCallback(async (id) => {
    const nextTasks = tasks.filter(t => t.id !== id);
    setTasks(nextTasks);
    await syncToCloud({ tasks: nextTasks });
  }, [tasks, syncToCloud]);

  const buyItem = useCallback(async (type, id, cost) => {
    if (souls >= cost && !inventory[type].includes(id)) {
      const nextInv = { ...inventory, [type]: [...inventory[type], id] };
      const nextSouls = souls - cost;
      setSouls(nextSouls);
      setInventory(nextInv);
      await syncToCloud({ souls: nextSouls, inventory: nextInv });
    }
  }, [souls, inventory, syncToCloud]);

  const equipItem = useCallback(async (type, id) => {
    const nextEquipped = { ...equipped, [type]: id };
    setEquipped(nextEquipped);
    await syncToCloud({ equipped: nextEquipped });
  }, [equipped, syncToCloud]);

  const saveJournal = useCallback(() => syncToCloud({ journalText }), [journalText, syncToCloud]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=VT323&display=swap');
        body, html { background: #050505; color: #E3DAC9; overflow: hidden; height: 100vh; user-select: none; }
        .font-serif { font-family: 'Playfair Display', serif; }
        @keyframes floatCozy { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.02); } }
        .animate-float-cozy { animation: floatCozy 2s ease-in-out infinite; }
        @keyframes eyeGlow { 0%, 100% { filter: brightness(1) drop-shadow(0 0 1px currentColor); opacity: 0.8; } 50% { filter: brightness(2) drop-shadow(0 0 6px currentColor); opacity: 1; } }
        .animate-eye-glow { animation: eyeGlow 2s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes ritualIn {
          0% { opacity: 0; transform: scale(0.95); box-shadow: 0 0 40px #D4AF37; }
          50% { box-shadow: 0 0 60px #D4AF37; }
          100% { opacity: 1; transform: scale(1); box-shadow: none; }
        }
        .animate-ritual-in { animation: ritualIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .vignette { pointer-events: none; position: fixed; inset: 0; z-index: 40; box-shadow: inset 0 0 250px rgba(0,0,0,1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .hud-panel { box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(75, 63, 114, 0.1); }
      `}</style>

      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
        <GlobalBackground backgroundId={equipped.background} />
        <div className="vignette" />
       
        {view === 'timer-mode' && focusTimer ? (
          <TimerModeView timer={focusTimer} formatTime={formatTime} exit={() => { setFocusTimer(null); setView('home'); }} wizardId={equipped.wizard} />
        ) : (
          <div className="relative z-20 w-full max-w-[1100px] h-[90vh] mx-4 flex flex-col bg-black/15 backdrop-blur-[1px] border border-[#4B3F72]/40 rounded-xl hud-panel overflow-hidden">
            <nav className="flex justify-between items-center p-5 border-b border-[#4B3F72]/30 bg-black/40">
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#E3DAC9] hover:text-[#D4AF37] transition-all hover:scale-110 active:scale-95"><Menu size={32} /></button>
              <h1 className="text-3xl font-serif tracking-[0.3em] text-[#E3DAC9] drop-shadow-[0_0_10px_rgba(227,218,201,0.3)]">ARCANE LEDGER</h1>
              <div className="flex items-center gap-2 text-2xl text-[#D4AF37] font-mono px-4 py-1 bg-black/40 rounded border border-[#D4AF37]/20">🜂 {souls}</div>
            </nav>
            {sidebarOpen && (
              <div className="fixed inset-y-0 left-0 w-[300px] z-50 bg-[#0a0a0a]/98 backdrop-blur-2xl border-r border-[#4B3F72] shadow-2xl transition-all animate-fadeIn flex flex-col">
                <div className="p-6 border-b border-[#4B3F72]/30 flex justify-between items-center bg-black/20">
                  <h2 className="text-2xl font-serif text-[#D4AF37] tracking-widest uppercase">Grimoire</h2>
                  <button onClick={() => setSidebarOpen(false)} className="hover:rotate-90 transition-transform text-[#A0A0A0] hover:text-[#D4AF37]"><X size={28} /></button>
                </div>
                <div className="p-8 flex flex-col gap-8 flex-1">
                  {!user && (
                    <button onClick={() => signInAnonymously(auth)} className="flex items-center gap-4 text-sm text-[#D4AF37] font-serif uppercase hover:brightness-125 transition-all">
                      <Zap size={18} /> Seal Your Soul (Sign In)
                    </button>
                  )}
                  <button onClick={() => { setView('home'); setSidebarOpen(false); }} className="flex items-center gap-4 text-xl text-[#E3DAC9] font-serif uppercase hover:text-[#D4AF37] group"><Book size={24} className="group-hover:scale-110" /> Rituals</button>
                  <button onClick={() => { setView('sanctum'); setSidebarOpen(false); }} className="flex items-center gap-4 text-xl text-[#E3DAC9] font-serif uppercase hover:text-[#D4AF37] group"><Clock size={24} className="group-hover:scale-110" /> Inner Sanctum</button>
                  <button onClick={() => { setView('bazaar'); setSidebarOpen(false); }} className="flex items-center gap-4 text-xl text-[#E3DAC9] font-serif uppercase hover:text-[#D4AF37] group"><ShoppingBag size={24} className="group-hover:scale-110" /> Bazaar</button>
                  <button onClick={() => { setView('omen'); setSidebarOpen(false); }} className="flex items-center gap-4 text-xl text-[#E3DAC9] font-serif uppercase hover:text-[#D4AF37] group"><Sparkles size={24} className="group-hover:scale-110" /> Omens</button>
                </div>
                <div className="p-6 border-t border-[#4B3F72]/30 flex flex-col gap-4">
                  <div className="flex justify-center">
                    <a href="https://ko-fi.com/Y8Y71VXGQ3" target="_blank" rel="noopener noreferrer" className="relative bg-black border border-[#D4AF37] text-[#D4AF37] px-6 py-3 rounded-lg font-serif flex items-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all group">
                      <Zap size={18} className="group-hover:animate-pulse" /> Buy me a potion
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              {view === 'home' && <HomeView tasks={tasks} handleAddTask={handleAddTask} animatingTaskAdd={animatingTaskAdd} completeTask={completeTask} abandonTask={abandonTask} equipped={equipped} setView={setView} />}
              {view === 'bazaar' && <BazaarView souls={souls} inventory={inventory} equipped={equipped} buyItem={buyItem} equipItem={equipItem} setView={setView} />}
              {view === 'journal' && <JournalView journalText={journalText} setJournalText={setJournalText} saveJournal={saveJournal} setView={setView} />}
              {view === 'omen' && (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center animate-fadeIn">
                  <Sparkles size={60} className="text-[#D4AF37] mb-10 animate-pulse" />
                  <p className="text-4xl font-serif italic text-[#E3DAC9] leading-relaxed max-w-3xl drop-shadow-md px-4">"{activeOmen}"</p>
                  <button onClick={() => setActiveOmen(OMENS[Math.floor(Math.random()*OMENS.length)])} className="mt-16 px-12 py-4 border border-[#4B3F72] text-[#A0A0A0] font-serif uppercase tracking-widest bg-black/40 hover:bg-[#4B3F72]/20 hover:text-[#E3DAC9] shadow-xl active:scale-95 transition-all">Consult Again</button>
                  <button onClick={() => setView('home')} className="mt-6 text-sm text-[#555] uppercase tracking-[0.3em] hover:text-[#D4AF37]">Return</button>
                </div>
              )}
              {view === 'sanctum' && (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center animate-fadeIn">
                  <div className="p-8 border-2 border-[#D4AF37]/20 rounded-full mb-10 shadow-[0_0_50px_rgba(212,175,55,0.1)]"><Clock size={80} className="text-[#D4AF37]" /></div>
                  <h2 className="text-4xl font-serif uppercase mb-6 tracking-[0.2em]">The Inner Sanctum</h2>
                  <p className="text-[#A0A0A0] mb-12 italic text-lg max-w-lg leading-relaxed">Choose a duration to manifest deep focus.</p>
                  <div className="flex gap-8">
                    {[25, 45, 60].map(mins => <button key={mins} onClick={() => { setFocusTimer({ timeRemaining: mins * 60, active: true }); setView('timer-mode'); }} className="group relative w-24 h-24 flex flex-col items-center justify-center border-2 border-[#4B3F72] hover:border-[#D4AF37] text-[#E3DAC9] font-serif transition-all bg-black/40 hover:scale-110 shadow-lg active:scale-95"><span className="text-3xl font-bold group-hover:text-[#D4AF37]">{mins}</span><span className="text-[10px] uppercase tracking-tighter opacity-60">minutes</span></button>)}
                  </div>
                  <button onClick={() => setView('home')} className="mt-16 text-xs text-[#555] uppercase tracking-[0.3em] hover:text-[#D4AF37]">Return</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
