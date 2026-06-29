'use client'
import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;

    float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
            v += a * (sin(p.x) * cos(p.y));
            p = rot * p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float r = length(uv);
        float angle = atan(uv.y, uv.x);

        float speed = u_time * 0.4;
        vec2 uvR = vec2(angle * 3.0, log(r) - speed);
        vec2 uvG = vec2(angle * 3.0, log(r) - (speed * 1.03));
        vec2 uvB = vec2(angle * 3.0, log(r) - (speed * 0.97));

        float nR = fbm(uvR * 2.0) * 0.5 + 0.5;
        float nG = fbm(uvG * 2.0) * 0.5 + 0.5;
        float nB = fbm(uvB * 2.0) * 0.5 + 0.5;

        float centerMask = smoothstep(0.04, 0.25, r);
        float vignette = smoothstep(1.3, 0.4, r);

        vec3 aura = vec3(
            pow(nR, 2.5) * 1.3,
            pow(nG, 2.5) * 0.9,
            pow(nB, 2.5) * 1.6
        );

        aura += vec3(sin(u_time + angle) * 0.03, cos(u_time - angle) * 0.03, sin(u_time) * 0.03);
        vec3 finalColor = aura * centerMask * vignette * 0.22;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export const ProjectsBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

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
            gl.uniform1f(timeLocation, currentTime);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
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
            style={{ backgroundColor: '#09090b', zIndex: -1 }} 
        />
    );
};

export default ProjectsBackground;