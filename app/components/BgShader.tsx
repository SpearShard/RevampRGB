'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = /* glsl */`
    uniform vec2 u_resolution;
    uniform float u_time;
    varying vec2 vUv;

    // Premium Fractional Brownian Motion (fBm) for organic aura fields
    float hash2D(in vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise2D(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash2D(i + vec2(0.0,0.0)), hash2D(i + vec2(1.0,0.0)), u.x),
                   mix(hash2D(i + vec2(0.0,1.0)), hash2D(i + vec2(1.0,1.0)), u.x), u.y);
    }

    float fBm(in vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
            value += amplitude * noise2D(p * frequency);
            p = vec2(p.x * 0.92 - p.y * 0.38, p.x * 0.38 + p.y * 0.92); // Vector rotation matrix step
            frequency *= 2.1;
            amplitude *= 0.48;
        }
        return value;
    }

    void main() {
        // Complete normalization with strict aspect ratio preservation
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Hypnotic, ultra-slow temporal modification pace
        float t = u_time * 0.18;

        // Scale coordinates for a sprawling, ambient aura footprint
        p *= 1.4;

        // 1. CHRONO DOMAIN WARPING (THE VISCOUS FLOW)
        // Layering noise fields inside themselves creates the heavy fluid pulling effect of an aura
        vec2 warpA = vec2(fBm(p + vec2(t * 0.2, t * 0.1)), fBm(p - vec2(t * 0.15, t * 0.25)));
        vec2 warpB = vec2(fBm(p + warpA * 1.5 + vec2(t * 0.1)), fBm(p - warpA * 1.2 + vec2(t * 0.13)));
        
        // Final coordinates for color space generation
        vec2 auraCoords = p + warpB * 0.65;

        // 2. ISOLATED VOLUMETRIC EMISSION RAYS
        // We isolate dense energy tracks for Red, Green, and Blue individually
        float rTrack = fBm(auraCoords * 1.2 + vec2(sin(t * 0.4), cos(t * 0.2)));
        float gTrack = fBm(auraCoords * 1.0 - vec2(cos(t * 0.3), sin(t * 0.5)));
        float bTrack = fBm(auraCoords * 1.4 + vec2(sin(t * 0.25) * 1.5));

        // Shape and compress the density vectors into soft, burning pockets of light
        float rCloud = pow(smoothstep(0.35, 0.85, rTrack), 2.2);
        float gSmoke = pow(smoothstep(0.38, 0.82, gTrack), 2.0);
        float bAura  = pow(smoothstep(0.32, 0.88, bTrack), 2.5);

        // 3. APPLY LUXURY DISPLAY PIGMENT SCALES
        // Vibrant, luminous primary tones tailored for high-end dark interfaces
        vec3 redAura   = vec3(1.0, 0.01, 0.08) * rCloud * 1.6;
        vec3 greenAura = vec3(0.0, 0.95, 0.22) * gSmoke * 1.1;
        vec3 blueAura  = vec3(0.02, 0.18, 1.0) * bAura * 2.2;

        // Gaseous additive overlapping layers
        vec3 blendedAura = redAura + greenAura + blueAura;

        // 4. RADIAL FALLOFF AND MATERIAL CORE INTEGRATION
        // Smooth spherical containment field so the aura naturally fades into the peripheral dark void
        float radialMask = smoothstep(1.5, 0.08, length(p));
        blendedAura *= radialMask;

        // Overlay a dense, ultra-fine film grain to add cinematic texture across the gradients
        float microGrain = fract(sin(dot(gl_FragCoord.xy + u_time, vec2(12.9898, 78.233))) * 43758.5453);
        blendedAura += vec3(microGrain * 0.016) * radialMask;

        // Deep studio graphite anchor tone background (#030305)
        vec3 roomVoid = vec3(0.011, 0.011, 0.015);
        
        gl_FragColor = vec4(roomVoid + blendedAura, 1.0);
    }
`;

export default function AutonomousAuraShader() {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const glContainer = canvasRef.current;
        if (!glContainer) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        // This shader performs several layered noise evaluations per pixel. Keep its drawing
        // buffer close to CSS resolution; 2x DPI multiplies fragment work by four.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.15));
        renderer.setSize(glContainer.clientWidth, glContainer.clientHeight);
        glContainer.appendChild(renderer.domElement);

        const uniforms = {
            u_resolution: { value: new THREE.Vector2(glContainer.clientWidth, glContainer.clientHeight) },
            u_time: { value: 0 }
        };

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            depthWrite: false,
            depthTest: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const handleResize = () => {
            if (!glContainer) return;
            const w = glContainer.clientWidth;
            const h = glContainer.clientHeight;
            renderer.setSize(w, h);
            uniforms.u_resolution.value.set(w, h);
        };

        window.addEventListener('resize', handleResize);

        const clock = new THREE.Clock();
        const hasLoader = Boolean(document.querySelector("[data-home-loader]"));
        let loaderRevealed = !hasLoader;
        let isInView = false;
        let homeIsActive = document.documentElement.dataset.rgbHomeActive !== "false";
        let pageIsVisible = document.visibilityState === "visible";
        let disposed = false;
        let shaderReady = false;
        let elapsed = 0;

        const stopLoop = () => {
            renderer.setAnimationLoop(null);
            clock.stop();
        };

        const syncLoop = () => {
            if (disposed || !shaderReady || !loaderRevealed || !isInView || !homeIsActive || !pageIsVisible) {
                stopLoop();
                return;
            }

            if (!clock.running) clock.start();
            renderer.setAnimationLoop(() => {
                elapsed += clock.getDelta();
                uniforms.u_time.value = elapsed;
                renderer.render(scene, camera);
            });
        };

        const handleHomeActive = (event: Event) => {
            const customEvent = event as CustomEvent<{ active: boolean }>;
            homeIsActive = Boolean(customEvent.detail?.active);
            syncLoop();
        };

        const handleVisibilityChange = () => {
            pageIsVisible = document.visibilityState === "visible";
            syncLoop();
        };

        const observer = new IntersectionObserver((entries) => {
            isInView = Boolean(entries[0]?.isIntersecting);
            syncLoop();
        }, { threshold: 0.01 });
        observer.observe(glContainer);

        window.addEventListener("rgb:home-active", handleHomeActive);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        const revealShader = async () => {
            loaderRevealed = true;
            try {
                await renderer.compileAsync(scene, camera);
            } catch (error) {
                console.warn("Aura shader precompile failed; falling back to normal rendering.", error);
            }
            if (disposed) return;
            shaderReady = true;
            syncLoop();
        };

        if (hasLoader) {
            window.addEventListener("home-loader:reveal", revealShader, { once: true });
        } else {
            requestAnimationFrame(revealShader);
        }

        return () => {
            disposed = true;
            window.removeEventListener('resize', handleResize);
            window.removeEventListener("home-loader:reveal", revealShader);
            window.removeEventListener("rgb:home-active", handleHomeActive);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            observer.disconnect();
            renderer.setAnimationLoop(null);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (glContainer && renderer.domElement) {
                glContainer.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={canvasRef} className="w-full h-screen overflow-hidden bg-[#030305]" />;
}