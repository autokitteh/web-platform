import React, { useEffect, useRef } from "react";

import { cn } from "@src/utilities";

interface FireworksProps {
	duration?: number; // in milliseconds
	className?: string;
	intensity?: "low" | "medium" | "high"; // Controls number of fireworks and particles
}

export const Fireworks: React.FC<FireworksProps> = ({ duration = 3000, className, intensity = "medium" }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		// Create fireworks
		const container = containerRef.current;
		if (!container) return;

		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Generate number of fireworks based on intensity
		const baseCount = intensity === "low" ? 4 : intensity === "medium" ? 8 : 12;
		const fireworksCount = baseCount + Math.floor(Math.random() * 4);

		// Create fireworks in waves for more dramatic effect
		const createFireworkWave = (wave = 0) => {
			// Don't create more waves if we're beyond duration
			if (wave * 600 >= duration) return;

			// Create fireworks for this wave
			for (let i = 0; i < Math.ceil(fireworksCount / 3); i++) {
				setTimeout(() => {
					createFirework(container);
				}, Math.random() * 300); // Spread them out slightly in each wave
			}

			// Schedule next wave
			setTimeout(() => {
				createFireworkWave(wave + 1);
			}, 600);
		};

		// Start fireworks
		createFireworkWave();

		// Set timeout to remove the component after the specified duration
		timeoutRef.current = setTimeout(() => {
			if (container && container.parentNode) {
				// Remove all fireworks
				while (container.firstChild) {
					container.removeChild(container.firstChild);
				}
			}
		}, duration);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [duration, intensity]);

	// Function to create a single firework
	const createFirework = (container: HTMLDivElement) => {
		// Create the firework element
		const firework = document.createElement("div");

		// Random position (distributed across the screen)
		const posX = 20 + Math.random() * 60; // 20%-80% of container width
		const posY = 10 + Math.random() * 50; // 10%-60% of container height (mostly upper part)

		// Random size - bigger than before
		const size = Math.random() * 6 + 4; // 4-10px

		// More vibrant color schemes
		const colorSchemes = [
			// Rainbow scheme
			`hsl(${Math.random() * 360}, 100%, 65%)`,
			// Gold/Yellow celebratory
			`hsl(${40 + Math.random() * 20}, 100%, ${70 + Math.random() * 15}%)`,
			// Vibrant pink/purple
			`hsl(${290 + Math.random() * 50}, 100%, 65%)`,
			// Bright blue
			`hsl(${190 + Math.random() * 30}, 100%, 65%)`,
			// Green
			`hsl(${100 + Math.random() * 40}, 100%, 65%)`,
		];

		const color = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

		// Apply styles - now with more dramatic effects
		firework.style.cssText = `
      position: absolute;
      top: ${posY}%;
      left: ${posX}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      box-shadow: 0 0 ${size * 3}px ${size}px ${color};
      transform: scale(0);
      animation: firework-explode 1s cubic-bezier(0.22, 0.61, 0.36, 1) forwards, 
                firework-fade 1s ease-out ${Math.random() * 0.2}s forwards;
      z-index: ${Math.floor(Math.random() * 10)};
    `;

		// Add a celebratory sound effect visually through text
		if (Math.random() > 0.7) {
			const textElement = document.createElement("div");
			const celebrationTexts = ["✨", "🎉", "🎊", "⭐", "🌟", "Wow!", "Amazing!", "Hooray!"];
			const text = celebrationTexts[Math.floor(Math.random() * celebrationTexts.length)];

			textElement.innerText = text;
			textElement.style.cssText = `
        position: absolute;
        font-size: ${12 + Math.random() * 16}px;
        color: white;
        text-shadow: 0 0 5px rgba(0,0,0,0.8);
        top: -20px;
        left: 0;
        transform: translateX(-50%);
        animation: celebration-text 1.5s ease-out forwards;
        font-weight: bold;
      `;

			firework.appendChild(textElement);
		}

		// Add explosion particles - more than before
		const particleCount = 25 + Math.floor(Math.random() * 25); // 25-50 particles
		for (let j = 0; j < particleCount; j++) {
			createParticle(firework, color);
		}

		// Add to container
		container.appendChild(firework);
	};

	// Function to create a particle for a firework
	const createParticle = (parent: HTMLDivElement, color: string) => {
		const particle = document.createElement("div");

		// Random direction
		const angle = Math.random() * Math.PI * 2;
		const distance = Math.random() * 90 + 40; // 40-130px travel distance (farther)

		// Random size
		const size = Math.random() * 3 + 1; // 1-4px (slightly bigger)

		// Randomize the particle color a bit for variety
		const hue =
			Math.random() > 0.7
				? `hsl(${parseInt(color.match(/\(([^,]+)/)?.[1] || "0") + (Math.random() * 50 - 25)}, 100%, 65%)`
				: color;

		// Longer animation for more dramatic effect
		const animationDuration = 0.8 + Math.random() * 0.6; // 0.8-1.4s

		// Apply styles
		particle.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${size}px;
      height: ${size}px;
      background: ${hue};
      border-radius: 50%;
      box-shadow: 0 0 ${size * 2}px ${size / 2}px ${hue};
      transform: translate(-50%, -50%);
      animation: firework-particle ${animationDuration}s cubic-bezier(0.45, 0, 0.55, 1) forwards;
      --angle: ${angle}rad;
      --distance: ${distance}px;
    `;

		parent.appendChild(particle);
	};

	return (
		<div
			className={cn("pointer-events-none fixed inset-0 z-50 overflow-hidden bg-black/10", className)}
			ref={containerRef}
			style={{
				animation: `fireworks-container-fade ${duration}ms forwards`,
			}}
		>
			<style global jsx>{`
				@keyframes firework-explode {
					0% {
						transform: scale(0);
						opacity: 0;
					}
					25% {
						transform: scale(1.2);
						opacity: 1;
					}
					35% {
						transform: scale(0.9);
					}
					50% {
						transform: scale(1);
					}
					100% {
						transform: scale(0.8);
						opacity: 0;
					}
				}

				@keyframes firework-fade {
					0% {
						opacity: 1;
					}
					100% {
						opacity: 0;
					}
				}

				@keyframes firework-particle {
					0% {
						transform: translate(-50%, -50%) scale(1);
						opacity: 1;
					}
					20% {
						opacity: 1;
					}
					100% {
						transform: translate(
								calc(-50% + var(--distance) * cos(var(--angle))),
								calc(-50% + var(--distance) * sin(var(--angle)))
							)
							scale(0);
						opacity: 0;
					}
				}

				@keyframes fireworks-container-fade {
					0% {
						opacity: 1;
					}
					85% {
						opacity: 1;
					}
					100% {
						opacity: 0;
					}
				}

				@keyframes celebration-text {
					0% {
						opacity: 0;
						transform: translateY(0) translateX(-50%) scale(0.5);
					}
					20% {
						opacity: 1;
						transform: translateY(-20px) translateX(-50%) scale(1.2);
					}
					80% {
						opacity: 0.8;
					}
					100% {
						opacity: 0;
						transform: translateY(-40px) translateX(-50%) scale(0.8);
					}
				}
			`}</style>
		</div>
	);
};
