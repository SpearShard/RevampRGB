// import { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import {SDFGeometryGenerator} from './SDFGeometryGenerator';
// import {
//     OrthographicCamera,
//     Scene,
//     Clock,
//     WebGLRenderer,
//     Mesh,
//     MeshBasicMaterial,
//     MeshDepthMaterial,
//     MeshNormalMaterial,
//     Color
// } from 'three';
// import Stats from 'three/examples/jsm/libs/stats.module';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// import gsap from 'gsap';

// export default function SDFAnimation(props) {
//     const [isMobile, setIsMobile] = useState(false);
//     const containerRef = useRef(null);

//     // Check if mobile on client side
//     useEffect(() => {
//         setIsMobile(window.innerWidth <= 480);

//         const handleResize = () => {
//             setIsMobile(window.innerWidth <= 480);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     let renderer, stats, meshFromSDF, scene, camera, clock, controls;

//     const settings = {
//         res: 3,
//         bounds: 1,
//         autoRotate: true,
//         wireframe: true,
//         material: 'normal',
//         vertexCount: '0'
//     };

//     const shader = /* glsl */`
//         float dist(vec3 p) {
//             p.xyz = p.xzy;
//             p *= 1.2;
//             vec3 z = p;
//             vec3 dz=vec3(0.0);
//             float power = 8.0;
//             float r, theta, phi;
//             float dr = 1.0;

//             float t0 = 1.0;
//             for(int i = 0; i < 7; ++i) {
//                 r = length(z);
//                 if(r > 2.0) continue;
//                 theta = atan(z.y / z.x);
//                 #ifdef phase_shift_on
//                 phi = asin(z.z / r) ;
//                 #else
//                 phi = asin(z.z / r);
//                 #endif

//                 dr = pow(r, power - 1.0) * dr * power + 1.0;

//                 r = pow(r, power);
//                 theta = theta * power;
//                 phi = phi * power;

//                 z = r * vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi)) + p;

//                 t0 = min(t0, r);
//             }

//             return 0.5 * log(r) * r / dr;
//         }
//     `;

//     useEffect(() => {
//         init();
//         // animate() is now called by the renderer's animation loop

//         // Clean up function
//         return () => {
//             if (renderer) {
//                 renderer.setAnimationLoop(null); // Stop the animation loop
//                 renderer.dispose(); // Dispose of the renderer
//             }

//             if (meshFromSDF) {
//                 if (meshFromSDF.geometry) meshFromSDF.geometry.dispose();
//                 if (meshFromSDF.material) meshFromSDF.material.dispose();
//             }

//             if (scene) {
//                 scene.clear(); // Clear all objects from the scene
//             }
//         };
//     }, [])

//     function init() {
//         const w = window.innerWidth;
//         const h = window.innerHeight;

//         camera = new OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 0.01, 1600 )
//         camera.position.z = 1100;

//         scene = new Scene();
//         scene.background = new Color('#000');
//         clock = new Clock();

//         renderer = new WebGLRenderer({
//             antialias: true,
//             powerPreference: 'high-performance',
//             alpha: true
//         });

//         // Use a lower pixel ratio during scrolling for better performance
//         const pixelRatio = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance
//         renderer.setPixelRatio(pixelRatio);
//         renderer.setSize(window.innerWidth, window.innerHeight);

//         // Enable optimizations
//         renderer.setAnimationLoop(animate); // More efficient than requestAnimationFrame

//         // Add the canvas to the DOM
//         if (containerRef.current) {
//             containerRef.current.appendChild(renderer.domElement);

//             // Add hardware acceleration styles to the canvas
//             const canvas = renderer.domElement;
//             canvas.style.willChange = 'transform';
//             canvas.style.transform = 'translateZ(0)';
//             canvas.style.backfaceVisibility = 'hidden';
//         }

