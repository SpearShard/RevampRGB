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