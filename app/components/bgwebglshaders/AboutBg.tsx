"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  // Analytical random scalar field
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Vector stream generation loops
  float getStreams(vec2 p, float time, vec2 mouse) {
    vec2 grid = fract(p * 18.0) - 0.5;
    vec2 id = floor(p * 18.0);
    
    float h = hash(id);
    
    // Calculate vector forces relative to cursor anchor point
    vec2 mouseForce = mouse - (id / 18.0);
    float mouseDist = length(mouseForce);
    
    // Twist flow angle using time parameters and gravitational distortion
    float angle = h * 6.2831 + time * 0.4;
    angle += (1.0 / (mouseDist + 0.15)) * 0.6; 
    
    // Map vector directional paths
    vec2 dir = vec2(cos(angle), sin(angle));
    
    // Project crisp structural tracking segments
    float segment = abs(dot(grid, vec2(-dir.y, dir.x)));
    float lengthConstraint = smoothstep(0.45, 0.0, abs(dot(grid, dir) - sin(time * 1.5 + h * 6.2831) * 0.3));
    
    // Filter vector line weight metrics
    float line = smoothstep(0.04, 0.005, segment) * lengthConstraint;
    
    // Amplify energy metrics near mass focus points
    line *= mix(0.3, 1.2, smoothstep(0.6, 0.0, mouseDist));
    
    return line;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect_uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

    // Route tracking coordinate matrices
    vec2 m = (u_mouse - 0.5) * (u_resolution.xy / u_resolution.y);

    // Layer multiple frequencies of vector tracks to generate structural background parallax depth
    float fields = getStreams(aspect_uv * 1.0, u_time, m);
    fields += getStreams(aspect_uv * 1.4 + vec2(10.0), u_time * 0.8, m) * 0.4;
    fields += getStreams(aspect_uv * 0.7 - vec2(5.0), u_time * 1.2, m) * 0.2;

    // Pure obsidian baseline slate
    vec3 base_color = vec3(0.012, 0.012, 0.015);
    
    // Low-luminance technical blue-grey matrix tint
    vec3 vector_glow = vec3(0.15, 0.20, 0.28) * fields;
    
    // Add sharp, absolute-white micro-nodes for high-contrast tracking sparks
    vec3 particle_sparks = vec3(0.8, 0.85, 0.95) * smoothstep(0.85, 1.0, fields) * 0.5;

    vec3 final_matrix = base_color + vector_glow + particle_sparks;

    // Peripheral screen vignette clamp to secure code/text contrast layers over top
    final_matrix *= 1.0 - dot(aspect_uv, aspect_uv) * 0.3;

    gl_FragColor = vec4(clamp(final_matrix, 0.0, 1.0), 1.0);
  }
`;

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export default function WebGLVectorFieldCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const uniforms = {
      u_time: { value: 1.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const currentMouse = new THREE.Vector2(0.5, 0.5);

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth kinematic coordinate interpolation tracking loop
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;
      uniforms.u_mouse.value.copy(currentMouse);

      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-screen h-screen z-0 bg-[#030304]" />;
}