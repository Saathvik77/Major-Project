import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function AnimatedBackground() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesConfig = {
        background: {
            color: { value: "transparent" },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "grab" },
            },
            modes: {
                push: { quantity: 1 },
                grab: { distance: 120 },
            },
        },
        particles: {
            color: {
                value: ["#84cc16", "#a3e635", "#65a30d"],
            },
            links: {
                color: "#84cc16",
                distance: 140,
                enable: true,
                opacity: 0.10,
                width: 1,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 0.5,
                straight: false,
            },
            number: {
                density: { enable: true },
                value: 28,
            },
            opacity: {
                value: { min: 0.05, max: 0.20 },
            },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 1.5 } },
        },
        detectRetina: true,
    };

    return (
        <div className="fixed inset-0 pointer-events-none noise-bg" style={{ zIndex: -1 }}>

            {/* ── Lime Emerald Glow — top right ── */}
            <div
                style={{
                    position: "absolute",
                    top: "-10%",
                    right: "-8%",
                    width: "55vw",
                    height: "55vh",
                    background: "radial-gradient(ellipse, rgba(132,204,22,0.15) 0%, rgba(16,185,129,0.08) 45%, transparent 72%)",
                    borderRadius: "50%",
                    filter: "blur(80px)",
                    animation: "stoneAmber 16s ease-in-out infinite alternate",
                }}
            />

            {/* ── Faint lime centre haze ────────────────────────────────── */}
            <div
                style={{
                    position: "absolute",
                    top: "30%",
                    left: "20%",
                    width: "60vw",
                    height: "50vh",
                    background: "radial-gradient(ellipse, rgba(132,204,22,0.08) 0%, transparent 65%)",
                    borderRadius: "50%",
                    filter: "blur(100px)",
                    animation: "stoneAmber 22s ease-in-out infinite alternate-reverse",
                }}
            />

            {/* --- Additional Interactive Glow --- */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(132,204,22,0.03)_0%,transparent_50%)]" />

            {/* ── Very subtle dark vignette at bottom ──────────────────── */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "35vh",
                    background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                    pointerEvents: "none",
                }}
            />

            {/* Particles */}
            {init && (
                <Particles
                    id="tsparticles"
                    options={particlesConfig}
                    className="absolute inset-0 w-full h-full"
                />
            )}

            <style>{`
                @keyframes stoneAmber {
                    0%   { transform: translate(0, 0)   scale(1);    opacity: 0.75; }
                    40%  { transform: translate(-3%, 4%) scale(1.05); opacity: 1;    }
                    70%  { transform: translate(4%, -2%) scale(0.97); opacity: 0.85; }
                    100% { transform: translate(-2%, 6%) scale(1.03); opacity: 0.90; }
                }
            `}</style>
        </div>
    );
}