//         controls = new OrbitControls( camera, renderer.domElement );
//         controls.enableDamping = true;
//         controls.enableZoom = false;
//         controls.enablePan = false;
//         controls.enableRotate = true;
//         controls.rotateSpeed = 0.5; // Make rotation more sensitive

//         // Don't add any event listeners that might interfere with touch/mouse events

//         window.addEventListener( 'resize', onWindowResize );

//         compile();
//     }

//     function compile() {
//         const generator = new SDFGeometryGenerator( renderer );
//         const geometry = generator.generate( Math.pow( 2, settings.res + 2 ), shader, settings.bounds );
//         geometry.computeVertexNormals();

//         if ( meshFromSDF ) { // updates mesh
//             meshFromSDF.geometry.dispose();
//             meshFromSDF.geometry = geometry;
//         } else { // inits meshFromSDF : THREE.Mesh
//             meshFromSDF = new Mesh(geometry, new MeshBasicMaterial());
//             scene.add(meshFromSDF);

//             const scale = Math.min( window.innerWidth, window.innerHeight ) / 2 * 1.06;
//             meshFromSDF.scale.set( scale, scale, scale );

//             setMaterial();

//             // if (window.innerWidth <= 480) {
//             //     meshFromSDF.position.y += 5.5;
//             // }

//             // Apply GSAP animation for zoom-in and slight rotation
//             gsap.from(meshFromSDF.scale, { duration: 1.5, x: 0.1, y: 0.1, z: 0.1, ease: "power2.out" });
//             gsap.from(meshFromSDF.rotation, { duration: 1.5, y: Math.PI * 2, ease: "power2.out" });
//         }
//         settings.vertexCount = geometry.attributes.position.count;
//     }

//     function setMaterial() {
//         meshFromSDF.material.dispose();

//         if ( settings.material == 'depth' ) {
//             meshFromSDF.material = new MeshDepthMaterial();
//         } else if ( settings.material == 'normal' ) {
//             meshFromSDF.material = new MeshNormalMaterial();
//         }

//         meshFromSDF.material.wireframe = settings.wireframe;
//     }

//     function onWindowResize() {
//         const w = window.innerWidth;
//         const h = window.innerHeight;

//         renderer.setSize( w, h );

//         camera.left = w / - 2;
//         camera.right = w / 2;
//         camera.top = h / 2;
//         camera.bottom = h / - 2;

//         camera.updateProjectionMatrix();

//         if (meshFromSDF) {
//             const scale = Math.min(w, h) / 2 * 1.06;
//             meshFromSDF.scale.set(scale, scale, scale);
//         }
//     }

//     function render() {
//         renderer.render( scene, camera );
//     }

//     // Track if the page is being scrolled
//     const [isScrolling, setIsScrolling] = useState(false);
//     const scrollTimeout = useRef(null);

//     // Add scroll detection
//     useEffect(() => {
//         const handleScroll = () => {
//             setIsScrolling(true);

//             // Clear previous timeout
//             if (scrollTimeout.current) {
//                 clearTimeout(scrollTimeout.current);
//             }

//             // Set a timeout to detect when scrolling stops
//             scrollTimeout.current = setTimeout(() => {
//                 setIsScrolling(false);
//             }, 100);
//         };

//         window.addEventListener('scroll', handleScroll, { passive: true });
//         return () => {
//             window.removeEventListener('scroll', handleScroll);
//             if (scrollTimeout.current) {
//                 clearTimeout(scrollTimeout.current);
//             }
//         };
//     }, []);

//     function animate() {
//         // No need for requestAnimationFrame as we're using setAnimationLoop

//         controls.update();

//         // Reduce animation complexity during scrolling
//         if (settings.autoRotate && meshFromSDF) {
//             // If scrolling, use a smaller rotation increment
//             const rotationSpeed = isScrolling ? Math.PI * 0.01 : Math.PI * 0.05;
//             meshFromSDF.rotation.y += rotationSpeed * clock.getDelta();
//         }

