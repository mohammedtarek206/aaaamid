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

// ─────────────────────────────────────────────────────────────────────────────
// Official Dailymotion Player Web SDK integration:
//   • Uses window.dailymotion.createPlayer() to get the live player instance.
//   • Controls real playback via player.seek(), player.setVolume(), player.setMute().
//   • Tracks actual playback time and duration via official player events.
//   • Fullscreen via native browser requestFullscreen() on wrapper card.
//   • Persistent volume settings in localStorage.
// ─────────────────────────────────────────────────────────────────────────────

const DM_CONTAINER_ID = 'dm-video-player';
const VOLUME_KEY = 'ameed_player_volume';
const DM_ORIGIN = 'https://geo.dailymotion.com';

export default function WatchVideo() {
  const { id } = useParams();
  const router = useRouter();
  const [video, setVideo] = useState(null);

  // ── player controls state ──────────────────────────────────────────────────
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState(null); // 'forward' | 'backward' | null
  const [displayTime, setDisplayTime] = useState(0);     // seconds, for UI
  const [displayDuration, setDisplayDuration] = useState(0); // seconds, for UI

  // ── refs ───────────────────────────────────────────────────────────────────
  const playerRef = useRef(null);
  const wrapperRef = useRef(null);   // the outer div we fullscreen
  const currentTime = useRef(0);
  const duration = useRef(0);
  const fbTimer = useRef(null);

  // ── restore volume from localStorage ──────────────────────────────────────
  useEffect(() => {
    try {
      const saved = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (!isNaN(saved) && saved >= 0 && saved <= 1) {
        setVolume(saved);
      }
    } catch { }
  }, []);

  // ── fetch video data ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const vRes = await api.get('/student/videos');
        const v = vRes.data.find(item => item._id === id);
        setVideo(v);

        // Seed duration from admin data if set
        if (v?.durationSeconds > 0) {
          duration.current = v.durationSeconds;
          setDisplayDuration(v.durationSeconds);
        }

        // Fetch real duration directly from Dailymotion API
        if (v?.dailymotionId) {
          const dmId = extractDailymotionId(v.dailymotionId);
          if (dmId) {
            fetch(`https://api.dailymotion.com/video/${dmId}?fields=duration`)
              .then(r => r.json())
              .then(dmData => {
                if (dmData?.duration > 0) {
                  duration.current = dmData.duration;
                  setDisplayDuration(dmData.duration);
                }
              })
              .catch(() => {});
          }
        }

        if (v) {
          try {
            await api.post('/student/activity/log', {
              action: 'view_video',
              targetId: id,
              details: `مشاهدة فيديو: ${v.title}`,
            });
          } catch { }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideo();
  }, [id]);

  // ── Initialize Official Dailymotion Player SDK ─────────────────────────────
  useEffect(() => {
    if (!video?.dailymotionId) return;

    const videoId = extractDailymotionId(video.dailymotionId);
    if (!videoId) return;

    let isMounted = true;
    const playerId = getDailymotionPlayerId();
    const sdkSrc = `https://geo.dailymotion.com/player/${playerId}.js`;

    const initPlayer = () => {
      if (!isMounted || !window.dailymotion?.createPlayer) return;

      const container = document.getElementById(DM_CONTAINER_ID);
      if (!container) return;

      // Clean up previous instance
      if (playerRef.current) {
        try { playerRef.current.destroy?.(); } catch { }
        playerRef.current = null;
      }

      container.innerHTML = '';
      container.classList.remove('dailymotion-player-wrapper', 'dailymotion-player-root');

      window.dailymotion
        .createPlayer(DM_CONTAINER_ID, {
          video: videoId,
          player: playerId,
          params: {
            autoplay: true,
            mute: false,
          },
        })
        .then(player => {
          if (!isMounted) {
            try { player.destroy?.(); } catch { }
            return;
          }

          playerRef.current = player;
          setPlayerReady(true);

          // Apply saved volume to real player
          const savedVol = parseFloat(localStorage.getItem(VOLUME_KEY));
          const initVol = !isNaN(savedVol) && savedVol >= 0 && savedVol <= 1 ? savedVol : volume;
          try {
            player.setVolume(initVol);
            if (isMuted || initVol === 0) {
              player.setMute(true);
            } else {
              player.setMute(false);
            }
          } catch { }

          // Register official event listeners on the player
          try {
            const ev = window.dailymotion.events;

            // Real-time playback position update
            player.on(ev.VIDEO_TIMECHANGE, state => {
              const t = state?.playerCurrentTime ?? state?.videoTime ?? state?.currentTime;
              if (typeof t === 'number' && !isNaN(t) && t >= 0) {
                currentTime.current = t;
                setDisplayTime(t);
              }
            });

            // Video duration change
            player.on(ev.VIDEO_DURATIONCHANGE, state => {
              const dur = state?.videoDuration ?? state?.playerDuration ?? state?.duration;
              if (typeof dur === 'number' && dur > 0) {
                duration.current = dur;
                setDisplayDuration(dur);
              }
            });

            // Real player volume change
            player.on(ev.PLAYER_VOLUMECHANGE, state => {
              if (typeof state?.playerVolume === 'number') {
                setVolume(state.playerVolume);
              }
              if (typeof state?.playerIsMuted === 'boolean') {
                setIsMuted(state.playerIsMuted);
              }
            });

            // Fullscreen presentation mode
            player.on(ev.PLAYER_PRESENTATIONMODECHANGE, state => {
              setIsFullscreen(state?.playerPresentationMode === 'fullscreen');
            });
          } catch (e) {
            console.warn('[DM Player] Error attaching events:', e);
          }
        })
        .catch(err => {
          console.error('[DM Player SDK] createPlayer failed:', err);
        });
    };

    if (window.dailymotion?.createPlayer) {
      initPlayer();
    } else {
      let script = document.getElementById('dm-player-sdk');
      if (!script) {
        script = document.createElement('script');
        script.id = 'dm-player-sdk';
        script.src = sdkSrc;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', initPlayer);
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try { playerRef.current.destroy?.(); } catch { }
        playerRef.current = null;
      }
    };
  }, [video?.dailymotionId]);

  // ── listen to native fullscreen change ──────────────────────────────────
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── helper: format seconds → m:ss ─────────────────────────────────────────────
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ── volume: controls the REAL player sound ─────────────────────────────────
  const handleVolumeChange = useCallback((newVal) => {
    const v = Math.max(0, Math.min(1, parseFloat(newVal)));
    setVolume(v);
    const muted = v === 0;
    setIsMuted(muted);
    try { localStorage.setItem(VOLUME_KEY, String(v)); } catch { }

    if (playerRef.current) {
      try {
        playerRef.current.setVolume(v);
        if (muted) {
          playerRef.current.setMute(true);
        } else {
          playerRef.current.setMute(false);
        }
      } catch (e) {
        console.warn('[DM Player] setVolume error:', e);
      }
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      const restore = volume > 0 ? volume : 0.7;
      setVolume(restore);
      setIsMuted(false);
      try { localStorage.setItem(VOLUME_KEY, String(restore)); } catch { }
      if (playerRef.current) {
        try {
          playerRef.current.setMute(false);
          playerRef.current.setVolume(restore);
        } catch { }
      }
    } else {
      setIsMuted(true);
      if (playerRef.current) {
        try {
          playerRef.current.setMute(true);
        } catch { }
      }
    }
  }, [isMuted, volume]);

  // ── seek: controls REAL video playback position ────────────────────────────
  const showFeedback = useCallback((dir) => {
    setSeekFeedback(dir);
    clearTimeout(fbTimer.current);
    fbTimer.current = setTimeout(() => setSeekFeedback(null), 800);
  }, []);

  const handleSeekBackward = useCallback(() => {
    const doSeek = (cur) => {
      const target = Math.max(0, cur - 10);
      currentTime.current = target;
      setDisplayTime(target);
      if (playerRef.current?.seek) {
        try { playerRef.current.seek(target); } catch { }
      }
      showFeedback('backward');
    };

    if (playerRef.current?.getState) {
      playerRef.current.getState().then(state => {
        const cur = state?.playerCurrentTime ?? state?.videoTime ?? currentTime.current;
        doSeek(cur);
      }).catch(() => {
        doSeek(currentTime.current);
      });
    } else {
      doSeek(currentTime.current);
    }
  }, [showFeedback]);

  const handleSeekForward = useCallback(() => {
    const doSeek = (cur) => {
      const dur = duration.current;
      let target = cur + 10;
      if (dur > 0 && target > dur) target = dur;
      currentTime.current = target;
      setDisplayTime(target);
      if (playerRef.current?.seek) {
        try { playerRef.current.seek(target); } catch { }
      }
      showFeedback('forward');
    };

    if (playerRef.current?.getState) {
      playerRef.current.getState().then(state => {
        const cur = state?.playerCurrentTime ?? state?.videoTime ?? currentTime.current;
        doSeek(cur);
      }).catch(() => {
        doSeek(currentTime.current);
      });
    } else {
      doSeek(currentTime.current);
    }
  }, [showFeedback]);

  // ── click on progress bar to seek real player ──────────────────────────────
  const handleProgressClick = useCallback((e) => {
    if (!duration.current || duration.current <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = Math.round(ratio * duration.current);
    currentTime.current = target;
    setDisplayTime(target);
    if (playerRef.current?.seek) {
      try { playerRef.current.seek(target); } catch { }
    }
  }, []);

  // ── fullscreen (native browser API on wrapper div) ─────────────────────────
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.().catch(() => {
        playerRef.current?.setFullscreen?.(true);
      });
    } else {
      document.exitFullscreen?.().catch(() => {
        playerRef.current?.setFullscreen?.(false);
      });
    }
  }, []);

  // ── keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); handleSeekBackward(); break;
        case 'ArrowRight': e.preventDefault(); handleSeekForward(); break;
        case 'm': case 'M': e.preventDefault(); handleMuteToggle(); break;
        case 'f': case 'F': e.preventDefault(); handleFullscreenToggle(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSeekBackward, handleSeekForward, handleMuteToggle, handleFullscreenToggle]);

  // ── volume icon ────────────────────────────────────────────────────────────
  const VolumeIcon = (isMuted || volume === 0) ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ── loading state ──────────────────────────────────────────────────────────
  if (!video) return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-deep math-grid pb-24">

      {/* ── Header ── */}
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
              <div className="text-[9px] text-text-dim font-black uppercase tracking-[2px] mt-1">
                {video.unit} • {video.lesson}
              </div>
            </div>
            <div className="w-12 h-12 luxury-gradient rounded-2xl flex items-center justify-center text-black shadow-lg">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* ── Player Column ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Player card – wrapperRef covers BOTH video + controls bar so fullscreen includes the bar */}
            <div
              ref={wrapperRef}
              className="glass-panel gold-border shadow-2xl relative rounded-[32px] overflow-hidden fs-player-card"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full"
              >
                {/* Video + feedback overlay */}
                <div
                  className="relative w-full bg-black fs-video-area"
                  style={{ paddingBottom: '56.25%' }}
                >
                  <div className="absolute inset-0 bg-black overflow-hidden">
                    <div
                      id={DM_CONTAINER_ID}
                      className="w-full h-full"
                    />
                    {!playerReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Seek feedback overlay */}
                  {seekFeedback && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                      <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-2 text-white font-black text-sm">
                        {seekFeedback === 'backward'
                          ? <><SkipBack size={20} className="text-gold" /><span>10 ثوانٍ للخلف</span></>
                          : <><span>10 ثوانٍ للأمام</span><SkipForward size={20} className="text-gold" /></>
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Controls Bar – always visible inside the fullscreen container ── */}
                <div className="px-4 py-2 pb-3 bg-black/85 backdrop-blur-xl border-t border-white/5
                                flex flex-col gap-2 fs-controls-bar">

                  {/* ── Progress bar row ── */}
                  <div className="flex items-center gap-3 w-full">
                    {/* elapsed time */}
                    <span className="text-[11px] font-black tabular-nums select-none
                                    text-gold/80 shrink-0 min-w-[36px] text-right">
                      {formatTime(displayTime)}
                    </span>

                    {/* clickable track */}
                    <div
                      className="progress-track"
                      onClick={handleProgressClick}
                      title="انقر للتخطي إلى هذا الموقع"
                    >
                      {/* filled portion */}
                      <div
                        className="progress-fill"
                        style={{
                          width: displayDuration > 0
                            ? `${Math.min(100, (displayTime / displayDuration) * 100)}%`
                            : '0%'
                        }}
                      />
                      {/* thumb dot */}
                      <div
                        className="progress-thumb"
                        style={{
                          left: displayDuration > 0
                            ? `${Math.min(100, (displayTime / displayDuration) * 100)}%`
                            : '0%'
                        }}
                      />
                    </div>

                    {/* total duration */}
                    <span className="text-[11px] font-black tabular-nums select-none
                                    text-white/30 shrink-0 min-w-[36px]">
                      {formatTime(displayDuration)}
                    </span>
                  </div>

                  {/* ── Buttons row ── */}
                  <div className="flex items-center gap-3 flex-wrap">

                    <button
                      onClick={handleSeekBackward}
                      title="رجوع 10 ثوانٍ  (←)"
                      className="ctrl-btn"
                    >
                      <SkipBack size={18} />
                      <span className="ctrl-lbl">10ث</span>
                    </button>

                    {/* ⏩ Seek Forward */}
                    <button
                      onClick={handleSeekForward}
                      title="تقديم 10 ثوانٍ  (→)"
                      className="ctrl-btn"
                    >
                      <span className="ctrl-lbl">10ث</span>
                      <SkipForward size={18} />
                    </button>

                    {/* divider */}
                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* 🔇 Mute toggle */}
                    <button
                      onClick={handleMuteToggle}
                      title={isMuted ? 'تشغيل الصوت (M)' : 'كتم الصوت (M)'}
                      className="ctrl-btn"
                    >
                      <VolumeIcon size={18} />
                    </button>

                    {/* Volume slider */}
                    <div className="flex items-center gap-2 min-w-[90px] max-w-[170px] flex-1">
                      <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={e => handleVolumeChange(e.target.value)}
                        className="vol-slider"
                        title={`مستوى الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                      />
                      <span className="text-[10px] font-black text-text-dim w-8 text-center tabular-nums select-none">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>

                    {/* spacer */}
                    <div className="flex-1" />

                    {/* keyboard hints – desktop only */}
                    <div className="hidden md:flex items-center gap-1 text-[9px] text-white/20 font-bold select-none">
                      <kbd className="dm-kbd">←→</kbd> تقديم
                      <kbd className="dm-kbd mx-1">M</kbd> صوت
                      <kbd className="dm-kbd">F</kbd> شاشة
                    </div>

                    {/* divider */}
                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* ⛶ Fullscreen */}
                    <button
                      onClick={handleFullscreenToggle}
                      title={isFullscreen ? 'خروج من ملء الشاشة (F)' : 'ملء الشاشة (F)'}
                      className="ctrl-btn"
                    >
                      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Video info */}
            <div className="glass-panel p-10 md:p-16 gold-border rounded-[40px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 luxury-gradient opacity-[0.02] blur-[100px] -mr-32 -mt-32 rounded-full" />

              <div className="flex flex-wrap gap-4 mb-10">
                <span className="px-6 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] font-black uppercase tracking-[2px]">
                  {video.unit}
                </span>
                <span className="px-6 py-1.5 bg-white/5 text-text-dim border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[2px]">
                  المحاضرة رقم 4
                </span>
                {video.durationSeconds > 0 && (
                  <span className="px-6 py-1.5 bg-white/5 text-text-dim border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2">
                    <Clock size={12} className="text-gold" /> {formatTime(video.durationSeconds)} دقيقة
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-10 leading-snug">{video.title}</h1>
              <p className="text-text-dim text-lg font-medium leading-[1.8] mb-12 max-w-4xl">
                نستعرض في هذه المحاضرة شرحاً مفصلاً لموضوع &quot;{video.lesson}&quot; مع التركيز على أهم النقاط الجوهرية التي ترد في امتحانات الثانوية العامة.
                مع العميد، سنقوم بفك شيفرة كل مسألة بخطوات منطقية وبسيطة تضمن لك الفهم الكامل.
              </p>

              <div className="p-8 glass-panel gold-border bg-gold/5 rounded-[32px]">
                <h4 className="font-black mb-4 flex items-center gap-3 gold-text">
                  <Star size={20} /> أهداف المحاضرة
                </h4>
                <ul className="text-sm text-text-dim font-bold space-y-3">
                  {[
                    'استيعاب القوانين الأساسية والمشتقة للموضوع.',
                    'التدريب على حل المسائل المركبة (نظام الأسئلة الحديثة).',
                    'ربط المحتوى الحالي بالمواضيع السابقة لضمان تسلسل الأفكار.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <div className="w-1.5 h-6 luxury-gradient rounded-full" />
                المحاضرات التالية
              </h3>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="glass-panel p-5 rounded-2xl flex gap-6 cursor-pointer gold-border hover:bg-white/5 transition-all group">
                  <div className="w-24 h-16 bg-bg-surface rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play size={16} className="text-text-dim group-hover:gold-text" fill="currentColor" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-black mb-1 group-hover:gold-text transition-colors">
                      تكملة شرح {video.lesson} - بـ {item}
                    </div>
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
            radial-gradient(circle at 2px 2px, rgba(201,160,80,0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }

        /* ── Fullscreen layout ─────────────────────────────── */
        /* When the outer card div goes fullscreen, make the video
           fill all available vertical space and pin the controls bar */
        :global(.fs-player-card:fullscreen),
        :global(.fs-player-card:-webkit-full-screen) {
          display: flex !important;
          flex-direction: column !important;
          width: 100vw !important;
          height: 100vh !important;
          border-radius: 0 !important;
          background: #000 !important;
        }

        /* The motion.div flex wrapper inside fullscreen */
        :global(.fs-player-card:fullscreen > div),
        :global(.fs-player-card:-webkit-full-screen > div) {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Video area: remove fixed padding-bottom ratio, fill remaining height */
        :global(.fs-player-card:fullscreen .fs-video-area),
        :global(.fs-player-card:-webkit-full-screen .fs-video-area) {
          flex: 1 !important;
          padding-bottom: 0 !important;
          height: 0 !important;   /* flex will override this */
          min-height: 0 !important;
        }

        /* Controls bar: fixed height at the bottom */
        :global(.fs-player-card:fullscreen .fs-controls-bar),
        :global(.fs-player-card:-webkit-full-screen .fs-controls-bar) {
          flex-shrink: 0 !important;
          background: rgba(0,0,0,0.92) !important;
          border-top: 1px solid rgba(201,160,80,0.2) !important;
        }

        /* ── Dailymotion Player Container ──────────────────── */
        :global(#dm-video-player),
        :global(#dm-video-player .dailymotion-player-root),
        :global(#dm-video-player .dailymotion-player-wrapper),
        :global(#dm-video-player iframe) {
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          display: block !important;
        }

        /* ── Control buttons ───────────────────────────────── */
        :global(.ctrl-btn) {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 10px; border-radius: 10px;
          color: rgba(255,255,255,0.55);
          font-size: 12px; font-weight: 900;
          background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all .2s ease;
          white-space: nowrap;
        }
        :global(.ctrl-btn:hover) {
          color: #c9a050;
          background: rgba(201,160,80,0.08);
          border-color: rgba(201,160,80,0.2);
        }
        :global(.ctrl-btn:active) { transform: scale(0.92); }

        :global(.ctrl-lbl) {
          font-size: 10px; font-weight: 900; letter-spacing: .5px;
        }

        /* ── Volume slider ────────────────────────────────── */
        :global(.vol-slider) {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 99px;
          background: rgba(255,255,255,0.12); outline: none; cursor: pointer;
        }
        :global(.vol-slider::-webkit-slider-thumb) {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: linear-gradient(135deg,#c9a050,#ecd08a);
          cursor: pointer; box-shadow: 0 0 6px rgba(201,160,80,.5);
          transition: transform .15s;
        }
        :global(.vol-slider::-webkit-slider-thumb:hover) { transform: scale(1.3); }
        :global(.vol-slider::-moz-range-thumb) {
          width:14px; height:14px; border-radius:50%; border:none;
          background: linear-gradient(135deg,#c9a050,#ecd08a);
          box-shadow: 0 0 6px rgba(201,160,80,.5);
        }

        /* ── Keyboard badges ──────────────────────────────── */
        :global(.dm-kbd) {
          display: inline-block; padding: 1px 5px; border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          font-family: monospace; font-size: 9px;
        }

        /* ── Progress / seek bar ─────────────────────────── */
        :global(.progress-track) {
          position: relative;
          flex: 1;
          height: 5px;
          background: rgba(255,255,255,0.10);
          border-radius: 99px;
          cursor: pointer;
          overflow: visible;
          transition: height .15s;
        }
        :global(.progress-track:hover) { height: 7px; }

        :global(.progress-fill) {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          border-radius: 99px;
          background: linear-gradient(90deg, #c9a050, #ecd08a);
          pointer-events: none;
          transition: width .3s linear;
        }

        :global(.progress-thumb) {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 13px; height: 13px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a050, #ecd08a);
          box-shadow: 0 0 8px rgba(201,160,80,0.7);
          pointer-events: none;
          opacity: 0;
          transition: opacity .15s, left .3s linear;
        }
        :global(.progress-track:hover .progress-thumb) { opacity: 1; }
      `}</style>
    </div>
  );
}
