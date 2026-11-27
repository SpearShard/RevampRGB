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
    { vec: new Vector3(0.18, 0.48, 1.0), hex: '#2e7aff' },  // Blue
];

/** @param {{ mode?: 'home' | 'project' | 'contact' | 'about' | 'detail'; centered?: boolean; projects?: import('./PersistentFractal').FractalProjectItem[]; selectedChunkIndex?: number | null }} props */
export default function SDFAnimation({ mode = 'home', centered = false, projects = [], selectedChunkIndex = null }) {
    const router = useRouter();
    const [isCenterTarget, setIsCenterTarget] = useState(centered);
    const [hoveredInfo, setHoveredInfo] = useState(null);
    const containerRef = useRef(null);
    const previewRef = useRef(null);

    const fractalGroupRef = useRef(null);
    const chunksRef = useRef([]);
    const chunkMeshesRef = useRef([]);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const clockRef = useRef(null);
    const controlsRef = useRef(null);
    const projectsRef = useRef(projects);

    const centeredRef = useRef(centered);
    const modeRef = useRef(mode);
    const selectedChunkIndexRef = useRef(selectedChunkIndex);
    const previousModeRef = useRef(mode);
    const indexHoveredIdxRef = useRef(null);
    modeRef.current = mode;
    selectedChunkIndexRef.current = selectedChunkIndex;
    const expandRef = useRef({ value: centered || mode === 'contact' || mode === 'about' ? 1 : 0 });
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

    useEffect(() => {
        const handleIndexHover = (event) => {
            const index = event.detail?.chunkIndex ?? null;
            indexHoveredIdxRef.current = index;

            if (index === null) {
                setHoveredInfo(null);
                return;
            }

            const chunk = chunksRef.current.find((item) => item.index === index);
            if (!chunk?.project) return;

            setHoveredInfo({
                index: chunk.index,
                project: chunk.project,
                accentHex: chunk.accentHex,
            });

            if (previewRef.current) {
                const x = Math.max(16, window.innerWidth - 244);
                const y = Math.max(16, Math.min(window.innerHeight - 220, window.innerHeight * 0.5 - 90));
                previewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
        };

        const handleIndexSelect = (event) => {
            const index = event.detail?.chunkIndex;
            const chunk = chunksRef.current.find((item) => item.index === index);
            if (chunk?.project?.href) router.push(chunk.project.href);
        };

        window.addEventListener('rgb:index-hover', handleIndexHover);
        window.addEventListener('rgb:index-select', handleIndexSelect);
        return () => {
            window.removeEventListener('rgb:index-hover', handleIndexHover);
            window.removeEventListener('rgb:index-select', handleIndexSelect);
        };
    }, [router]);

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

            vec3 finalColor = mix(mutedTone, uHoverColor, uHoverMix);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function getTargetLayout(isCentered, pageMode = modeRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const mobile = w <= 480;
        const baseDimension = Math.min(w, h);
        const homeScale = mobile ? baseDimension * 0.9 : baseDimension * 0.85;

        if (pageMode === 'detail') {
            return { scale: homeScale * 0.68, x: 0, y: 0, rotationZ: Math.PI / 2 };
        }

        if (isCentered || pageMode === 'project') {
            return {
                scale: homeScale * 0.58,
                x: 0,
                y: 0,
                rotationZ: Math.PI / 2,
            };
        }

        if (pageMode === 'about') {
            return { scale: homeScale * (mobile ? 0.48 : 0.46), x: mobile ? -w * 0.30 : -w * 0.27, y: mobile ? -h * 0.08 : 0, rotationZ: 0 };
        }

        if (pageMode === 'contact') {
            return { scale: homeScale * (mobile ? 0.46 : 0.50), x: mobile ? -w * 0.25 : -w * 0.27, y: mobile ? h * 0.12 : h * 0.04, rotationZ: 0 };
        }

        const horizontalShift = mobile ? w * 0.45 : w * 0.5;
        const verticalShift = mobile ? h * 0.15 : 0;
        return {
            scale: homeScale,
            x: horizontalShift,
            y: -verticalShift,
            rotationZ: 0,
        };
    }

    function animateGroupToTarget(isCentered, immediate = false) {
        const group = fractalGroupRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!group) return;

        const pageMode = modeRef.current;
        const { scale, x, y, rotationZ } = getTargetLayout(isCentered, pageMode);

        gsap.killTweensOf(group.position);
        gsap.killTweensOf(group.scale);
        gsap.killTweensOf(group.rotation);
        gsap.killTweensOf(expandRef.current);

        if (controls) {
            controls.enabled = isCentered;
            controls.autoRotate = isCentered;
            controls.autoRotateSpeed = 0.4;
        }

        if (immediate) {
            group.position.set(x, y, 0);
            group.scale.set(scale, scale, scale);
            group.rotation.z = rotationZ;
            expandRef.current.value = (isCentered || pageMode === 'contact' || pageMode === 'about') ? 1 : 0;
            if (!isCentered && camera) {
                camera.position.set(0, 0, 1100);
                camera.lookAt(0, 0, 0);
            }
        } else {
            gsap.to(group.position, {
                x,
                y,
                duration: 1.05,
                ease: 'power3.out',
            });
            gsap.to(group.scale, {
                x: scale,
                y: scale,
                z: scale,
                duration: 1.05,
                ease: 'power3.out',
            });
            gsap.to(group.rotation, {
                z: rotationZ,
                duration: 1.05,
                ease: 'power3.out',
            });
            gsap.to(expandRef.current, {
                value: (isCentered || pageMode === 'contact' || pageMode === 'about') ? 1 : 0,
                duration: (isCentered || pageMode === 'contact' || pageMode === 'about') ? 1.0 : 0.55,
                delay: isCentered ? 0.15 : 0,
                ease: (isCentered || pageMode === 'contact' || pageMode === 'about') ? 'power3.out' : 'power2.out',
            });

            if (!isCentered && camera) {
                gsap.killTweensOf(camera.position);
                gsap.to(camera.position, {
                    x: 0,
                    y: 0,
                    z: 1100,
                    duration: 0.9,
                    ease: 'power3.out',
                    onUpdate: () => camera.lookAt(0, 0, 0),
                });
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
        const previousMode = previousModeRef.current;
        centeredRef.current = centered;
        setIsCenterTarget(centered);

        // Detail mode hides the other shards. On exit, let the normal
        // per-page layout ease them out from their existing positions; do not
        // scale them up from near-zero or run a second competing transition.
        if (previousMode === 'detail' && mode !== 'detail') {
            chunksRef.current.forEach((chunk) => {
                chunk.mesh.visible = true;
                chunk.openVal = 0;
            });
        }
        previousModeRef.current = mode;

        if (!centered) {
            hoveredIdxRef.current = null;
            indexHoveredIdxRef.current = null;
            setHoveredInfo(null);
            pointerNdcRef.current.set(-99, -99);
            cursorActiveTargetRef.current = 0;
        }
        animateGroupToTarget(centered, false);
    }, [centered, mode]);

    useEffect(() => {
        const handleEnterProject = () => {
            centeredRef.current = true;
            setIsCenterTarget(true);
            animateGroupToTarget(true, false);
        };

        window.addEventListener('rgb:enter-project', handleEnterProject);
        return () => window.removeEventListener('rgb:enter-project', handleEnterProject);
    }, []);

    useEffect(() => {
        const clearPointerHover = () => {
            cursorActiveTargetRef.current = 0;
            pointerNdcRef.current.set(-99, -99);
            pointerDirtyRef.current = true;
        };

        const handlePointerMove = (e) => {
            if (!centeredRef.current || !cameraRef.current || !rendererRef.current) return;

            // Ignore pointer events over Navbar or other UI overlays above the canvas
            if (e.target !== rendererRef.current.domElement) {
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
            if (!centeredRef.current || !rendererRef.current) return;
            if (e.target !== rendererRef.current.domElement) return;
            pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
        };

        const handlePointerUp = (e) => {
            if (!centeredRef.current || !cameraRef.current || !rendererRef.current) return;
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
                const hitProject = hits[0].object.userData?.project;
                if (hitProject?.href) {
                    router.push(hitProject.href);
                }
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

    function init() {
        const w = window.innerWidth;
        const h = window.innerHeight;

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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
                    uHoverMix: { value: 0 },
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
                hoverMix: 0,
            });
            chunkMeshes.push(chunkMesh);
        }

        chunksRef.current = createdChunks;
        chunkMeshesRef.current = chunkMeshes;

        animateGroupToTarget(centeredRef.current, true);

        gsap.from(group.scale, { duration: 1.8, x: 0.1, y: 0.1, z: 0.1, ease: 'power3.out' });
        gsap.from(group.rotation, { duration: 1.8, y: Math.PI, ease: 'power3.out' });
    }

    function onWindowResize() {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (!renderer || !camera) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        renderer.setSize(w, h);

        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        camera.updateProjectionMatrix();

        animateGroupToTarget(centeredRef.current, true);
    }

    function updateSplitChunks(delta = 0.016) {
        const group = fractalGroupRef.current;
        const camera = cameraRef.current;
        const chunks = chunksRef.current;
        if (!group || !camera || !chunks.length) return;

        const expand = expandRef.current.value;
        const pageMode = modeRef.current;
        const positionEase = 1 - Math.exp(-Math.max(delta, 0.001) * 6);

        if (pageMode === 'detail') {
            const selectedIndex = selectedChunkIndexRef.current;
            const elapsed = clockRef.current ? clockRef.current.elapsedTime : 0;
            for (const chunk of chunks) {
                const selected = selectedIndex !== null && chunk.index === selectedIndex;
                chunk.mesh.visible = selected;
                if (selected) {
                    scratchChunkPos.current.set(Math.sin(elapsed * 0.32) * 0.075, Math.cos(elapsed * 0.24) * 0.055, Math.sin(elapsed * 0.19) * 0.035);
                    chunk.mesh.position.lerp(scratchChunkPos.current, positionEase);
                    chunk.mesh.scale.setScalar(chunk.mesh.scale.x + (1.28 - chunk.mesh.scale.x) * positionEase);
                    chunk.mesh.rotation.x += (Math.sin(elapsed * 0.18) * 0.12 - chunk.mesh.rotation.x) * positionEase;
                    chunk.mesh.rotation.y += (Math.cos(elapsed * 0.15) * 0.16 - chunk.mesh.rotation.y) * positionEase;
                } else {
                    chunk.mesh.position.lerp(scratchChunkPos.current.set(0, 0, 0), positionEase);
                    chunk.mesh.scale.setScalar(1);
                }
                chunk.material.uniforms.uHoverMix.value = 0;
            }
            return;
        }

        for (const chunk of chunks) chunk.mesh.visible = true;

        if (pageMode === 'contact') {
            for (const chunk of chunks) {
                chunk.openVal += (expand - chunk.openVal) * 0.12;
                scratchChunkPos.current.copy(chunk.dir).multiplyScalar(chunk.openVal * 0.9);
                chunk.mesh.position.lerp(scratchChunkPos.current, positionEase);
                chunk.mesh.scale.setScalar(1);
                chunk.material.uniforms.uHoverMix.value = 0;
            }
            return;
        }

        if (pageMode === 'about') {
            const elapsed = clockRef.current ? clockRef.current.elapsedTime : 0;
            const ringCount = 3;
            const ringSizes = Array.from({ length: ringCount }, (_, ring) => chunks.filter((chunk) => chunk.index % ringCount === ring).length);
            for (const chunk of chunks) {
                chunk.openVal += (expand - chunk.openVal) * 0.12;
                const ring = chunk.index % ringCount;
                const slot = Math.floor(chunk.index / ringCount);
                const angle = (slot / Math.max(1, ringSizes[ring])) * Math.PI * 2 + elapsed * (0.18 + ring * 0.055) * (ring % 2 === 0 ? 1 : -1);
                const radius = (0.24 + ring * 0.19) * chunk.openVal;
                scratchChunkPos.current.set(Math.cos(angle) * radius, Math.sin(angle) * radius, chunk.dir.z * 0.08);
                chunk.mesh.position.lerp(scratchChunkPos.current, positionEase);
                chunk.mesh.scale.setScalar(1);
                chunk.material.uniforms.uHoverMix.value = 0;
            }
            return;
        }

        if (pointerDirtyRef.current && centeredRef.current && expand > 0.65) {
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
                window.dispatchEvent(new CustomEvent('rgb:fractal-hover', { detail: { chunkIndex: nextHoveredIdx } }));
                if (indexHoveredIdxRef.current === null) {
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
                    } else {
                        setHoveredInfo(null);
                    }
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
            const activeHoveredIndex = indexHoveredIdxRef.current ?? hoveredIdxRef.current;
            const isHovered = activeHoveredIndex === chunk.index;

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

            const cursorBoost = cursorActiveCurrentRef.current * Math.max(0, 1 - perpDist / openRadius) * 0.25;
            const targetOpen = (baseSplit + cursorBoost) * expand;

            chunk.openVal += (targetOpen - chunk.openVal) * 0.12;
            scratchChunkPos.current.copy(chunk.dir).multiplyScalar(chunk.openVal * 0.72);
            chunk.mesh.position.lerp(scratchChunkPos.current, positionEase);

            const targetHover = isHovered ? 0.92 : 0.0;
            chunk.hoverMix += (targetHover - chunk.hoverMix) * 0.16;
            chunk.mesh.scale.setScalar(1 + chunk.hoverMix * 0.08);
            chunk.material.uniforms.uHoverMix.value = chunk.hoverMix;
        }
    }

    function animate() {
        if (controlsRef.current) controlsRef.current.update();

        const clock = clockRef.current;
        const delta = clock ? clock.getDelta() : 0.016;

        cursorWorldCurrentRef.current.lerp(cursorWorldTargetRef.current, 0.14);
        cursorActiveCurrentRef.current += (cursorActiveTargetRef.current - cursorActiveCurrentRef.current) * 0.12;

        if (fractalGroupRef.current && settings.autoRotate && !centeredRef.current) {
            fractalGroupRef.current.rotation.y += Math.PI * 0.03 * delta;
        }

        updateSplitChunks(delta);

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    }

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: '#000',
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
                zIndex: 1,
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
            }}></div>

            {/* Editorial Cursor-Tracked Project Preview Card */}
            {isCenterTarget && (
                <div
                    ref={previewRef}
                    className={`pointer-events-none fixed top-0 left-0 z-30 w-56 rounded-2xl overflow-hidden bg-[#09090d]/90 backdrop-blur-2xl border shadow-[0_24px_60px_rgba(0,0,0,0.9)] transition-opacity duration-200 ${
                        hoveredInfo ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        borderColor: hoveredInfo ? `${hoveredInfo.accentHex}66` : 'rgba(255,255,255,0.12)',
                    }}
                >
                    {hoveredInfo && (
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
