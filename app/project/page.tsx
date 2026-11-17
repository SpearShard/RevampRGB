// "use client";

// import PB from "../components/bgwebglshaders/ProjectsBackground"

// import Image from "next/image";

// const categories = [
//   {
//     title: "Computational Design",
//     projects: [
//       {
//         title: "Orb[i]s",
//         image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
//       },
//       {
//         title: "Vaults of Sechselautenplatz",
//         image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
//       },
//     ],
//   },
//   {
//     title: "Material Experiments",
//     projects: [
//       {
//         title: "Take a Seat",
//         image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
//       },
//       {
//         title: "An Outdoor Swing",
//         image: "https://images.unsplash.com/photo-1494526585095-c41746248156",
//       },
//     ],
//   },
//   {
//     title: "Interiors",
//     projects: [
//       {
//         title: "Conference Room",
//         image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
//       },
//       {
//         title: "Dining Hall",
//         image: "https://images.unsplash.com/photo-1494526585095-c41746248156",
//       },
//       {
//         title: "Prestige Oakwood Kitchen",
//         image: "https://images.unsplash.com/photo-1494526585095-c41746248156",
//       },
//     ],
//   },
//   {
//     title: "Furniture Design",
//     projects: [
//       {
//         title: "Custom Shoe Stands",
//         image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
//       },
//       {
//         title: "Library at Head Start Educational Academy",
//         image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
//       },
//       {
//         title: "Circle Packing",
//         image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
//       },
//     ],
//   },
//   {
//     title: "Installation Design",
//     projects: [
//       {
//         title: "TETR.IS",
//         image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
//       },
//       {
//         title: "Susegad Cube - Serendipity Arts Festival 2024",
//         image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
//       },
//     ],
//   },
//   {
//     title: "Competitions",
//     projects: [
//       {
//         title: "Flames of Growth & Glory",
//         image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
//       },
//       {
//         title: "SEA Pavilion",
//         image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
//       },
//     ],
//   },
// ];

// export default function WorksGallery() {
//   return (
//     <main className=" text-white min-h-screen">
//       <PB/>
      
//       <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-24">
//         <div className="mb-24">
//           <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-4">
//             Selected Works
//           </p>

//           <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
//             Works
//           </h1>
//         </div>

//         {categories.map((category, categoryIndex) => (
//           <section
//             key={category.title}
//             className="mb-40"
//           >
//             <div className="flex items-center gap-4 mb-16">
//               <h2 className="text-lg font-medium">
//                 {category.title}
//               </h2>

//               <div className="h-px flex-1 bg-white/10" />

//               <span className="text-white/40 text-sm">
//                 {category.projects.length}
//               </span>
//             </div>

//             <div className="space-y-24">
//               {category.projects.map((project, projectIndex) => {
//                 const reversed =
//                   (projectIndex + categoryIndex) % 2 === 0;

//                 return (
//                   <div
//                     key={project.title}
//                     className={`grid md:grid-cols-12 gap-8 items-center ${
//                       reversed ? "" : "md:[&>*:first-child]:order-2"
//                     }`}
//                   >
//                     <div className="md:col-span-7">
//                       <div
//                         className="
//                         group
//                         relative
//                         overflow-hidden
//                         rounded-[28px]
//                         bg-white/5
//                       "
//                       >
//                         <div className="aspect-[16/10] relative">
//                           <Image
//                             src={project.image}
//                             alt={project.title}
//                             fill
//                             className="
//                               object-cover
//                               transition-transform
//                               duration-700
//                               group-hover:scale-105
//                             "
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="md:col-span-5">
//                       <div className="max-w-md">
//                         <p className="text-white/30 text-sm mb-4">
//                           0
//                           {projectIndex + 1}
//                         </p>

//                         <h3 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
//                           {project.title}
//                         </h3>

//                         <p className="text-white/50 leading-relaxed">
//                           Experimental exploration pushing
//                           the boundaries of design,
//                           fabrication and digital craft.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </section>
//         ))}
//       </div>
//     </main>
//   );
// }









"use client";

import React, { useEffect, useRef } from "react";
import projectsData from "../data/projects.json";
import { projectSlug } from "../utils/projectSlugs";
import Image from "next/image";
import Link from "next/link";

type Project = {
  title: string;
  subtitle?: string;
  dir: string;
  cover: string;
  description: string[];
};

