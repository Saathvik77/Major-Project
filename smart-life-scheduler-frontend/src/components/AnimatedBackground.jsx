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
            color: {
                value: "transparent",
            },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: "push",
                },
                onHover: {
                    enable: true,
                    mode: "grab",
                },
            },
            modes: {
                push: {
                    quantity: 2,
                },
                grab: {
                    distance: 150,
                },
            },
        },
        particles: {
            color: {
                value: ["#7C6CFF", "#00E5FF", "#FF7AF6", "#FFD166"],
            },
            links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: 0.8,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                },
                value: 40,
            },
            opacity: {
                value: { min: 0.1, max: 0.4 },
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 2 },
            },
        },
        detectRetina: true,
    };

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>

            {/* ── Cinematic Night Glow Blobs ──────────────────────────────
                Inspired by the indoor-lamp-at-night aesthetic:
                warm amber top-right  +  cool steel-blue bottom-left       */}

            {/* Warm amber lamp glow – top right */}
            <div
                className="absolute"
                style={{
                    top: '-5%',
                    right: '-5%',
                    width: '65vw',
                    height: '65vh',
                    background: 'radial-gradient(ellipse, rgba(193,127,36,0.30) 0%, rgba(212,137,10,0.15) 40%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    animation: 'cinematicAmber 14s ease-in-out infinite alternate',
                }}
            />

            {/* Secondary amber glint – right edge */}
            <div
                className="absolute"
                style={{
                    top: '25%',
                    right: '-8%',
                    width: '35vw',
                    height: '40vh',
                    background: 'radial-gradient(ellipse, rgba(220,150,20,0.18) 0%, transparent 65%)',
                    borderRadius: '50%',
                    filter: 'blur(50px)',
                    animation: 'cinematicAmber 18s ease-in-out infinite alternate-reverse',
                }}
            />

            {/* Cool teal-blue shadow – bottom left, like a night window */}
            <div
                className="absolute"
                style={{
                    bottom: '-8%',
                    left: '-5%',
                    width: '70vw',
                    height: '65vh',
                    background: 'radial-gradient(ellipse, rgba(14,61,90,0.35) 0%, rgba(20,80,120,0.18) 40%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(50px)',
                    animation: 'cinematicBlue 16s ease-in-out infinite alternate',
                }}
            />

            {/* Deep indigo haze – center, atmospheric depth */}
            <div
                className="absolute"
                style={{
                    top: '35%',
                    left: '25%',
                    width: '55vw',
                    height: '50vh',
                    background: 'radial-gradient(ellipse, rgba(30,27,90,0.22) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'cinematicIndigo 20s ease-in-out infinite alternate',
                }}
            />

            {/* Steel-blue top-left shimmer */}
            <div
                className="absolute"
                style={{
                    top: '0%',
                    left: '0%',
                    width: '30vw',
                    height: '35vh',
                    background: 'radial-gradient(ellipse, rgba(26,58,92,0.22) 0%, transparent 65%)',
                    borderRadius: '50%',
                    filter: 'blur(45px)',
                    animation: 'cinematicBlue 22s ease-in-out infinite alternate-reverse',
                }}
            />

            {/* Particles layer on top of glows */}
            {init && (
                <Particles
                    id="tsparticles"
                    options={particlesConfig}
                    className="absolute inset-0 w-full h-full"
                />
            )}

            {/* Keyframe styles injected inline */}
            <style>{`
                @keyframes cinematicAmber {
                    0%   { transform: translate(0,    0)    scale(1);    opacity: 0.85; }
                    33%  { transform: translate(-3%,  4%)   scale(1.06); opacity: 1;    }
                    66%  { transform: translate(4%,  -3%)   scale(0.96); opacity: 0.90; }
                    100% { transform: translate(-2%,  6%)   scale(1.04); opacity: 0.95; }
                }
                @keyframes cinematicBlue {
                    0%   { transform: translate(0,    0)    scale(1);    opacity: 0.80; }
                    33%  { transform: translate(4%,  -4%)   scale(1.07); opacity: 1;    }
                    66%  { transform: translate(-3%,  3%)   scale(0.95); opacity: 0.85; }
                    100% { transform: translate(2%,  -6%)   scale(1.05); opacity: 0.92; }
                }
                @keyframes cinematicIndigo {
                    0%   { transform: translate(0,    0)    scale(1);    opacity: 0.75; }
                    50%  { transform: translate(3%,   3%)   scale(1.08); opacity: 0.95; }
                    100% { transform: translate(-4%,  2%)   scale(0.94); opacity: 0.80; }
                }
            `}</style>
        </div>
    );
}
