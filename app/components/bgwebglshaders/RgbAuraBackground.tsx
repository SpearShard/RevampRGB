'use client'

// import React, { useEffect, useRef } from 'react';

// const vertexShaderSource = `
//     attribute vec2 position;
//     void main() {
//         gl_Position = vec4(position, 0.0, 1.0);
//     }
// `;

// const fragmentShaderSource = `
//     precision mediump float;
//     uniform float u_time;
//     uniform vec2 u_resolution;

//     float fbm(vec2 p) {
//         float v = 0.0;
//         float a = 0.5;
//         vec2 shift = vec2(100.0);
//         mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
//         for (int i = 0; i < 4; ++i) {
//             v += a * (sin(p.x) * cos(p.y));
//             p = rot * p * 2.0 + shift;
//             a *= 0.5;
//         }
//         return v;
//     }

//     void main() {
//         vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
//         float r = length(uv);
//         float angle = atan(uv.y, uv.x);

//         float speed = u_time * 0.4;
//         vec2 uvR = vec2(angle * 3.0, log(r) - speed);
//         vec2 uvG = vec2(angle * 3.0, log(r) - (speed * 1.03));
//         vec2 uvB = vec2(angle * 3.0, log(r) - (speed * 0.97));

//         float nR = fbm(uvR * 2.0) * 0.5 + 0.5;
//         float nG = fbm(uvG * 2.0) * 0.5 + 0.5;
//         float nB = fbm(uvB * 2.0) * 0.5 + 0.5;

//         float centerMask = smoothstep(0.04, 0.25, r);
//         float vignette = smoothstep(1.3, 0.4, r);

//         vec3 aura = vec3(
//             pow(nR, 2.5) * 1.3,
//             pow(nG, 2.5) * 0.9,
//             pow(nB, 2.5) * 1.6
//         );

//         aura += vec3(sin(u_time + angle) * 0.03, cos(u_time - angle) * 0.03, sin(u_time) * 0.03);
//         vec3 finalColor = aura * centerMask * vignette * 0.22;

//         gl_FragColor = vec4(finalColor, 1.0);
//     }
// `;

// export const RgbAuraBackground = () => {
//     const canvasRef = useRef<HTMLCanvasElement>(null);

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//         const gl = canvas.getContext('webgl');
//         if (!gl) return;

//         const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
//             const shader = gl.createShader(type);
//             if (!shader) return null;
//             gl.shaderSource(shader, source);
//             gl.compileShader(shader);
//             return shader;
//         };

//         const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
//         const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
//         const program = gl.createProgram();
//         if (!vs || !fs || !program) return;

//         gl.attachShader(program, vs);
//         gl.attachShader(program, fs);
//         gl.linkProgram(program);

//         const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
//         const buffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//         gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//         const positionLocation = gl.getAttribLocation(program, 'position');
//         gl.enableVertexAttribArray(positionLocation);
//         gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

//         gl.useProgram(program);
//         const timeLocation = gl.getUniformLocation(program, 'u_time');
//         const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

//         const resize = () => {
//             canvas.width = window.innerWidth * window.devicePixelRatio;
//             canvas.height = window.innerHeight * window.devicePixelRatio;
//             gl.viewport(0, 0, canvas.width, canvas.height);
//         };
//         window.addEventListener('resize', resize);
//         resize();

//         let animationFrameId: number;
//         const startTime = performance.now();

//         const render = () => {
//             const currentTime = (performance.now() - startTime) * 0.001;
//             gl.uniform1f(timeLocation, currentTime);
//             gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
//             gl.clear(gl.COLOR_BUFFER_BIT);
//             gl.drawArrays(gl.TRIANGLES, 0, 6);
//             animationFrameId = requestAnimationFrame(render);
//         };
//         render();

//         return () => {
//             cancelAnimationFrame(animationFrameId);
//             window.removeEventListener('resize', resize);
//             gl.deleteBuffer(buffer);
//             gl.deleteProgram(program);
//             gl.deleteShader(vs);
//             gl.deleteShader(fs);
//         };
//     }, []);

