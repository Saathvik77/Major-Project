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
                enable: false, // Turn off web lines
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: 0.5, // Much slower
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                },
                value: 30, // Dramatically reduced count
            },
            opacity: {
                value: { min: 0.1, max: 0.4 }, // Softer visibility
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

    if (!init) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Particles
                id="tsparticles"
                options={particlesConfig}
                className="w-full h-full"
            />
        </div>
    );
}