type ProjectCategory = {
  title: string;
  projects: Project[];
};

const categories = Object.entries(projectsData)
  .flatMap(([slug, value]) => {
    const category = value as Partial<ProjectCategory>;

    if (!Array.isArray(category.projects) || typeof category.title !== "string") {
      return [];
    }

    return [
      {
        slug,
        title: category.title,
        projects: category.projects as Project[],
      },
    ];
  });

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
    uniform vec3 u_tint;

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
        
        vec3 finalColor = aura * centerMask * vignette * 0.22 * u_tint;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export default function WorksGallery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const targetTintRef = useRef<[number, number, number]>([1.0, 1.0, 1.0]);
  const currentTintRef = useRef<[number, number, number]>([1.0, 1.0, 1.0]);
  const isLockedRef = useRef<boolean>(false);

  useEffect(() => {
    isLockedRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, preserveDrawingBuffer: false });
    if (!gl) return;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

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
    const tintLocation = gl.getUniformLocation(program, 'u_tint');

    const resize = () => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      const currentTime = (performance.now() - startTime) * 0.001;

      // Smooth color interpolation (Lerp)
      currentTintRef.current[0] += (targetTintRef.current[0] - currentTintRef.current[0]) * 0.08;
      currentTintRef.current[1] += (targetTintRef.current[1] - currentTintRef.current[1]) * 0.08;
      currentTintRef.current[2] += (targetTintRef.current[2] - currentTintRef.current[2]) * 0.08;

      if (timeLocation) gl.uniform1f(timeLocation, currentTime);
      if (resolutionLocation) gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      if (tintLocation) {
        gl.uniform3f(
          tintLocation, 
          currentTintRef.current[0], 
          currentTintRef.current[1], 
          currentTintRef.current[2]
        );
      }

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

  const handleMouseEnterProject = (categoryIndex: number) => {
    if (isLockedRef.current) return;
    
    if (categoryIndex === 0 || categoryIndex === 1) {
      targetTintRef.current = [2.4, 0.4, 0.3]; // Red
    } else if (categoryIndex === 2 || categoryIndex === 3) {
      targetTintRef.current = [0.3, 2.2, 0.7]; // Green
    } else {
      targetTintRef.current = [0.3, 0.9, 2.5]; // Blue
    }
  };

  const handleMouseLeaveProject = () => {
    if (isLockedRef.current) return;
    targetTintRef.current = [1.0, 1.0, 1.0]; // Reset to balanced
  };

  const handleProjectClick = () => {
    isLockedRef.current = true;
  };

  return (
    <main className="text-white min-h-screen relative">
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none" 
        style={{ backgroundColor: '#09090b', zIndex: -1 }} 
      />
      
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-24 relative z-10">
        <div className="mb-24">
          <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-4">
            Selected Works
          </p>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
            Works
          </h1>
        </div>

        {categories.map((category, categoryIndex) => (
          <section
            key={category.title}
            className="mb-40"
          >
            <div className="flex items-center gap-4 mb-16">
              <h2 className="text-lg font-medium">
                {category.title}
              </h2>

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-white/40 text-sm">
                {category.projects.length}
              </span>
            </div>

            <div className="space-y-24">
              {category.projects.map((project, projectIndex) => {
                const reversed =
                  (projectIndex + categoryIndex) % 2 === 0;

                return (
                  <div
                    key={project.title}
                    className={`grid md:grid-cols-12 gap-8 items-center ${
                      reversed ? "" : "md:[&>*:first-child]:order-2"
                    }`}
                  >
                    <div className="md:col-span-7">
                      <Link 
                        href={`/project/${category.slug}/${projectSlug(project.dir)}`}
                        onMouseEnter={() => handleMouseEnterProject(categoryIndex)}
                        onMouseLeave={handleMouseLeaveProject}
                        onClick={handleProjectClick}
                        className="
                          group
                          relative
                          block
                          overflow-hidden
                          rounded-[28px]
                          bg-white/5
                        "
                      >
                        <div className="aspect-[16/10] relative">
                          <Image
                            src={project.cover}
                            alt={project.title}
                            fill
                            className="
                              object-cover
                              transition-transform
                              duration-700
                              group-hover:scale-105
                            "
                          />
                        </div>

                        {/* Dark backdrop overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Minimal center VIEW label appearing on hover */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="
                            bg-white text-black font-medium text-xs tracking-widest uppercase 
                            px-6 py-2.5 rounded-full shadow-xl
                            opacity-0 translate-y-2 
                            group-hover:opacity-100 group-hover:translate-y-0 
                            transition-all duration-300 ease-out
                          ">
                            View
                          </span>
                        </div>
                      </Link>
                    </div>

                    <div className="md:col-span-5">
                      <div className="max-w-md">
                        <p className="text-white/30 text-sm mb-4">
                          0
                          {projectIndex + 1}
                        </p>

                        <h3 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                          {project.title}
                        </h3>

                        <p className="text-white/50 leading-relaxed">
                          {project.subtitle || project.description[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}









// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import projectsData from "../data/projects.json";
// import { projectSlug } from "../utils/projectSlugs";
// import Image from "next/image";
// import Link from "next/link";
// import gsap from "gsap";

// type Project = {
//   title: string;
//   subtitle?: string;
//   dir: string;
//   cover: string;
//   description: string[];
// };

// type ProjectCategory = {
//   title: string;
//   projects: Project[];
// };

// const categories = Object.entries(projectsData)
//   .flatMap(([slug, value]) => {
//     const category = value as Partial<ProjectCategory>;
//     if (!Array.isArray(category.projects) || typeof category.title !== "string") {
//       return [];
//     }
//     return [
//       {
//         slug,
//         title: category.title,
//         projects: category.projects as Project[],
//       },
//     ];
//   });

// const allProjects = categories.flatMap((cat, catIdx) =>
//   cat.projects.map((proj, projIdx) => ({
//     ...proj,
//     categorySlug: cat.slug,
//     categoryTitle: cat.title,
//     globalIndex: String(projIdx + 1).padStart(2, "0"),
//     catIndex: catIdx,
//   }))
// );

// // UNTOUCHED ELITE FLUID NEBULA WEBGL SHADER & INTERACTION
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
//     uniform vec3 u_tint;
//     uniform vec2 u_mouse;
//     uniform float u_hoverFactor;

//     float fbm(vec2 p) {
//         float v = 0.0;
//         float a = 0.5;
//         vec2 shift = vec2(100.0);
//         mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
//         for (int i = 0; i < 5; ++i) {
//             v += a * (sin(p.x) * cos(p.y));
//             p = rot * p * 2.0 + shift;
//             a *= 0.5;
//         }
//         return v;
//     }

//     void main() {
//         vec2 fragCoord = gl_FragCoord.xy;
//         vec2 uv = (fragCoord - 0.5 * u_resolution.xy) / u_resolution.y;
//         vec2 mouseUV = (u_mouse - 0.5 * u_resolution.xy) / u_resolution.y;

//         vec2 displacement = uv - mouseUV;
//         float distToMouse = length(displacement);
//         vec2 warpedUV = uv - (displacement * smoothstep(1.3, 0.0, distToMouse) * u_hoverFactor * 0.55);

//         float r = length(warpedUV);
//         float angle = atan(warpedUV.y, warpedUV.x);

//         float speed = u_time * 0.3;
//         vec2 uvR = vec2(angle * 2.5, log(r + 0.02) - speed);
//         vec2 uvG = vec2(angle * 2.5, log(r + 0.02) - (speed * 1.03));
//         vec2 uvB = vec2(angle * 2.5, log(r + 0.02) - (speed * 0.97));

//         float nR = fbm(uvR * 2.0) * 0.5 + 0.5;
//         float nG = fbm(uvG * 2.0) * 0.5 + 0.5;
//         float nB = fbm(uvB * 2.0) * 0.5 + 0.5;

//         vec3 basePlasma = vec3(
//             sin(u_time * 0.4 + nR * 3.0) * 0.5 + 0.5,
//             cos(u_time * 0.3 + nG * 3.0) * 0.5 + 0.5,
//             sin(u_time * 0.5 + nB * 3.0) * 0.5 + 0.5
//         );

//         float bloom = smoothstep(0.9, 0.0, distToMouse) * u_hoverFactor;
//         float centerMask = smoothstep(0.01, 0.5, r);
//         float vignette = smoothstep(1.6, 0.2, r);

//         vec3 aura = vec3(
//             pow(nR, 2.2) * 1.5,
//             pow(nG, 2.2) * 1.1,
//             pow(nB, 2.2) * 1.9
//         );

//         aura += basePlasma * 0.3;
//         
//         float intensity = 0.22 + (bloom * 0.75);
//         vec3 finalColor = aura * centerMask * vignette * intensity * u_tint;

//         gl_FragColor = vec4(finalColor, 1.0);
//     }
// `;

// export default function WorksGallery() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const portalRef = useRef<HTMLDivElement>(null);
//   
//   const targetTintRef = useRef<[number, number, number]>([1.2, 1.0, 1.4]);
//   const currentTintRef = useRef<[number, number, number]>([1.2, 1.0, 1.4]);
//   
//   const currentMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
//   const hoverFactorRef = useRef<number>(0.2);
//   const targetHoverFactorRef = useRef<number>(0.2);

//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [hoveredProject, setHoveredProject] = useState<typeof allProjects[0] | null>(null);

//   // Mouse & Floating Portal Tracking with GSAP Inertia
//   useEffect(() => {
//     const onMouseMove = (e: MouseEvent) => {
//       // Float Portal tracking
//       if (portalRef.current) {
//         gsap.to(portalRef.current, {
//           x: e.clientX + 30,
//           y: e.clientY - 180,
//           duration: 0.4,
//           ease: "power3.out",
//         });
//       }

//       // WebGL Shader Mouse tracking (Untouched)
//       if (!canvasRef.current) return;
//       const rect = canvasRef.current.getBoundingClientRect();
//       const glX = e.clientX - rect.left;
//       const glY = rect.height - (e.clientY - rect.top);
//       (window as any).__glMouse = { x: glX, y: glY };
//     };

//     window.addEventListener("mousemove", onMouseMove);
//     return () => window.removeEventListener("mousemove", onMouseMove);
//   }, []);

//   // WebGL Render Loop (Untouched)
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const gl = canvas.getContext('webgl', { alpha: false, preserveDrawingBuffer: false });
//     if (!gl) return;

//     const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
//       const shader = gl.createShader(type);
//       if (!shader) return null;
//       gl.shaderSource(shader, source);
//       gl.compileShader(shader);
//       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//         gl.deleteShader(shader);
//         return null;
//       }
//       return shader;
//     };

//     const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
//     const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
//     const program = gl.createProgram();
//     if (!vs || !fs || !program) return;

//     gl.attachShader(program, vs);
//     gl.attachShader(program, fs);
//     gl.linkProgram(program);

//     const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
//     const buffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//     const positionLocation = gl.getAttribLocation(program, 'position');
//     gl.enableVertexAttribArray(positionLocation);
//     gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

//     gl.useProgram(program);
//     const timeLocation = gl.getUniformLocation(program, 'u_time');
//     const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
//     const tintLocation = gl.getUniformLocation(program, 'u_tint');
//     const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
//     const hoverFactorLocation = gl.getUniformLocation(program, 'u_hoverFactor');

//     const resize = () => {
//       const displayWidth = window.innerWidth;
//       const displayHeight = window.innerHeight;
//       if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
//         canvas.width = displayWidth;
//         canvas.height = displayHeight;
//         gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//       }
//     };
//     window.addEventListener('resize', resize);
//     resize();

//     let animationFrameId: number;
//     const startTime = performance.now();

//     const render = () => {
//       const currentTime = (performance.now() - startTime) * 0.001;

//       const glMouse = (window as any).__glMouse || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
//       currentMouseRef.current.x += (glMouse.x - currentMouseRef.current.x) * 0.1;
//       currentMouseRef.current.y += (glMouse.y - currentMouseRef.current.y) * 0.1;

//       hoverFactorRef.current += (targetHoverFactorRef.current - hoverFactorRef.current) * 0.1;

//       currentTintRef.current[0] += (targetTintRef.current[0] - currentTintRef.current[0]) * 0.08;
//       currentTintRef.current[1] += (targetTintRef.current[1] - currentTintRef.current[1]) * 0.08;
//       currentTintRef.current[2] += (targetTintRef.current[2] - currentTintRef.current[2]) * 0.08;

//       if (timeLocation) gl.uniform1f(timeLocation, currentTime);
//       if (resolutionLocation) gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
//       if (mouseLocation) gl.uniform2f(mouseLocation, currentMouseRef.current.x, currentMouseRef.current.y);
//       if (hoverFactorLocation) gl.uniform1f(hoverFactorLocation, hoverFactorRef.current);
//       if (tintLocation) {
//         gl.uniform3f(tintLocation, currentTintRef.current[0], currentTintRef.current[1], currentTintRef.current[2]);
//       }

//       gl.clear(gl.COLOR_BUFFER_BIT);
//       gl.drawArrays(gl.TRIANGLES, 0, 6);
//       animationFrameId = requestAnimationFrame(render);
//     };
//     render();

//     return () => {
//       cancelAnimationFrame(animationFrameId);
//       window.removeEventListener('resize', resize);
//       gl.deleteBuffer(buffer);
//       gl.deleteProgram(program);
//     };
//   }, []);

//   const handleMouseEnterProject = (project: typeof allProjects[0]) => {
//     setHoveredProject(project);
//     targetHoverFactorRef.current = 1.0;

//     if (project.catIndex === 0) {
//       targetTintRef.current = [4.5, 0.5, 0.4];
//     } else if (project.catIndex === 1) {
//       targetTintRef.current = [0.4, 4.0, 2.5];
//     } else if (project.catIndex === 2) {
//       targetTintRef.current = [0.5, 1.8, 5.0];
//     } else if (project.catIndex === 3) {
//       targetTintRef.current = [4.0, 2.8, 0.4];
//     } else {
//       targetTintRef.current = [3.5, 0.6, 4.5];
//     }
//   };

//   const handleMouseLeaveProject = () => {
//     setHoveredProject(null);
//     targetHoverFactorRef.current = 0.2;
//     targetTintRef.current = [1.2, 1.0, 1.4];
//   };

//   const filteredProjects = selectedCategory === "all" 
//     ? allProjects 
//     : allProjects.filter(p => p.categorySlug === selectedCategory);

//   return (
//     <main className="text-white min-h-screen w-full relative font-sans selection:bg-white selection:text-black overflow-x-hidden cursor-default flex flex-col justify-between">
//       {/* BREATHING, COLOR-SHIFTING WEBGL BACKGROUND SHADER (UNTOUCHED) */}
//       <canvas 
//         ref={canvasRef} 
//         className="fixed inset-0 w-full h-full pointer-events-none" 
//         style={{ backgroundColor: '#030305', zIndex: -1 }} 
//       />

//       {/* NOISE TEXTURE OVERLAY */}
//       <div 
//         className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
//         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, zIndex: 0 }}
//       />

//       {/* FLOATING CURSOR-FOLLOWING PREVIEW PORTAL (DESKTOP) */}
//       <div 
//         ref={portalRef}
//         className={`fixed top-0 left-0 pointer-events-none z-50 w-72 h-44 rounded-2xl overflow-hidden border border-white/30 bg-zinc-950/90 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-opacity duration-300 hidden lg:block ${
//           hoveredProject ? "opacity-100 scale-100" : "opacity-0 scale-90"
//         }`}
//       >
//         {hoveredProject && (
//           <div className="relative w-full h-full">
//             <Image
//               src={hoveredProject.cover}
//               alt={hoveredProject.title}
//               fill
//               className="object-cover opacity-90"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
//             <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
//               <span className="font-mono text-[10px] tracking-widest text-emerald-400 uppercase">
//                 {hoveredProject.categoryTitle}
//               </span>
//               <span className="font-mono text-[10px] tracking-widest text-white/70">
//                 [{hoveredProject.globalIndex}]
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ARCHITECTURAL HEADER */}
//       <header className="w-full px-8 md:px-24 py-10 flex items-center justify-between border-b border-white/10 z-30 backdrop-blur-2xl bg-black/40 sticky top-0">
//         <div className="flex items-center gap-4">
//           <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_20px_#34d399]" />
//           <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-white/80">
//             G. Jayaditya / Magnetic Portal Index 2026
//           </span>
//         </div>

//         <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest text-white/50">
//           <span className="text-white font-medium">INDEX ({allProjects.length})</span>
//           <span>•</span>
//           <span className="text-emerald-400">CURSOR HOVER SPOTLIGHT</span>
//         </div>
//       </header>

//       {/* HERO & CATEGORY BAR */}
//       <section className="w-full px-8 md:px-24 pt-20 pb-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10">
//         <div>
//           <div className="flex items-center gap-3 mb-4">
//             <span className="h-[1px] w-10 bg-emerald-400" />
//             <span className="font-mono text-xs tracking-[0.4em] uppercase text-emerald-400">
//               Interactive Typography Index
//             </span>
//           </div>
//           <h1 className="text-6xl md:text-8xl font-light tracking-tight font-serif italic text-white/95">
//             Curated <span className="not-italic font-sans font-extralight text-white/40">Works</span>.
//           </h1>
//         </div>

//         {/* CATEGORY FILTER PILLS */}
//         <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
//           <button
//             onClick={() => setSelectedCategory("all")}
//             className={`px-6 py-3 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300 border backdrop-blur-md whitespace-nowrap ${
//               selectedCategory === "all" 
//                 ? "bg-white text-black border-white font-bold shadow-[0_0_35px_rgba(255,255,255,0.4)]" 
//                 : "bg-white/5 text-white/70 border-white/15 hover:border-white/40 hover:text-white"
//             }`}
//           >
//             All ({allProjects.length})
//           </button>
//           {categories.map((cat) => (
//             <button
//               key={cat.slug}
//               onClick={() => setSelectedCategory(cat.slug)}
//               className={`px-6 py-3 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300 whitespace-nowrap border backdrop-blur-md ${
//                 selectedCategory === cat.slug 
//                   ? "bg-white text-black border-white font-bold shadow-[0_0_35px_rgba(255,255,255,0.4)]" 
//                   : "bg-white/5 text-white/70 border-white/15 hover:border-white/40 hover:text-white"
//               }`}
//             >
//               {cat.title} ({cat.projects.length})
//             </button>
//           ))}
//         </div>
//       </section>

//       {/* MAGNETIC TYPOGRAPHIC INDEX TABLE */}
//       <section className="w-full px-8 md:px-24 py-16 z-20">
//         <div className="w-full border-t border-white/15 divide-y divide-white/15">
//           {filteredProjects.map((project) => {
//             const isSelected = hoveredProject?.title === project.title;

//             return (
//               <Link
//                 key={project.title}
//                 href={`/project/${project.categorySlug}/${projectSlug(project.dir)}`}
//                 onMouseEnter={() => handleMouseEnterProject(project)}
//                 onMouseLeave={handleMouseLeaveProject}
//                 className={`group relative py-10 px-8 transition-all duration-500 flex items-center justify-between ${
//                   isSelected ? "bg-white/[0.06] pl-14 border-l-4 border-emerald-400 shadow-[inset_40px_0_100px_rgba(255,255,255,0.03)]" : "hover:bg-white/[0.02]"
//                 }`}
//               >
//                 <div className="flex items-center gap-10 md:gap-16">
//                   <span className="font-mono text-sm text-white/30 tracking-widest group-hover:text-emerald-400 transition-colors">
//                     [{project.globalIndex}]
//                   </span>
//                   <div>
//                     <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-emerald-400/80 block mb-2">
//                       {project.categoryTitle}
//                     </span>
//                     <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white group-hover:translate-x-4 transition-transform duration-500 font-serif italic group-hover:not-italic">
//                       {project.title}
//                     </h2>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-6">
//                   <span className="hidden md:block font-mono text-xs text-white/40 max-w-xs truncate">
//                     {project.subtitle || project.description[0]}
//                   </span>
//                   <div className={`w-14 h-14 rounded-full border border-white/25 flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
//                     isSelected ? "bg-white text-black rotate-45 scale-110 shadow-[0_0_35px_rgba(255,255,255,0.8)]" : "group-hover:bg-white group-hover:text-black group-hover:rotate-45"
//                   }`}>
//                     <span className="text-lg">↗</span>
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="w-full px-8 md:px-24 py-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-white/50 z-30 bg-black/80 backdrop-blur-2xl">
//         <p>© 2026 G. Jayaditya. All Rights Reserved.</p>
//         <div className="flex items-center gap-6 mt-3 md:mt-0">
//           <span className="tracking-[0.3em] uppercase">Magnetic Portal Index & Fluid Nebula Shader</span>
//           <span>•</span>
//           <span className="text-white font-semibold">Awwwards SOTD Standard</span>
//         </div>
//       </footer>
//     </main>
//   );
// }