//     return (
//         <canvas 
//             ref={canvasRef} 
//             className="fixed inset-0 w-full h-full pointer-events-none" 
//             style={{ backgroundColor: '#09090b', zIndex: -1 }} 
//         />
//     );
// };











import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision highp float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec3 u = vec3(f * f * (3.0 - 2.0 * f), 1.0);

        return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), 
                       dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), 
                       dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 4; ++i) {
            v += a * noise(p);
            p = rot * p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

        p *= 2.5;

        float distToMouse = length(p - u_mouse);
        p -= (u_mouse * 0.15) / (distToMouse * 0.8 + 1.0);

        // --- DOMAIN WARPING LAYER SEPARATIONS ---
        vec2 q = vec2(
            fbm(p + vec2(0.0, 0.0) + u_time * 0.05),
            fbm(p + vec2(5.2, 1.3) + u_time * 0.03)
        );

        vec2 r = vec2(
            fbm(p + 4.0 * q + vec2(1.7, 9.2) + u_time * 0.02),
            fbm(p + 4.0 * q + vec2(8.3, 2.8) + u_time * 0.04)
        );

        float f = fbm(p + 4.0 * r);

        // --- STARK MULTI-CHROMATIC PALETTE ---
        vec3 baseColor = vec3(0.01, 0.01, 0.02); 
        
        // Highly curated design tones to protect visual hierarchy
        vec3 luxuryRed = vec3(0.26, 0.03, 0.05);   // Deep Crimson Oxide
        vec3 luxuryGreen = vec3(0.02, 0.22, 0.10); // Raw Malachite / Emerald
        vec3 luxuryBlue = vec3(0.03, 0.06, 0.20);  // Deep Cobalt Shadow

        // Weaving the colors through completely independent distortion maps
        // Blue forms the underlying current, Red claims horizontal warps, Green controls depth thresholds
        vec3 fluidColor = mix(luxuryBlue, luxuryRed, clamp(r.x * 2.2, 0.0, 1.0));
        fluidColor = mix(fluidColor, luxuryGreen, clamp(q.y * 1.8, 0.0, 1.0));

        // Let the red emerge slightly as a shifting glowing ribbon on extreme noise peaks
        fluidColor += luxuryRed * (f * f * 0.25);

        // High-fidelity chrome reflection highlights
        float specular = pow(clamp(f, 0.0, 1.0), 4.0) * 0.32;
        specular += pow(clamp(r.x, 0.0, 1.0), 3.0) * 0.12;

        vec3 finalColor = mix(baseColor, fluidColor, f * 1.6);
        finalColor += vec3(specular); 

        // Smooth cinematic background vignette
        float vignette = smoothstep(1.4, 0.4, length(uv - 0.5));
        finalColor *= mix(0.12, 1.0, vignette);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

interface ShaderProps {
    mousePos: { x: number; y: number };
}

export default function IridescentFluidBackground({ mousePos }: ShaderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const mouseUniformRef = useRef<WebGLUniformLocation | null>(null);
    const targetMouse = useRef({ x: 0, y: 0 });
    const currentMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const aspect = window.innerWidth / window.innerHeight;
        const mappedX = ((mousePos.x / window.innerWidth) * 2.0 - 1.0) * aspect * 1.25;
        const mappedY = ((mousePos.y / window.innerHeight) * -2.0 + 1.0) * 1.25;
        
        targetMouse.current = { x: mappedX, y: mappedY };
    }, [mousePos]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;
        glRef.current = gl;

        const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = gl.createProgram();
        if (!vs || !fs || !program) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(program);
        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        mouseUniformRef.current = gl.getUniformLocation(program, 'u_mouse');

        const resize = () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resize();

        let animationFrameId: number;
        const startTime = performance.now();

        const render = () => {
            const currentTime = (performance.now() - startTime) * 0.001;
            
            currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.06;
            currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.06;

            gl.uniform1f(timeLocation, currentTime);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform2f(mouseUniformRef.current, currentMouse.current.x, currentMouse.current.y);
            
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 w-full h-full pointer-events-none" 
            style={{ backgroundColor: '#010103', zIndex: -1 }} 
        />
    );
}