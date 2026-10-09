"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Trash2, Maximize, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { ShaderBackground } from "@/components/ui/waves-background-2";
import Image from "next/image";

export default function AdminTimersPage() {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleStart = () => {
    if (timeLeft === 0) {
      const totalSeconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
      if (totalSeconds > 0) {
        setTimeLeft(totalSeconds);
        setIsRunning(true);
      }
    } else {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleDelete = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && fullscreenRef.current) {
        await fullscreenRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const displayTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Presentation Timer
          </h1>
          <p className="text-xs text-outline font-body mt-0.5">
            Configure a local countdown timer and cast it in full-screen for the live event projectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
            <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary/30 flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                Timer Settings
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-outline mb-2">Hours</label>
                <Input
                  type="number"
                  min={0}
                  value={hours || ""}
                  onChange={(e) => {
                    setHours(parseInt(e.target.value) || 0);
                    if (timeLeft === 0) setTimeLeft(parseInt(e.target.value) * 3600 + minutes * 60 + seconds);
                  }}
                  disabled={isRunning || timeLeft > 0}
                  placeholder="00"
                  className="text-center text-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-outline mb-2">Minutes</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes || ""}
                  onChange={(e) => {
                    setMinutes(parseInt(e.target.value) || 0);
                    if (timeLeft === 0) setTimeLeft(hours * 3600 + parseInt(e.target.value) * 60 + seconds);
                  }}
                  disabled={isRunning || timeLeft > 0}
                  placeholder="00"
                  className="text-center text-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-outline mb-2">Seconds</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds || ""}
                  onChange={(e) => {
                    setSeconds(parseInt(e.target.value) || 0);
                    if (timeLeft === 0) setTimeLeft(hours * 3600 + minutes * 60 + parseInt(e.target.value));
                  }}
                  disabled={isRunning || timeLeft > 0}
                  placeholder="00"
                  className="text-center text-xl font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant/20">
              {!isRunning ? (
                <Button 
                  variant="primary" 
                  onClick={handleStart} 
                  disabled={timeLeft === 0 && (hours + minutes + seconds === 0)}
                  className="flex-1"
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Start Timer
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={handlePause} 
                  className="flex-1"
                  leftIcon={<Pause className="w-4 h-4" />}
                >
                  Pause
                </Button>
              )}

              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={timeLeft === 0 && (hours + minutes + seconds === 0)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Reset / Delete
              </Button>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="ghost" 
                onClick={toggleFullscreen}
                className="w-full text-primary border-primary/40 hover:bg-primary/10"
                leftIcon={<Maximize className="w-4 h-4" />}
              >
                Enter Full Screen Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Card (Also serves as Fullscreen Container) */}
        <div className="relative">
          <div className="absolute -top-3 -left-3 z-20">
             <span className="px-2 py-1 rounded-md bg-surface-container-high border border-outline-variant/50 text-[9px] font-bold tracking-widest text-outline uppercase shadow-sm">
                Preview
             </span>
          </div>
          
          <div 
            ref={fullscreenRef}
            className={`
              relative rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface
              ${isFullscreen ? "fixed inset-0 z-[100] rounded-none border-none flex flex-col items-center justify-center bg-black" : "w-full aspect-video"}
            `}
          >
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
              <ShaderBackground className="w-full h-full" />
            </div>
            <div className="absolute inset-0 bg-surface/60 backdrop-blur-[2px] z-0" />

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
              
              {/* Synergy Logo - Absolute Top Left */}
              <div className={`absolute ${isFullscreen ? "top-10 left-10" : "top-4 left-4"}`}>
                <Image 
                  src="/finalsynergy1.png" 
                  alt="Synergy Logo" 
                  width={isFullscreen ? 200 : 100} 
                  height={isFullscreen ? 60 : 30} 
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <h2 className={`
                font-headline font-bold text-primary tracking-widest uppercase mb-4 text-center
                ${isFullscreen ? "text-4xl md:text-6xl mb-16 md:mb-20 -translate-y-8 md:-translate-y-12" : "text-xl"}
              `}>
                Protohack - Round 2
              </h2>

              {/* Countdown Timer */}
              <div className={`
                font-mono font-bold text-on-surface leading-none drop-shadow-2xl
                ${isFullscreen ? "text-[18vw]" : "text-6xl"}
              `}>
                {displayTime(timeLeft)}
              </div>
              
              {/* Invisible overlay for exiting fullscreen with Escape info */}
              {isFullscreen && (
                <div className="absolute bottom-8 text-outline/50 font-mono text-sm tracking-widest uppercase animate-pulse">
                  Press ESC to Exit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