//         render();
//     }

//     return (
//         <div style={{
//             position: 'absolute',
//             width: '100%',
//             height: '100%',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             willChange: 'transform', // Hint to browser to optimize
//             transform: 'translateZ(0)', // Force GPU acceleration
//         }}>
//             {/* Background element for the fractal */}
//             <div style={{
//                 position: 'absolute',
//                 width: '80vmin',
//                 height: '80vmin',
//                 borderRadius: '50%',
//                 background: 'radial-gradient(circle, rgba(110,137,215,0.15) 0%, rgba(205,233,193,0.1) 50%, rgba(255,82,82,0.05) 100%)',
//                 filter: 'blur(20px)',
//                 opacity: 0.8,
//                 zIndex: 0,
//                 animation: 'pulse 8s ease-in-out infinite alternate',
//                 top: isMobile ? '-20%' : '0', // Match the fractal position
//                 transform: isMobile ? 'translateY(0)' : 'none',
//                 willChange: 'transform, opacity', // Hint to browser to optimize
//                 backfaceVisibility: 'hidden', // Force GPU acceleration
//             }}></div>

//             {/* Fractal container */}
//             <div ref={containerRef} style={{
//                 position: 'absolute',
//                 width: '100%',
//                 height: '100%',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 touchAction: 'none', // Important for touch devices
//                 zIndex: 1,
//                 top: isMobile ? '-20%' : '0', // Position higher on mobile
//                 willChange: 'transform', // Hint to browser to optimize
//                 transform: 'translateZ(0)', // Force GPU acceleration
//                 backfaceVisibility: 'hidden', // Force GPU acceleration
//             }}></div>
//         </div>
//     )
// }



















