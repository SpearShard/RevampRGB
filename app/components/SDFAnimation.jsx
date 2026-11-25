'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SDFGeometryGenerator } from './SDFGeometryGenerator';
import {
    OrthographicCamera,
    Scene,
    Clock,
    WebGLRenderer,
    Mesh,
    Color,
    ShaderMaterial,
    Vector2,
    Vector3,
    Group,
    BufferGeometry,
    BufferAttribute,
    Raycaster
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

const RGB_ACCENTS = [
    { vec: new Vector3(1.0, 0.14, 0.2), hex: '#ff2433' },  // Red
    { vec: new Vector3(0.12, 0.95, 0.38), hex: '#1ff261' }, // Green
    { vec: new Vector3(0.0, 0.337, 0.902), hex: '#0056e6' },  // Blue
];

/** @param {{ mode?: 'home'|'project'|'contact'|'about'|'detail'; activeHref?: string|null; projects?: import('./PersistentFractal').FractalProjectItem[] }} props */
export default function SDFAnimation({ mode = 'home', activeHref = null, projects = [] }) {
    const centered = mode !== 'home';
    const router = useRouter();
    const isCenterTarget = mode !== 'home';
    const [hoveredInfo, setHoveredInfo] = useState(null);
    const [isIndexHover, setIsIndexHover] = useState(false);
    const [mobileSelectedInfo, setMobileSelectedInfo] = useState(null);
    const containerRef = useRef(null);
    const previewRef = useRef(null);
    const calloutRefs = useRef([]);
    const labelWorldRef = useRef(new Vector3());

    const layoutViewportRef = useRef({ width: 0, height: 0 });
    const fractalGroupRef = useRef(null);
    const chunksRef = useRef([]);
    const chunkMeshesRef = useRef([]);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const clockRef = useRef(null);
    const controlsRef = useRef(null);
    const projectsRef = useRef(projects);
    const modeRef = useRef(mode);
    const activeHrefRef = useRef(activeHref);
    const indexHoverHrefRef = useRef(null);

    const centeredRef = useRef(centered);
    const expandRef = useRef({ value: centered ? 1 : 0 });
    const hoveredIdxRef = useRef(null);
    const pointerDownPosRef = useRef({ x: 0, y: 0 });
    const raycasterRef = useRef(new Raycaster());
    const pointerNdcRef = useRef(new Vector2(-99, -99));
    const pointerDirtyRef = useRef(false);

    const cursorWorldTargetRef = useRef(new Vector3(0, 0, 0));
    const cursorWorldCurrentRef = useRef(new Vector3(0, 0, 0));
    const cursorRayDirRef = useRef(new Vector3(0, 0, -1));
    const cursorActiveTargetRef = useRef(0);
    const cursorActiveCurrentRef = useRef(0);

    // Pre-allocated scratch vectors (zero per-frame allocations)
    const scratchWorldDir = useRef(new Vector3());
    const scratchChunkPos = useRef(new Vector3());
    const scratchToChunk = useRef(new Vector3());

    useEffect(() => {
        projectsRef.current = projects;
    }, [projects]);

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

    const chunkVertexShader = /* glsl */`
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const chunkFragmentShader = /* glsl */`
        varying vec3 vNormal;
        uniform vec3 uHoverColor;
        uniform float uHoverMix;

        void main() {
            vec3 normalColor = vNormal * 0.5 + 0.5;
            vec3 mutedTone = normalColor * 0.35;

            float edgeFalloff = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
            mutedTone += vec3(0.02, 0.03, 0.05) * edgeFalloff;

            vec3 finalColor = mix(mutedTone, uHoverColor, max(0.34, uHoverMix));
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function getTargetLayout(nextMode) {
        const w = layoutViewportRef.current.width || window.innerWidth;
        const h = layoutViewportRef.current.height || window.innerHeight;
        const mobile = w <= 767;
        const base = Math.min(w, h);
        // The orthographic camera is centered at world x=0. Mobile layouts use
        // that same origin so each route can compose the fractal around its own UI.
        if (nextMode === 'home') {
            return { scale: base * (mobile ? 0.64 : 0.85), x: mobile ? 0 : w * 0.5, y: mobile ? -h * 0.08 : 0, rotationZ: 0 };
        }
        if (nextMode === 'detail') {
            return { scale: base * (mobile ? 0.48 : 0.9), x: mobile ? 0 : w * 0.25, y: mobile ? h * 0.04 : h * 0.06, rotationZ: Math.PI / 2 };
        }
        if (nextMode === 'contact') {
            return { scale: base * (mobile ? 0.32 : 0.58), x: mobile ? 0 : w * 0.39, y: mobile ? -h * 0.12 : 0, rotationZ: Math.PI / 2 };
        }
        if (nextMode === 'about') {
            return { scale: base * (mobile ? 0.34 : 0.62), x: mobile ? 0 : w * 0.38, y: mobile ? -h * 0.1 : 0, rotationZ: Math.PI / 2 };
        }
        if (nextMode === 'project') {
            return { scale: base * (mobile ? 0.36 : 0.66), x: mobile ? 0 : w * 0.08, y: mobile ? 0 : 0, rotationZ: Math.PI / 2 };
        }
        return { scale: base * (mobile ? 0.38 : 0.66), x: mobile ? 0 : w * 0.08, y: mobile ? -h * 0.08 : 0, rotationZ: Math.PI / 2 };
    }

    function animateGroupToTarget(nextMode, immediate = false) {
        const group = fractalGroupRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!group) return;
        const { scale, x, y, rotationZ } = getTargetLayout(nextMode);
        gsap.killTweensOf(group.position);
        gsap.killTweensOf(group.scale);
        gsap.killTweensOf(group.rotation);
        gsap.killTweensOf(expandRef.current);
        const interactive = nextMode === 'project' && window.innerWidth >= 640;
        if (controls) {
            controls.enabled = interactive;
            controls.autoRotate = interactive;
            controls.autoRotateSpeed = 0.4;
        }
        if (immediate) {
            group.position.set(x, y, 0);
            group.scale.setScalar(scale);
            group.rotation.z = rotationZ;
            expandRef.current.value = nextMode === 'home' ? 0 : 1;
            if (camera) { camera.position.set(0, 0, 1100); camera.lookAt(0, 0, 0); }
        } else {
            gsap.to(group.position, { x, y, duration: nextMode === 'detail' ? 0.78 : 0.95, ease: 'power3.out', overwrite: 'auto' });
            gsap.to(group.scale, { x: scale, y: scale, z: scale, duration: nextMode === 'detail' ? 0.78 : 0.95, ease: 'power3.out', overwrite: 'auto' });
            const currentZ = group.rotation.z;
            const delta = Math.atan2(Math.sin(rotationZ - currentZ), Math.cos(rotationZ - currentZ));
            gsap.to(group.rotation, { z: currentZ + delta, duration: 0.95, ease: 'power3.out', overwrite: 'auto' });
            gsap.to(expandRef.current, { value: nextMode === 'home' ? 0 : 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
            if (camera) {
                gsap.killTweensOf(camera.position);
                gsap.to(camera.position, { x: 0, y: 0, z: 1100, duration: 0.8, ease: 'power3.out', onUpdate: () => camera.lookAt(0, 0, 0) });
            }
        }
    }

    function getSphereDirections(count) {
        const dirs = [];
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const yNorm = 1 - (i / Math.max(1, count - 1)) * 2;
            const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
            const theta = goldenAngle * i;
            dirs.push(
                new Vector3(
                    Math.cos(theta) * radiusAtY,
                    yNorm * 0.85,
                    Math.sin(theta) * radiusAtY
                ).normalize()
            );
        }
        return dirs;
    }

    useEffect(() => {
        modeRef.current = mode;
        activeHrefRef.current = activeHref;
        centeredRef.current = mode !== 'home';
        if (mode === 'detail' && activeHref) {
            const applySelected = () => {
                const selected = chunksRef.current.find((chunk) => chunk.project?.href === activeHref);
                if (selected) chunksRef.current.forEach((chunk) => { chunk.targetOpacity = chunk === selected ? 1 : 0; });
            };
            applySelected();
            requestAnimationFrame(applySelected);
        } else if (mode !== 'detail') {
            chunksRef.current.forEach((chunk) => { chunk.targetOpacity = 1; chunk.mesh.visible = true; });
        }
        animateGroupToTarget(mode, false);
    }, [mode, activeHref]);

    useEffect(() => {
        const onMode = (nextMode) => {
            modeRef.current = nextMode;
            centeredRef.current = nextMode !== 'home';
            if (nextMode !== 'project') {
                setMobileSelectedInfo(null);
                hoveredIdxRef.current = null;
                setHoveredInfo(null);
                pointerNdcRef.current.set(-99, -99);
                cursorActiveTargetRef.current = 0;
            }
            animateGroupToTarget(nextMode, false);
        };
        const events = [
            ['rgb:enter-project', () => onMode('project')],
            ['rgb:leave-project', () => onMode('home')],
            ['rgb:enter-contact', () => onMode('contact')],
            ['rgb:enter-about', () => onMode('about')],
            ['rgb:enter-detail', (event) => {
                const href = event.detail?.href ?? activeHrefRef.current;
                activeHrefRef.current = href;
                onMode('detail');
                const selected = chunksRef.current.find((chunk) => chunk.project?.href === href);
                chunksRef.current.forEach((chunk) => { chunk.targetOpacity = selected && chunk !== selected ? 0 : 1; });
            }],
        ];
        events.forEach(([name, handler]) => window.addEventListener(name, handler));
        return () => events.forEach(([name, handler]) => window.removeEventListener(name, handler));
    }, [projects]);

    useEffect(() => {
        const onIndexHover = (event) => {
            const href = event.detail?.href;
            indexHoverHrefRef.current = href ?? null;
            setIsIndexHover(Boolean(href));
            const match = chunksRef.current.find((chunk) => chunk.project?.href === href);
            if (match) {
                hoveredIdxRef.current = match.index;
                setHoveredInfo({ index: match.index, project: match.project, accentHex: match.accentHex });
            }
            pointerDirtyRef.current = false;
        };
        const onIndexClear = () => {
            indexHoverHrefRef.current = null;
            setIsIndexHover(false);
            hoveredIdxRef.current = null;
            pointerNdcRef.current.set(-99, -99);
            setHoveredInfo(null);
            pointerDirtyRef.current = true;
        };
        window.addEventListener('rgb:index-hover', onIndexHover);
        window.addEventListener('rgb:index-clear', onIndexClear);
        return () => {
            window.removeEventListener('rgb:index-hover', onIndexHover);
            window.removeEventListener('rgb:index-clear', onIndexClear);
        };
    }, []);

    useEffect(() => {
        const clearPointerHover = () => {
            cursorActiveTargetRef.current = 0;
            pointerNdcRef.current.set(-99, -99);
            pointerDirtyRef.current = true;
        };

        const handlePointerMove = (e) => {
            if (modeRef.current !== 'project' || window.innerWidth <= 767 || !cameraRef.current || !rendererRef.current) return;

            // Ignore pointer events over Navbar or other UI overlays above the canvas
            if (e.target !== rendererRef.current.domElement) {
                if (e.target instanceof Element && e.target.closest('[data-works-index]')) return;
                clearPointerHover();
                return;
            }

            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -((e.clientY / window.innerHeight) * 2 - 1);
            pointerNdcRef.current.set(nx, ny);
            pointerDirtyRef.current = true;
            cursorActiveTargetRef.current = 1;

            raycasterRef.current.setFromCamera(pointerNdcRef.current, cameraRef.current);
            cursorRayDirRef.current.copy(raycasterRef.current.ray.direction).normalize();
            cursorWorldTargetRef.current.copy(raycasterRef.current.ray.origin);

            if (previewRef.current) {
                const offsetX = e.clientX > window.innerWidth - 260 ? -244 : 22;
                const offsetY = e.clientY > window.innerHeight - 230 ? -200 : 22;
                previewRef.current.style.transform = `translate3d(${e.clientX + offsetX}px, ${e.clientY + offsetY}px, 0)`;
            }
        };

        const handlePointerDown = (e) => {
            if (modeRef.current !== 'project' || !rendererRef.current) return;
            if (e.target !== rendererRef.current.domElement) return;
            pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
        };

        const handlePointerUp = (e) => {
            if (modeRef.current !== 'project' || window.innerWidth < 640 || !cameraRef.current || !rendererRef.current) return;
            if (e.target !== rendererRef.current.domElement) return;

            const distMoved = Math.hypot(
                e.clientX - pointerDownPosRef.current.x,
                e.clientY - pointerDownPosRef.current.y
            );
            if (distMoved > 6) return;

            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -((e.clientY / window.innerHeight) * 2 - 1);
            raycasterRef.current.setFromCamera(new Vector2(nx, ny), cameraRef.current);
            const hits = raycasterRef.current.intersectObjects(chunkMeshesRef.current, false);
            if (hits.length > 0) {
                const hitChunk = chunksRef.current.find((chunk) => chunk.index === hits[0].object.userData?.chunkIndex);
                const hitProject = hitChunk?.project;
                if (hitProject?.href) {
                    if (window.innerWidth <= 767) {
                        setMobileSelectedInfo({
                            index: hitChunk.index,
                            project: hitProject,
                            accentHex: hitChunk.accentHex,
                        });
                    } else {
                        activeHrefRef.current = hitProject.href;
                        window.dispatchEvent(new CustomEvent('rgb:enter-detail', { detail: { href: hitProject.href } }));
                        router.push(hitProject.href);
                    }
                }
            } else if (window.innerWidth <= 767) {
                setMobileSelectedInfo(null);
            }
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerleave', clearPointerHover);
        window.addEventListener('pointerdown', handlePointerDown, { passive: true });
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerleave', clearPointerHover);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [router]);


    function init() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        layoutViewportRef.current = { width: w, height: h };

        const camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 0.01, 2600);
        camera.position.z = 1100;
        cameraRef.current = camera;

        const scene = new Scene();
        scene.background = new Color('#000');
        sceneRef.current = scene;

        clockRef.current = new Clock();

        const renderer = new WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
        renderer.setSize(w, h);
        rendererRef.current = renderer;

        if (containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(renderer.domElement);
            const canvas = renderer.domElement;
            canvas.style.willChange = 'transform';
            canvas.style.transform = 'translateZ(0)';
            canvas.style.backfaceVisibility = 'hidden';
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = true;
        controls.rotateSpeed = 0.55;
        controls.enabled = centeredRef.current;
        controls.autoRotate = centeredRef.current;
        controls.autoRotateSpeed = 0.4;
        controlsRef.current = controls;

        window.addEventListener('resize', onWindowResize);
    }

    function compile() {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        if (!renderer || !scene) return;

        const generator = new SDFGeometryGenerator(renderer);
        const rawGeometry = generator.generate(Math.pow(2, settings.res + 2), shader, settings.bounds);
        rawGeometry.computeVertexNormals();

        const geometry = rawGeometry.index ? rawGeometry.toNonIndexed() : rawGeometry;
        if (rawGeometry.index) rawGeometry.dispose();

        const list = projectsRef.current;
        const chunkCount = Math.max(1, list.length || 14);
        const chunkDirs = getSphereDirections(chunkCount);

        const posAttr = geometry.getAttribute('position');
        const normAttr = geometry.getAttribute('normal');

        const buckets = Array.from({ length: chunkCount }, () => ({
            positions: [],
            normals: [],
        }));
        const triCenter = new Vector3();

        for (let i = 0; i < posAttr.count; i += 3) {
            triCenter.set(
                (posAttr.getX(i) + posAttr.getX(i + 1) + posAttr.getX(i + 2)) / 3,
                (posAttr.getY(i) + posAttr.getY(i + 1) + posAttr.getY(i + 2)) / 3,
                (posAttr.getZ(i) + posAttr.getZ(i + 1) + posAttr.getZ(i + 2)) / 3
            );
            if (triCenter.lengthSq() > 0.000001) triCenter.normalize();

            let bestIdx = 0;
            let bestDot = -Infinity;
            for (let c = 0; c < chunkCount; c++) {
                const d = triCenter.dot(chunkDirs[c]);
                if (d > bestDot) {
                    bestDot = d;
                    bestIdx = c;
                }
            }

            const bucket = buckets[bestIdx];
            for (let k = 0; k < 3; k++) {
                const v = i + k;
                bucket.positions.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
                bucket.normals.push(normAttr.getX(v), normAttr.getY(v), normAttr.getZ(v));
            }
        }
        geometry.dispose();

        const group = new Group();
        fractalGroupRef.current = group;
        scene.add(group);

        const createdChunks = [];
        const chunkMeshes = [];

        for (let c = 0; c < chunkCount; c++) {
            const bucket = buckets[c];
            if (bucket.positions.length === 0) continue;

            const chunkGeom = new BufferGeometry();
            chunkGeom.setAttribute('position', new BufferAttribute(new Float32Array(bucket.positions), 3));
            chunkGeom.setAttribute('normal', new BufferAttribute(new Float32Array(bucket.normals), 3));

            const accent = RGB_ACCENTS[c % RGB_ACCENTS.length];
            const mat = new ShaderMaterial({
                vertexShader: chunkVertexShader,
                fragmentShader: chunkFragmentShader,
                wireframe: settings.wireframe,
                uniforms: {
                    uHoverColor: { value: accent.vec.clone() },
                    uHoverMix: { value: 0.34 },
                },
            });

            const project = list[c] || null;
            const chunkMesh = new Mesh(chunkGeom, mat);
            chunkMesh.userData = { chunkIndex: c, project, accentHex: accent.hex };
            group.add(chunkMesh);

            createdChunks.push({
                index: c,
                dir: chunkDirs[c],
                mesh: chunkMesh,
                material: mat,
                project,
                accentHex: accent.hex,
                openVal: 0,
                hoverMix: 0.34,
                targetOpacity: 1,
            });
            chunkMeshes.push(chunkMesh);
        }

        if (modeRef.current === 'detail' && activeHrefRef.current) {
            const selected = createdChunks.find((chunk) => chunk.project?.href === activeHrefRef.current);
            createdChunks.forEach((chunk) => { chunk.targetOpacity = selected && chunk !== selected ? 0 : 1; });
        }
        chunksRef.current = createdChunks;
        chunkMeshesRef.current = chunkMeshes;

        animateGroupToTarget(modeRef.current, true);

        gsap.from(group.scale, { duration: 1.8, x: 0.1, y: 0.1, z: 0.1, ease: 'power3.out' });
        gsap.from(group.rotation, { duration: 1.8, y: Math.PI, ease: 'power3.out' });
    }

    function onWindowResize() {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (!renderer || !camera) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const previous = layoutViewportRef.current;

        // Ignore mobile browser-toolbar height changes while scrolling.
        if (w <= 767 && previous.width <= 767 && w === previous.width) return;

        layoutViewportRef.current = { width: w, height: h };

        renderer.setSize(w, h);

        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        camera.updateProjectionMatrix();

        animateGroupToTarget(modeRef.current, true);
    }

    function updateSplitChunks() {
        const group = fractalGroupRef.current;
        const camera = cameraRef.current;
        const chunks = chunksRef.current;
        if (!group || !camera || !chunks.length) return;

        const expand = expandRef.current.value;

        if (window.innerWidth > 767 && pointerDirtyRef.current && centeredRef.current && expand > 0.65) {
            pointerDirtyRef.current = false;
            let nextHoveredIdx = null;

            if (pointerNdcRef.current.x > -2) {
                raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);
                const hits = raycasterRef.current.intersectObjects(chunkMeshesRef.current, false);
                if (hits.length > 0) {
                    nextHoveredIdx = hits[0].object.userData?.chunkIndex ?? null;
                }
            }

            if (nextHoveredIdx !== hoveredIdxRef.current) {
                hoveredIdxRef.current = nextHoveredIdx;
                if (nextHoveredIdx !== null) {
                    const hitChunk = chunks.find((c) => c.index === nextHoveredIdx);
                    setHoveredInfo(
                        hitChunk?.project
                            ? {
                                  index: hitChunk.index,
                                  project: hitChunk.project,
                                  accentHex: hitChunk.accentHex,
                              }
                            : null
                    );
                    if (hitChunk?.project?.href) window.dispatchEvent(new CustomEvent('rgb:fractal-hover', { detail: { href: hitChunk.project.href } }));
                } else {
                    setHoveredInfo(null);
                    window.dispatchEvent(new CustomEvent('rgb:fractal-clear'));
                }
                if (controlsRef.current) {
                    controlsRef.current.autoRotate = centeredRef.current && nextHoveredIdx === null;
                }
            }
        }

        const openRadius = Math.min(window.innerWidth, window.innerHeight) * 0.34;
        const baseSplit = 0.28;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isHovered = hoveredIdxRef.current === chunk.index;

            if (expand < 0.01) {
                chunk.openVal = 0;
                chunk.hoverMix = 0;
                chunk.mesh.position.set(0, 0, 0);
                chunk.mesh.scale.setScalar(1);
                chunk.material.uniforms.uHoverMix.value = 0;
                continue;
            }

            scratchWorldDir.current.copy(chunk.dir).applyQuaternion(group.quaternion).normalize();
            scratchChunkPos.current
                .copy(scratchWorldDir.current)
                .multiplyScalar(group.scale.x * 0.34)
                .add(group.position);

            scratchToChunk.current.copy(scratchChunkPos.current).sub(cursorWorldCurrentRef.current);
            const along = scratchToChunk.current.dot(cursorRayDirRef.current);
            const perpDist = scratchToChunk.current.addScaledVector(cursorRayDirRef.current, -along).length();

            const cursorBoost = window.innerWidth > 767 ? cursorActiveCurrentRef.current * Math.max(0, 1 - perpDist / openRadius) * 0.25 : 0;
            const targetOpen = (baseSplit + cursorBoost) * expand;

            chunk.openVal += (targetOpen - chunk.openVal) * 0.12;
            chunk.mesh.position.copy(chunk.dir).multiplyScalar(chunk.openVal * 0.72);

            const targetHover = (modeRef.current === 'project' && window.innerWidth < 640) ? 0.85 : window.innerWidth <= 767 ? 0.34 : modeRef.current === 'detail' && chunk.targetOpacity === 1 ? 1.0 : isHovered ? 0.85 : 0.34;
            chunk.hoverMix += (targetHover - chunk.hoverMix) * 0.16;
            if (modeRef.current === 'project' && window.innerWidth < 640) { const elapsed = clockRef.current?.elapsedTime ?? 0; const side = i % 2 === 0 ? 1 : -1; const rowCount = Math.ceil(chunks.length / 2); const yRow = Math.floor(i / 2); const yNorm = rowCount > 1 ? yRow / (rowCount - 1) - 0.5 : 0; const flankX = (window.innerWidth * 0.43) / Math.max(1, group.scale.x); chunk.mesh.position.set(yNorm * 3.8 + Math.sin(elapsed * 0.45 + i) * 0.08, side * (flankX + (i % 2) * 0.14) + Math.cos(elapsed * 0.35 + i) * 0.06, chunk.dir.z * 0.15); } if (modeRef.current === 'about') {
                const elapsed = clockRef.current?.elapsedTime ?? 0;
                const isInnerOrbit = i < 5;
                const orbitIndex = isInnerOrbit ? i : i - 5;
                const orbitCount = isInnerOrbit ? 5 : 9;
                const direction = isInnerOrbit ? 1 : -1;
                const speed = isInnerOrbit ? 0.22 : 0.14;
                const angle = direction * elapsed * speed + orbitIndex * (Math.PI * 2 / orbitCount);
                const radius = isInnerOrbit ? 0.28 : 0.68;
                chunk.mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, chunk.dir.z * 0.08);
            }
            const callout = calloutRefs.current[chunk.index];
            if (callout) {
                if (modeRef.current === 'project' && chunk.project && window.innerWidth >= 640) {
                    chunk.mesh.getWorldPosition(labelWorldRef.current);
                    labelWorldRef.current.project(camera);
                    const screenX = (labelWorldRef.current.x * 0.5 + 0.5) * window.innerWidth;
                    const screenY = (-labelWorldRef.current.y * 0.5 + 0.5) * window.innerHeight;
                    const visible = labelWorldRef.current.z > -1 && labelWorldRef.current.z < 1 && screenX > 12 && screenX < window.innerWidth - 12 && screenY > 12 && screenY < window.innerHeight - 12;
                    callout.style.transform = 'translate3d(' + screenX + 'px,' + screenY + 'px,0) translate(-50%,-50%)';
                    callout.style.opacity = visible ? (isHovered ? '1' : '0.72') : '0';
                } else { callout.style.opacity = '0'; }
            }

            const detailSelected = modeRef.current === 'detail' && chunk.targetOpacity === 1;
            const detailScale = detailSelected ? (window.innerWidth < 640 ? 1.32 : 1.58) : 1;
            chunk.mesh.scale.setScalar(detailScale * (1 + chunk.hoverMix * 0.08));
            chunk.mesh.visible = modeRef.current !== 'detail' || chunk.targetOpacity === 1;
            chunk.material.uniforms.uHoverMix.value = chunk.hoverMix;
        }
    }

    function animate() {
        if (controlsRef.current) controlsRef.current.update();

        const clock = clockRef.current;
        const delta = clock ? clock.getDelta() : 0.016;

        cursorWorldCurrentRef.current.lerp(cursorWorldTargetRef.current, 0.14);
        cursorActiveCurrentRef.current += (cursorActiveTargetRef.current - cursorActiveCurrentRef.current) * 0.12;

        if (fractalGroupRef.current && settings.autoRotate && modeRef.current === 'home') {
            fractalGroupRef.current.rotation.y += Math.PI * 0.03 * delta;
        }
        if (fractalGroupRef.current && (modeRef.current === 'about' || modeRef.current === 'contact')) {
            fractalGroupRef.current.rotation.y += (modeRef.current === 'about' ? -1 : 1) * Math.PI * 0.008 * delta;
        }

        updateSplitChunks();

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    }

    useEffect(() => {
        let isStarted = false;
        const hasLoader = Boolean(document.querySelector('[data-home-loader]'));

        const startAnimation = () => {
            if (isStarted) return;
            isStarted = true;
            compile();
            if (rendererRef.current) {
                rendererRef.current.setAnimationLoop(animate);
            }
        };

        init();

        if (hasLoader) {
            window.addEventListener('home-loader:reveal', startAnimation, { once: true });
        } else {
            startAnimation();
        }

        return () => {
            window.removeEventListener('home-loader:reveal', startAnimation);
            window.removeEventListener('resize', onWindowResize);
            if (rendererRef.current) {
                rendererRef.current.setAnimationLoop(null);
                rendererRef.current.dispose();
            }
            if (fractalGroupRef.current) {
                gsap.killTweensOf(fractalGroupRef.current.position);
                gsap.killTweensOf(fractalGroupRef.current.scale);
                gsap.killTweensOf(fractalGroupRef.current.rotation);
            }
            chunksRef.current.forEach((chunk) => {
                chunk.mesh.geometry.dispose();
                chunk.material.dispose();
            });
            if (sceneRef.current) sceneRef.current.clear();
        };
    }, []);

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: 'transparent',
                willChange: 'transform',
                transform: 'translateZ(0)',
                cursor: isCenterTarget ? (hoveredInfo ? 'pointer' : 'grab') : 'default',
            }}
        >
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

            {/* Soft Ambient Backdrop Aura */}
            <div style={{
                position: 'absolute',
                width: '100vmin',
                height: '100vmin',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(110,137,215,0.06) 0%, rgba(255,82,82,0.02) 70%, rgba(0,0,0,0) 100%)',
                filter: 'blur(40px)',
                opacity: 0.6,
                zIndex: 0,
                top: '50%',
                right: isCenterTarget ? '50%' : '-25%',
                transform: isCenterTarget ? 'translate(50%, -50%)' : 'translateY(-50%)',
                transition: 'right 1.05s cubic-bezier(0.22, 1, 0.36, 1), transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
            }}></div>

            {/* Geometry Stage viewport */}
            <div ref={containerRef} style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                touchAction: 'none',
                pointerEvents: mode === 'project' ? 'auto' : 'none',
                zIndex: 1,
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
            }}></div>

            {mode === 'project' && hoveredInfo && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-y-1/2 translate-x-8 rounded-full border border-white/20 bg-black/65 px-3 py-1.5 font-mono text-[9px] tracking-[0.16em] text-white/75 backdrop-blur-md">
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hoveredInfo.accentHex }} />
                    {({ '#ff2433': '(255, 36, 51)', '#1ff261': '(31, 242, 97)', '#0056e6': '(0, 86, 230)' })[hoveredInfo.accentHex] ?? hoveredInfo.accentHex}
                </div>
            )}

            {mode === 'project' && projects.map((project, index) => (
                <div key={project.href} ref={(element) => { calloutRefs.current[index] = element; }} className="pointer-events-none absolute left-0 top-0 z-10 hidden items-center gap-2 sm:flex whitespace-nowrap rounded-full border border-white/10 bg-[#08090d]/75 px-2.5 py-1.5 font-mono text-[8px] tracking-[0.12em] text-white/75 backdrop-blur-sm" style={{ opacity: 0, willChange: 'transform, opacity' }}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RGB_ACCENTS[index % RGB_ACCENTS.length].hex }} />
                    <span>{String(index + 1).padStart(2, '0')} / {project.title}</span>
                    <span className="text-white/35">[{['255, 36, 51', '31, 242, 97', '0, 86, 230'][index % 3]}]</span>
                </div>
            ))}

            {mode === 'project' && mobileSelectedInfo && (
                <div className="pointer-events-auto fixed left-4 right-4 top-[54%] z-30 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#09090d]/95 shadow-[0_24px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileSelectedInfo(null)}
                        aria-label="Close project preview"
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/65 text-lg text-white/80"
                    >
                        ×
                    </button>
                    <div className="relative aspect-[16/9] w-full bg-neutral-950">
                        <Image
                            src={mobileSelectedInfo.project.cover}
                            alt={mobileSelectedInfo.project.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-black/10" />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const href = mobileSelectedInfo.project.href;
                            activeHrefRef.current = href;
                            window.dispatchEvent(new CustomEvent('rgb:enter-detail', { detail: { href } }));
                            router.push(href);
                        }}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                    >
                        <span className="min-w-0">
                            <span className="block text-[9px] uppercase tracking-[0.2em] text-white/40">{mobileSelectedInfo.project.categoryTitle}</span>
                            <span className="mt-1 block truncate text-base font-medium text-white">{mobileSelectedInfo.project.title}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/55">Explore ↗</span>
                    </button>
                </div>
            )}

            {/* Editorial Cursor-Tracked Project Preview Card */}
            {mode === 'project' && (
                <div
                    ref={previewRef}
                    className={`pointer-events-none fixed top-0 left-0 z-30 hidden w-56 sm:block rounded-2xl overflow-hidden bg-[#09090d]/90 backdrop-blur-2xl border shadow-[0_24px_60px_rgba(0,0,0,0.9)] transition-opacity duration-200 ${
                        hoveredInfo ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        borderColor: hoveredInfo ? `${hoveredInfo.accentHex}66` : 'rgba(255,255,255,0.12)',
                    }}
                >
                    {hoveredInfo && !isIndexHover && (
                        <>
                            <div
                                className="h-[2px] w-full"
                                style={{ backgroundColor: hoveredInfo.accentHex }}
                            />
                            <div className="relative w-full aspect-[16/10] bg-neutral-950 overflow-hidden">
                                <Image
                                    src={hoveredInfo.project.cover}
                                    alt={hoveredInfo.project.title}
                                    fill
                                    sizes="224px"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-black/25" />
                                <span
                                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] tracking-[0.2em] text-white/80"
                                    style={{ fontFamily: "'Space Mono', monospace" }}
                                >
                                    {String(hoveredInfo.index + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <div className="px-3.5 pt-2.5 pb-3">
                                <p
                                    className="text-[9px] uppercase tracking-[0.22em] truncate"
                                    style={{
                                        color: hoveredInfo.accentHex,
                                        fontFamily: "'Space Mono', monospace",
                                    }}
                                >
                                    {hoveredInfo.project.categoryTitle}
                                </p>
                                <div className="mt-1 flex items-baseline justify-between gap-2">
                                    <p
                                        className="text-sm font-bold text-white leading-snug tracking-tight truncate"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        {hoveredInfo.project.title}
                                    </p>
                                    <span
                                        className="text-[10px] text-white/40 shrink-0"
                                        style={{ fontFamily: "'Space Mono', monospace" }}
                                    >
                                        ↗
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
