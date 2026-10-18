'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Play, Clock, Star, Info, GraduationCap,
  Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  Volume1
} from 'lucide-react';
import { extractDailymotionId, getDailymotionPlayerId } from '@/lib/dailymotion';

// ── Dailymotion Player SDK Container ─────────────────────────────────────────
// We use the DM JS SDK script (geo.dailymotion.com/player/ID.js) instead of a
// plain iframe so we can call player.setVolume(), player.seek(), and
// player.setFullscreen() through the official API.
// ─────────────────────────────────────────────────────────────────────────────

const DM_CONTAINER_ID = 'dm-video-container';
const VOLUME_KEY = 'ameed_player_volume';

export default function WatchVideo() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const router = useRouter();

  // Player control state
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState(null); // null | 'forward' | 'backward'

  const playerRef = useRef(null);
  const sdkScriptRef = useRef(null);
  const seekTimerRef = useRef(null);
  const prevVideoIdRef = useRef(null);

  // ── Restore saved volume from localStorage ──────────────────────────────────
  useEffect(() => {
    try {
      const saved = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (!isNaN(saved) && saved >= 0 && saved <= 1) {
        setVolume(saved);
      }
    } catch { }
  }, []);

  // ── Fetch video data ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const vRes = await api.get('/student/videos');
        const v = vRes.data.find(item => item._id === id);
        setVideo(v);
        if (v) {
          try {
            await api.post('/student/activity/log', {
              action: 'view_video',
              targetId: id,
              details: `مشاهدة فيديو: ${v.title}`
            });
          } catch { }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideo();
  }, [id]);

  // ── Load DM SDK and initialise player ───────────────────────────────────────
  useEffect(() => {
    if (!video?.dailymotionId) return;

    const videoId = extractDailymotionId(video.dailymotionId);
    if (!videoId) return;

    // Skip if the same video is already loaded
    if (prevVideoIdRef.current === videoId && playerRef.current) return;
    prevVideoIdRef.current = videoId;

    const playerId = getDailymotionPlayerId();
    const sdkSrc = `https://geo.dailymotion.com/player/${playerId}.js`;

    const initPlayer = () => {
      // dailymotion global is injected by the SDK script
      if (!window.dailymotion) return;

      setPlayerReady(false);

      // Destroy any previous player instance
      if (playerRef.current) {
        try { playerRef.current.destroy?.(); } catch { }
        playerRef.current = null;
      }

      // Clear container
      const container = document.getElementById(DM_CONTAINER_ID);
      if (!container) return;
      container.innerHTML = '';

      // Create player with the SDK
      window.dailymotion
        .createPlayer(DM_CONTAINER_ID, {
          video: videoId,
          params: {
            autoplay: true,
            mute: false,
          },
        })
        .then(player => {
          playerRef.current = player;

          // Apply saved volume
          const saved = parseFloat(localStorage.getItem(VOLUME_KEY));
          const vol = !isNaN(saved) ? saved : volume;
          player.setVolume(vol);
          setVolume(vol);

          setPlayerReady(true);

          // Fullscreen change event
          player.on(window.dailymotion.events.PLAYER_PRESENTATIONMODECHANGE, state => {
            setIsFullscreen(state?.presentationMode === 'fullscreen');
          });
        })
        .catch(err => {
          console.error('[DM SDK] createPlayer failed:', err);
        });
    };

    // If SDK is already loaded, initialize immediately
    if (window.dailymotion) {
      initPlayer();
      return;
    }

    // Otherwise inject the SDK script once
    if (!sdkScriptRef.current) {
      const script = document.createElement('script');
      script.src = sdkSrc;
      script.async = true;
      script.onload = initPlayer;
      script.onerror = () => console.error('[DM SDK] Failed to load SDK script');
      document.head.appendChild(script);
      sdkScriptRef.current = script;
    }

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy?.(); } catch { }
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.dailymotionId]);

  // ── Control handlers ────────────────────────────────────────────────────────
  const handleVolumeChange = useCallback((newVol) => {
    const v = Math.max(0, Math.min(1, parseFloat(newVol)));
    setVolume(v);
    setIsMuted(v === 0);
    try { localStorage.setItem(VOLUME_KEY, String(v)); } catch { }
    if (playerRef.current) {
      try { playerRef.current.setVolume(v); } catch (e) { console.warn('[DM] setVolume:', e); }
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      const restoreVol = volume > 0 ? volume : 0.7;
      handleVolumeChange(restoreVol);
    } else {
      handleVolumeChange(0);
    }
  }, [isMuted, volume, handleVolumeChange]);

  const showSeekFeedback = useCallback((direction) => {
    setSeekFeedback(direction);
    clearTimeout(seekTimerRef.current);
    seekTimerRef.current = setTimeout(() => setSeekFeedback(null), 700);
  }, []);

  const handleSeekBackward = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current
      .getState()
      .then(state => {
        const current = state?.playerCurrentTime ?? 0;
        const target = Math.max(0, current - 10);
        playerRef.current.seek(target);
        showSeekFeedback('backward');
      })
      .catch(() => console.warn('[DM] seek backward failed'));
  }, [showSeekFeedback]);

  const handleSeekForward = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current
      .getState()
      .then(state => {
        const current = state?.playerCurrentTime ?? 0;
        const duration = state?.videoDuration ?? Infinity;
        const target = Math.min(duration, current + 10);
        if (target < duration) {
          playerRef.current.seek(target);
          showSeekFeedback('forward');
        }
      })
      .catch(() => console.warn('[DM] seek forward failed'));
  }, [showSeekFeedback]);

  const handleFullscreenToggle = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setFullscreen(!isFullscreen);
    } catch (e) {
      console.warn('[DM] setFullscreen failed:', e);
    }
  }, [isFullscreen]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Only trigger if not focused on an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (!playerReady) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSeekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeekForward();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          handleMuteToggle();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFullscreenToggle();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playerReady, handleSeekBackward, handleSeekForward, handleMuteToggle, handleFullscreenToggle]);

  // ── Volume icon helper ──────────────────────────────────────────────────────
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!video) return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep math-grid pb-24">
      {/* Header */}
      <nav className="glass-panel !rounded-none border-0 border-b border-white/5 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-text-dim hover:gold-text transition-all font-black text-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            الرجوع للقائمة
          </button>

          <div className="flex items-center gap-6">
            <div className="text-left hidden sm:block">
              <div className="font-black gold-text text-sm tracking-tight">{video.title}</div>
              <div className="text-[9px] text-text-dim font-black uppercase tracking-[2px] mt-1">{video.unit} • {video.lesson}</div>
            </div>
            <div className="w-12 h-12 luxury-gradient rounded-2xl flex items-center justify-center text-black shadow-lg">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* ── Player Area ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video player wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel gold-border shadow-2xl relative rounded-[32px] overflow-hidden"
            >
              {/* Aspect-ratio container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 bg-black">
                  {/* DM SDK will render the player inside this div */}
                  <div
                    id={DM_CONTAINER_ID}
                    className="w-full h-full"
                    style={{ minHeight: '200px' }}
                  />
                </div>

                {/* Seek feedback overlay */}
                {seekFeedback && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-2 text-white font-black text-sm animate-pulse">
                      {seekFeedback === 'backward' ? (
                        <><SkipBack size={20} className="text-gold" /> <span>10 ثوانٍ للخلف</span></>
                      ) : (
                        <><span>10 ثوانٍ للأمام</span> <SkipForward size={20} className="text-gold" /></>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Custom Controls Bar ── */}
              <div className="px-4 py-3 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center gap-3 flex-wrap">

                {/* Seek Backward */}
                <button
                  onClick={handleSeekBackward}
                  disabled={!playerReady}
                  title="رجوع 10 ثوانٍ (←)"
                  className="control-btn group"
                >
                  <SkipBack size={18} />
                  <span className="control-label">10ث</span>
                </button>

                {/* Seek Forward */}
                <button
                  onClick={handleSeekForward}
                  disabled={!playerReady}
                  title="تقديم 10 ثوانٍ (→)"
                  className="control-btn group"
                >
                  <span className="control-label">10ث</span>
                  <SkipForward size={18} />
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Mute toggle */}
                <button
                  onClick={handleMuteToggle}
                  disabled={!playerReady}
                  title={isMuted ? 'تشغيل الصوت (M)' : 'كتم الصوت (M)'}
                  className="control-btn group"
                >
                  <VolumeIcon size={18} />
                </button>

                {/* Volume slider */}
                <div className="flex items-center gap-2 flex-1 min-w-[100px] max-w-[180px]">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={e => handleVolumeChange(e.target.value)}
                    disabled={!playerReady}
                    className="volume-slider"
                    title={`مستوى الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                  <span className="text-[10px] font-black text-text-dim w-8 text-center tabular-nums">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Keyboard hints (desktop only) */}
                <div className="hidden md:flex items-center gap-1 text-[9px] text-white/20 font-bold">
                  <kbd className="kbd">←→</kbd> تقديم
                  <kbd className="kbd mx-1">M</kbd> صوت
                  <kbd className="kbd">F</kbd> شاشة
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Fullscreen */}
                <button
                  onClick={handleFullscreenToggle}
                  disabled={!playerReady}
                  title={isFullscreen ? 'خروج من ملء الشاشة (F)' : 'ملء الشاشة (F)'}
                  className="control-btn group"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Video info panel */}
            <div className="glass-panel p-10 md:p-16 gold-border rounded-[40px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 luxury-gradient opacity-[0.02] blur-[100px] -mr-32 -mt-32 rounded-full"></div>

              <div className="flex flex-wrap gap-4 mb-10">
                <span className="px-6 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] font-black uppercase tracking-[2px]">{video.unit}</span>
                <span className="px-6 py-1.5 bg-white/5 text-text-dim border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[2px]">المحاضرة رقم 4</span>
                <span className="px-6 py-1.5 bg-white/5 text-text-dim border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2">
                  <Clock size={12} className="text-gold" /> 45:00 دقيقة
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-10 leading-snug">{video.title}</h1>
              <p className="text-text-dim text-lg font-medium leading-[1.8] mb-12 max-w-4xl">
                نستعرض في هذه المحاضرة شرحاً مفصلاً لموضوع &quot;{video.lesson}&quot; مع التركيز على أهم النقاط الجوهرية التي ترد في امتحانات الثانوية العامة.
                مع العميد، سنقوم بفك شيفرة كل مسألة بخطوات منطقية وبسيطة تضمن لك الفهم الكامل.
              </p>

              <div className="grid md:grid-cols-1 gap-8">
                <div className="p-8 glass-panel gold-border bg-gold/5 rounded-[32px]">
                  <h4 className="font-black mb-4 flex items-center gap-3 gold-text"><Star size={20} /> أهداف المحاضرة</h4>
                  <ul className="text-sm text-text-dim font-bold space-y-3">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0"></div>
                      استيعاب القوانين الأساسية والمشتقة للموضوع.
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0"></div>
                      التدريب على حل المسائل المركبة (نظام الأسئلة الحديثة).
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0"></div>
                      ربط المحتوى الحالي بالمواضيع السابقة لضمان تسلسل الأفكار.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <div className="w-1.5 h-6 luxury-gradient rounded-full"></div>
                المحاضرات التالية
              </h3>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="glass-panel p-5 rounded-2xl flex gap-6 cursor-pointer gold-border hover:bg-white/5 transition-all group">
                  <div className="w-24 h-16 bg-bg-surface rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Play size={16} className="text-text-dim group-hover:gold-text" fill="currentColor" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-black mb-1 group-hover:gold-text transition-colors">تكملة شرح {video.lesson} - بـ {item}</div>
                    <div className="text-[9px] text-text-dim font-bold uppercase tracking-widest">{video.unit}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-10 rounded-[40px] gold-border text-center bg-gradient-to-b from-gold/10 to-transparent">
              <div className="w-16 h-16 luxury-gradient rounded-2xl flex items-center justify-center text-black mx-auto mb-8 shadow-2xl">
                <Info size={32} strokeWidth={2.5} />
              </div>
              <h4 className="text-xl font-black mb-4 gold-text leading-tight">جاهز للتقييم؟</h4>
              <p className="text-xs text-text-dim font-bold mb-10 leading-relaxed px-4">
                بعد الانتهاء من المشاهدة، تأكد من حل الاختبار الملحق لقياس مدى استيعابك للمحاضرة.
              </p>
              <button className="w-full py-5 luxury-gradient text-black font-black rounded-2xl text-sm glow-btn shadow-xl flex items-center justify-center gap-3 hover:gap-5 transition-all">
                بدء الاختبار الآن <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .math-grid {
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(201, 160, 80, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }

        /* ── Control buttons ── */
        :global(.control-btn) {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 10px;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 900;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        :global(.control-btn:hover:not(:disabled)) {
          color: #c9a050;
          background: rgba(201, 160, 80, 0.08);
          border-color: rgba(201, 160, 80, 0.2);
        }
        :global(.control-btn:disabled) {
          opacity: 0.3;
          cursor: not-allowed;
        }
        :global(.control-btn:active:not(:disabled)) {
          transform: scale(0.93);
        }

        :global(.control-label) {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        /* ── Volume slider ── */
        :global(.volume-slider) {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 99px;
          background: rgba(255,255,255,0.1);
          outline: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        :global(.volume-slider::-webkit-slider-thumb) {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a050, #ecd08a);
          cursor: pointer;
          box-shadow: 0 0 6px rgba(201,160,80,0.5);
          transition: transform 0.15s;
        }
        :global(.volume-slider::-webkit-slider-thumb:hover) {
          transform: scale(1.25);
        }
        :global(.volume-slider::-moz-range-thumb) {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a050, #ecd08a);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 6px rgba(201,160,80,0.5);
        }
        :global(.volume-slider:disabled) {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* ── Keyboard hint badges ── */
        :global(.kbd) {
          display: inline-block;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          font-family: monospace;
          font-size: 9px;
        }
      `}</style>
    </div>
  );
}
