import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Atom,
  Award,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  Flame,
  HelpCircle,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  Waves,
  Zap,
} from 'lucide-react';
import { CATEGORIES, PHYSICS_MODULES } from './data/curriculum';
import { CategoryId } from './types/physics';
import { CameraPreset, PhysicsViewport3D } from './components/PhysicsViewport3D';
import { LatexFormula } from './components/LatexFormula';
import { LiveTelemetryChart } from './components/LiveTelemetryChart';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeModuleId, setActiveModuleId] = useState<string>(PHYSICS_MODULES[0].id);

  // Simulation time & playback controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeSpeed, setTimeSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // 3D Viewport camera & vector toggles
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('iso');
  const [crossSection, setCrossSection] = useState<boolean>(false);

  // Parameter state per module
  const [paramsMap, setParamsMap] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    for (const mod of PHYSICS_MODULES) {
      init[mod.id] = {};
      for (const p of mod.parameters) {
        init[mod.id][p.key] = p.defaultValue;
      }
    }
    return init;
  });

  // Visible vectors state per module
  const [vectorsMap, setVectorsMap] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {};
    for (const mod of PHYSICS_MODULES) {
      init[mod.id] = {};
      for (const v of mod.vectors) {
        init[mod.id][v.id] = v.defaultVisible;
      }
    }
    return init;
  });

  // Completed missions & quiz answers
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [activeRightTab, setActiveRightTab] = useState<'controls' | 'theory' | 'mission'>('controls');

  // Graph history
  const [graphHistory, setGraphHistory] = useState<Array<Record<string, number>>>([]);

  const activeModule = useMemo(
    () => PHYSICS_MODULES.find((m) => m.id === activeModuleId) ?? PHYSICS_MODULES[0],
    [activeModuleId]
  );

  const currentParams = paramsMap[activeModule.id] ?? {};
  const currentVectors = vectorsMap[activeModule.id] ?? {};

  // Compute live physics state
  const computed = useMemo(
    () => activeModule.computeState(currentParams, simTime),
    [activeModule, currentParams, simTime]
  );

  // Check mission completion automatically
  const missionEval = useMemo(
    () => activeModule.mission.checkPassed(currentParams, computed.rawMetrics),
    [activeModule, currentParams, computed.rawMetrics]
  );

  useEffect(() => {
    if (missionEval.passed && !completedMissions[activeModule.id]) {
      setCompletedMissions((prev) => ({ ...prev, [activeModule.id]: true }));
    }
  }, [missionEval.passed, activeModule.id, completedMissions]);

  // Animation loop for simulation time and live telemetry history
  const lastFrameRef = useRef<number>(performance.now());
  useEffect(() => {
    let rafId: number;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      if (isPlaying) {
        setSimTime((t) => t + dt * timeSpeed);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, timeSpeed]);

  // Append telemetry sample every ~100ms
  useEffect(() => {
    setGraphHistory((prev) => {
      const next = [...prev, computed.graphPoint];
      return next.length > 75 ? next.slice(next.length - 75) : next;
    });
  }, [computed.graphPoint]);

  // Clear graph history on module change
  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    setSimTime(0);
    setGraphHistory([]);
  };

  const handleParamChange = (key: string, val: number) => {
    setParamsMap((prev) => ({
      ...prev,
      [activeModule.id]: {
        ...(prev[activeModule.id] ?? {}),
        [key]: val,
      },
    }));
  };

  const handleResetModule = () => {
    const defaults: Record<string, number> = {};
    for (const p of activeModule.parameters) {
      defaults[p.key] = p.defaultValue;
    }
    setParamsMap((prev) => ({
      ...prev,
      [activeModule.id]: defaults,
    }));
    setSimTime(0);
    setGraphHistory([]);
  };

  const handleToggleVector = (vecId: string) => {
    setVectorsMap((prev) => ({
      ...prev,
      [activeModule.id]: {
        ...(prev[activeModule.id] ?? {}),
        [vecId]: !prev[activeModule.id]?.[vecId],
      },
    }));
  };

  const filteredModules = useMemo(() => {
    if (selectedCategory === 'all') return PHYSICS_MODULES;
    return PHYSICS_MODULES.filter((m) => m.category === selectedCategory);
  }, [selectedCategory]);

  const totalCompletedCount = Object.values(completedMissions).filter(Boolean).length;

  const getCategoryIcon = (cat: CategoryId) => {
    switch (cat) {
      case 'mechanics':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'waves':
        return <Waves className="w-4 h-4 text-purple-400" />;
      case 'electromagnetism':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'thermodynamics':
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 'modern_physics':
        return <Atom className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800/90 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Atom className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white">
                PhysiVerse Lab 3D
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                หลักสูตร สสวท. ม.4 - ม.6 (ครบ 20 บทเรียน)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ห้องปฏิบัติการฟิสิกส์เสมือนจริง 3 มิติ พร้อมสมการไดนามิก กราฟเรียลไทม์ และภารกิจการทดลอง
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด (20)
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.title.replace(/หมวด \d: /, '')}</span>
            </button>
          ))}
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">ภารกิจสำเร็จ:</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {totalCompletedCount} / {PHYSICS_MODULES.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main 5-Pillar Workspace Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: 20 Curriculum Modules Navigator */}
        <aside className="w-72 border-r border-slate-800/80 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              สารบัญบทเรียน ({filteredModules.length} บท)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredModules.map((mod) => {
              const isSelected = mod.id === activeModule.id;
              const isDone = completedMissions[mod.id];
              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800/70 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getCategoryIcon(mod.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-mono font-semibold text-cyan-400">
                        บทที่ {mod.number} • {mod.gradeLevel}
                      </span>
                      {isDone && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-xs font-semibold truncate mt-0.5 ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {mod.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{mod.subtitle}</p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 mt-2 shrink-0 transition ${
                      isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Pillar 1 (3D Interactive Viewport) + Pillar 3 (Live Telemetry & Dynamic Equations) */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {/* Pillar 1: 3D Interactive Viewport */}
          <div className="relative flex-1 min-h-[300px] border-b border-slate-800/80">
            <PhysicsViewport3D
              moduleId={activeModule.id}
              params={currentParams}
              time={simTime}
              visibleVectors={currentVectors}
              crossSection={crossSection}
              cameraPreset={cameraPreset}
            />

            {/* Top-Left Overlay: Module Title & Live Metric Badges */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
              <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl pointer-events-auto max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                    {activeModule.code} ({activeModule.gradeLevel})
                  </span>
                  <h2 className="text-sm font-bold text-white truncate">{activeModule.title}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeModule.subtitle}</p>
              </div>

              {/* Live Metrics Cards */}
              <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
                {computed.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl min-w-[125px]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{m.label}</span>
                      <LatexFormula math={m.symbol} className="text-slate-300 font-semibold" />
                    </div>
                    <div
                      className="text-sm font-mono font-bold mt-0.5"
                      style={{ color: m.color ?? '#38bdf8' }}
                    >
                      {m.value}{' '}
                      <span className="text-xs font-normal text-slate-400">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom-Left Overlay: 3D Camera Presets & Vector Toggles */}
            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl flex items-center gap-1">
                <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-cyan-400" /> มุมมอง 3D:
                </span>
                {(
                  [
                    { id: 'iso', label: '3D Iso' },
                    { id: 'side', label: 'ด้านข้าง' },
                    { id: 'top', label: 'มุมสูง' },
                    { id: 'front', label: 'ด้านหน้า' },
                  ] as Array<{ id: CameraPreset; label: string }>
                ).map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraPreset(cam.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                      cameraPreset === cam.id
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
                <button
                  onClick={() => setCrossSection((c) => !c)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                    crossSection
                      ? 'bg-purple-500 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  ผ่าโมเดล 3D
                </button>
              </div>

              {/* 3D Vector Arrows Toggle Pills */}
              {activeModule.vectors.length > 0 && (
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> เวกเตอร์ 3D:
                  </span>
                  {activeModule.vectors.map((vec) => {
                    const active = currentVectors[vec.id] ?? true;
                    return (
                      <button
                        key={vec.id}
                        onClick={() => handleToggleVector(vec.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                          active
                            ? 'bg-slate-800 text-white border-slate-600'
                            : 'text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: vec.color }}
                        />
                        <span>{vec.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom-Right Overlay: Time Manipulation Controls */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl flex items-center gap-1.5">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}</span>
              </button>

              {[0.25, 0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setTimeSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition ${
                    timeSpeed === spd
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}

              <button
                onClick={handleResetModule}
                title="รีเซ็ตการทดลอง"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 3: Bottom Dock — Dynamic Equations & Synchronized Live Graph */}
          <div className="h-56 bg-slate-900/40 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0 overflow-y-auto">
            {/* Dynamic Equations Box (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  สมการฟิสิกส์ไดนามิกและการแทนค่าเรียลไทม์ (Dynamic Equations)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  t = {simTime.toFixed(1)} s
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1">
                {computed.equations.map((eq, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/75 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between"
                  >
                    <div className="text-[11px] text-slate-400 font-medium">{eq.title}</div>
                    <div className="my-1 text-sm text-cyan-200 overflow-x-auto">
                      <LatexFormula math={eq.latexFormula} />
                    </div>
                    <div className="text-xs text-slate-300 border-t border-slate-800/80 pt-1 flex items-center justify-between flex-wrap gap-1">
                      <LatexFormula math={eq.liveSubstitution} className="text-slate-400" />
                      <LatexFormula
                        math={eq.resultText}
                        className="text-emerald-400 font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Real-Time Chart (5 cols) */}
            <div className="lg:col-span-5">
              <LiveTelemetryChart
                title={activeModule.graphTitle}
                traces={activeModule.graphTraces}
                history={graphHistory}
              />
            </div>
          </div>
        </main>

        {/* Right Panel: Pillar 2 (Variable Sliders), Pillar 4 (Theory & Real-World), Pillar 5 (Missions & Quiz) */}
        <aside className="w-96 border-l border-slate-800/80 bg-slate-900/60 flex flex-col shrink-0">
          {/* Tab Switcher */}
          <div className="grid grid-cols-3 p-2 gap-1 border-b border-slate-800/80 bg-slate-950/50">
            <button
              onClick={() => setActiveRightTab('controls')}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeRightTab === 'controls'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ตัวแปร & ภารกิจ</span>
            </button>
            <button
              onClick={() => setActiveRightTab('theory')}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeRightTab === 'theory'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ทฤษฎี & ชีวิตจริง</span>
            </button>
            <button
              onClick={() => setActiveRightTab('mission')}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeRightTab === 'mission'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>มินิควิซท้ายบท</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeRightTab === 'controls' && (
              <>
                {/* Pillar 2: Interactive Parameter Sliders */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      แผงควบคุมตัวแปรการทดลอง
                    </h3>
                    <button
                      onClick={handleResetModule}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> ค่าเริ่มต้น
                    </button>
                  </div>

                  {activeModule.parameters.map((param) => {
                    const val = currentParams[param.key] ?? param.defaultValue;
                    return (
                      <div key={param.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-200 font-medium flex items-center gap-1.5">
                            <span>{param.label}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px]">
                              <LatexFormula math={param.symbol} />
                            </span>
                          </span>
                          <span className="font-mono font-bold text-cyan-300">
                            {val} <span className="text-slate-400 font-normal">{param.unit}</span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={val}
                          onChange={(e) => handleParamChange(param.key, parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>
                            {param.min} {param.unit}
                          </span>
                          <span>
                            {param.max} {param.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pillar 5A: Gamified Interactive Lab Mission */}
                <div
                  className={`rounded-xl p-3.5 border transition-all ${
                    missionEval.passed || completedMissions[activeModule.id]
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-950/80 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Target
                        className={`w-4 h-4 shrink-0 ${
                          missionEval.passed ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                      <h4 className="text-xs font-bold text-white">{activeModule.mission.title}</h4>
                    </div>
                    {(missionEval.passed || completedMissions[activeModule.id]) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        สำเร็จแล้ว!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {activeModule.mission.description}
                  </p>

                  <div className="mt-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300">
                    สถานะ: {missionEval.progressText}
                  </div>

                  <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                    💡 <strong>คำใบ้:</strong> {activeModule.mission.hint}
                  </div>
                </div>
              </>
            )}

            {activeRightTab === 'theory' && (
              <>
                {/* Pillar 4: Theory Summary & Real-World Application */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    สรุปหลักการทางฟิสิกส์
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeModule.theorySummary}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-300">จุดสังเกตสำคัญ:</div>
                    <ul className="space-y-1.5">
                      {activeModule.keyTakeaways.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                    การประยุกต์ใช้ในชีวิตจริงและวิศวกรรม
                  </div>
                  <h4 className="text-sm font-bold text-white">{activeModule.realWorldTitle}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModule.realWorldDescription}
                  </p>
                </div>
              </>
            )}

            {activeRightTab === 'mission' && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>แบบทดสอบความเข้าใจท้ายบทเรียน</span>
                </div>
                <p className="text-xs text-white font-medium leading-relaxed">
                  {activeModule.quiz.question}
                </p>

                <div className="space-y-2 pt-1">
                  {activeModule.quiz.options.map((opt, idx) => {
                    const selected = quizAnswers[activeModule.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = idx === activeModule.quiz.correctIndex;
                    const isThisSelected = selected === idx;

                    let btnStyle =
                      'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                      } else if (isThisSelected) {
                        btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          setQuizAnswers((prev) => ({ ...prev, [activeModule.id]: idx }))
                        }
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>
                          {idx + 1}. {opt}
                        </span>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizAnswers[activeModule.id] !== undefined && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-400 block mb-1">เฉลยละเอียด:</strong>
                    {activeModule.quiz.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
export default App;
