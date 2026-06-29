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

import PB from "../components/bgwebglshaders/ProjectsBackground";
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

export default function WorksGallery() {
  return (
    <main className=" text-white min-h-screen">
      <PB/>
      
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-24">
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
