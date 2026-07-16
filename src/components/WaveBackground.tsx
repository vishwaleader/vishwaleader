"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import anime from "animejs";

export default function WaveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    // Use a slightly angled camera for a nice wave perspective
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create a particle grid
    const SEPARATION = 1.2;
    const AMOUNTX = 60;
    const AMOUNTY = 60;
    const numParticles = AMOUNTX * AMOUNTY;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0;
    let j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[i + 1] = 0;
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        scales[j] = 1;
        i += 3;
        j++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom shader material for point scaling and coloring
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x3b82f6) }, // brand blue
      },
      vertexShader: `
        attribute float scale;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = scale * (15.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animObj = { time: 0 };
    let animationFrameId: number;

    // Use anime.js to drive the time variable smoothly
    anime({
      targets: animObj,
      time: 100,
      duration: 100000,
      loop: true,
      easing: 'linear',
    });

    const renderWave = () => {
      animationFrameId = requestAnimationFrame(renderWave);

      const positions = particles.geometry.attributes.position.array as Float32Array;
      const scales = particles.geometry.attributes.scale.array as Float32Array;

      let i = 0;
      let j = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          // Dynamic wave formula driven by anime.js time
          const t = animObj.time;
          positions[i + 1] = (Math.sin((ix + t * 5) * 0.3) * 2) +
                             (Math.sin((iy + t * 5) * 0.5) * 2);
          
          scales[j] = (Math.sin((ix + t * 5) * 0.3) + 1) * 2 +
                      (Math.sin((iy + t * 5) * 0.5) + 1) * 2;
          
          i += 3;
          j++;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;
      
      // Slow rotation for visual effect
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    renderWave();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" style={{ overflow: "hidden" }}></div>
  );
}
