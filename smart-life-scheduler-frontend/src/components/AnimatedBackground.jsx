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
                random: false,
                speed: 1.5,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                },
                value: 120,
            },
            opacity: {
                value: 0.5,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 3 },
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
