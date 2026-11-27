'use client';

import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 1.95 + vec2(15.3, 29.7);
      a *= 0.5;
    }
    return v;
  }

  // Smooth domain-warped glass silk field
  float silkField(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.08),
      fbm(p + vec2(4.2, 1.7) - t * 0.06)
    );
    vec2 r = vec2(
      fbm(p + 1.65 * q + vec2(2.1, 7.4) + t * 0.05),
      fbm(p + 1.65 * q + vec2(6.8, 3.1) - t * 0.04)
    );
    return fbm(p + 1.5 * r);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    float t = u_time * 0.32;

    // Gentle cursor refraction (subtle liquid glass bend without aggressive warping)
    vec2 toMouse = p - u_mouse;
    float dist = length(toMouse);
    float lens = exp(-dist * 2.1);
    vec2 warpedP = p * 1.15 - normalize(toMouse + 1e-4) * lens * 0.11;

    // Refined chromatic dispersion split
    vec2 disp = normalize(toMouse + vec2(0.4, -0.3)) * (0.014 + lens * 0.024);

    float fR = silkField(warpedP + disp, t);
    float fG = silkField(warpedP, t + 0.03);
    float fB = silkField(warpedP - disp, t + 0.06);

    // Broad, velvety refractive fold highlights (soft pow 2.6 instead of harsh pow 7.0)
    float foldR = pow(0.5 + 0.5 * sin(fR * 6.2 - t * 0.35), 2.8);
    float foldG = pow(0.5 + 0.5 * sin(fG * 6.2 - t * 0.35), 2.8);
    float foldB = pow(0.5 + 0.5 * sin(fB * 6.2 - t * 0.35), 2.8);

    // Deep obsidian base
    vec3 base = vec3(0.018, 0.019, 0.025);

    // Rich, moody RGB glass aura
    vec3 aura = vec3(
      smoothstep(0.28, 0.85, fR) * 0.16,
      smoothstep(0.32, 0.85, fG) * 0.12,
      smoothstep(0.26, 0.85, fB) * 0.22
    );

    // Soft iridescent silk ribbons (present and dimensional, never harsh)
    vec3 ribbons = vec3(
      foldR * 0.24,
      foldG * 0.20,
      foldB * 0.30
    ) * (0.55 + lens * 0.45);

    // Subtle cursor specular sheen
    float cursorGlow = exp(-dist * 3.0) * 0.08;
    vec3 specular = vec3(cursorGlow * 0.9, cursorGlow * 0.95, cursorGlow * 1.15);

    // Fine optical grain to keep dark gradients silky
    float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.008;

    vec3 color = base + aura + ribbons + specular + grain;

    // Gentle peripheral vignette + subtle center contrast buffer for typography
    float edgeVignette = smoothstep(1.38, 0.22, length(uv - 0.5));
    float textReadabilityZone = mix(0.78, 1.0, smoothstep(0.0, 0.65, length(p * vec2(0.75, 1.15))));
    color *= mix(0.5, 1.0, edgeVignette) * textReadabilityZone;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

interface ShaderProps {
  contained?: boolean;
}

export default function RgbAuraBackground({ contained = false }: ShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetMouse = useRef({ x: 100, y: 100 });
  const currentMouse = useRef({ x: 100, y: 100 });

  // Track the pointer without routing every mouse movement through React state.
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const bounds = canvas.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;

      if (!inside) {
        targetMouse.current = { x: 100, y: 100 };
        return;
      }

      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const aspect = width / height;
      targetMouse.current = {
        x: ((event.clientX - bounds.left) / width - 0.5) * aspect,
        y: -((event.clientY - bounds.top) / height - 0.5),
      };
    };

    const resetPointer = () => {
      targetMouse.current = { x: 100, y: 100 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetPointer);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', resetPointer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
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
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = contained ? canvas.parentElement?.getBoundingClientRect() : null;
      const width = contained && bounds ? bounds.width : window.innerWidth;

      // The directory expands/collapses as categories change. Resizing a
      // WebGL drawing buffer clears it, which looked like a shader flash on
      // every hover. Keep the contained shader buffer at a stable max height
      // and let CSS crop/stretch it inside the directory.
      const height = contained
        ? Math.max(bounds?.height ?? 0, window.innerHeight - 32)
        : window.innerHeight;
      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };
    window.addEventListener('resize', resize);
    const resizeObserver = contained && canvas.parentElement ? new ResizeObserver(resize) : null;
    if (resizeObserver && canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    resize();

    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      const currentTime = (performance.now() - startTime) * 0.001;
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.022;
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.055;

      gl.uniform1f(timeLocation, currentTime);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, currentMouse.current.x, currentMouse.current.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      resizeObserver?.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [contained]);

  return (
    <canvas
      ref={canvasRef}
      className={contained ? "absolute inset-0 w-full h-full pointer-events-none" : "fixed inset-0 w-full h-full pointer-events-none z-0"}
      style={{ backgroundColor: '#050507' }}
    />
  );
}