'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SDFGeometryGenerator } from './SDFGeometryGenerator';
import {
    OrthographicCamera,
    Scene,
    Clock,
    WebGLRenderer,
    Mesh,
    Color,
    ShaderMaterial
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

export default function SDFAnimation(props) {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);
    const scrollTimeout = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth <= 480);
        const handleResize = () => setIsMobile(window.innerWidth <= 480);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    let renderer, meshFromSDF, scene, camera, clock, controls;

    const settings = {
        res: 3,
        bounds: 1,
        autoRotate: true,
        wireframe: true,
    };

    const shader = /* glsl */`
        float dist(vec3 p) {
            p.xyz = p.xzy;
            p *= 1.2;
            vec3 z = p;
            float power = 8.0;
            float r, theta, phi;
            float dr = 1.0;
            float t0 = 1.0;
            for(int i = 0; i < 7; ++i) {
                r = length(z);
                if(r > 2.0) continue;
                theta = atan(z.y / z.x);
                phi = asin(z.z / r);

                dr = pow(r, power - 1.0) * dr * power + 1.0;
                r = pow(r, power);
                theta = theta * power;
                phi = phi * power;

                z = r * vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi)) + p;
                t0 = min(t0, r);
            }
            return 0.5 * log(r) * r / dr;
        }
    `;

    // Premium Muted Normal Shader to replace the blinding stock material
    const mutedNormalShader = {
        vertexShader: /* glsl */`
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /* glsl */`
            varying vec3 vNormal;
            uniform float uWireframe;
            void main() {
                // Map coordinates to standard color vector layout
                vec3 normalColor = vNormal * 0.5 + 0.5;
                
                // Dim the overall output to match luxury aesthetic profiles (Scale down to 35% brightness)
                vec3 mutedTone = normalColor * 0.35;
                
                // Add a deep vignette bias based on the angle facing away from view direction
                float edgeFalloff = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
                mutedTone += vec3(0.02, 0.03, 0.05) * edgeFalloff;

                gl_FragColor = vec4(mutedTone, 1.0);
            }
        `
    };

    useEffect(() => {
        init();
        return () => {
            if (renderer) {
                renderer.setAnimationLoop(null);
                renderer.dispose();
            }
            if (meshFromSDF) {
                if (meshFromSDF.geometry) meshFromSDF.geometry.dispose();
                if (meshFromSDF.material) meshFromSDF.material.dispose();
            }
            if (scene) scene.clear();
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => setIsScrolling(false), 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    function init() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 0.01, 1600);
        camera.position.z = 1100;

        scene = new Scene();
        scene.background = new Color('#000');
        clock = new Clock();

        renderer = new WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.setAnimationLoop(animate);

        if (containerRef.current) {
            containerRef.current.appendChild(renderer.domElement);
            const canvas = renderer.domElement;
            canvas.style.willChange = 'transform';
            canvas.style.transform = 'translateZ(0)';
            canvas.style.backfaceVisibility = 'hidden';
        }

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = true;
        controls.rotateSpeed = 0.4;

        window.addEventListener('resize', onWindowResize);
        compile();
    }

    function compile() {
        const generator = new SDFGeometryGenerator(renderer);
        const geometry = generator.generate(Math.pow(2, settings.res + 2), shader, settings.bounds);
        geometry.computeVertexNormals();

        const customMaterial = new ShaderMaterial({
            vertexShader: mutedNormalShader.vertexShader,
            fragmentShader: mutedNormalShader.fragmentShader,
            wireframe: settings.wireframe
        });

        if (meshFromSDF) {
            meshFromSDF.geometry.dispose();
            meshFromSDF.geometry = geometry;
        } else {
            meshFromSDF = new Mesh(geometry, customMaterial);
            scene.add(meshFromSDF);

            // Re-map scale & positioning properties for asymmetric framing layout
            updateMeshLayout();

            // Luxury intro reveal animations
            gsap.from(meshFromSDF.scale, { duration: 1.8, x: 0.1, y: 0.1, z: 0.1, ease: "power3.out" });
            gsap.from(meshFromSDF.rotation, { duration: 1.8, y: Math.PI, ease: "power3.out" });
        }
    }

    function updateMeshLayout() {
        if (!meshFromSDF) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Massive Awwwards layout scaling modifier
        const baseDimension = Math.min(w, h);
        const targetScale = isMobile ? baseDimension * 0.9 : baseDimension * 0.85; 
        meshFromSDF.scale.set(targetScale, targetScale, targetScale);

        // Position alignment: Shifts the geometric core precisely to the right screen layout threshold
        const horizontalShift = isMobile ? w * 0.45 : w * 0.5;
        const verticalShift = isMobile ? h * 0.15 : 0; 
        
        meshFromSDF.position.set(horizontalShift, -verticalShift, 0);
    }

    function onWindowResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        renderer.setSize(w, h);

        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        camera.updateProjectionMatrix();

        updateMeshLayout();
    }

    function animate() {
        controls.update();

        if (settings.autoRotate && meshFromSDF) {
            const delta = clock.getDelta();
            const rotationSpeed = isScrolling ? Math.PI * 0.01 : Math.PI * 0.03;
            meshFromSDF.rotation.y += rotationSpeed * delta;
        }

        renderer.render(scene, camera);
    }

    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: '#000',
            willChange: 'transform',
            transform: 'translateZ(0)',
        }}>
            {/* Soft Ambient Backdrop Aura — Shifted right to mirror fractal positioning */}
            <div style={{
                position: 'absolute',
                width: '100vmin',
                height: '100vmin',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(110,137,215,0.06) 0%, rgba(255,82,82,0.02) 70%, rgba(0,0,0,0) 100%)',
                filter: 'blur(40px)',
                opacity: 0.6,
                zIndex: 0,
                top: isMobile ? '30%' : '50%',
                right: '-25%',
                transform: 'translateY(-50%)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
            }}></div>

            {/* Geometry Stage viewport */}
            <div ref={containerRef} style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                touchAction: 'none',
                zIndex: 1,
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
            }}></div>
        </div>
    );
}