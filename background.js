/* ==========================================================================
   AETHERNEWS - 3D Particle Background System (Three.js)
   ========================================================================== */

let scene, camera, renderer, particleSystem;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function init() {
  const canvas = document.getElementById('bg-canvas');
  
  // Create Scene & Camera
  scene = new THREE.Scene();
  // Set up deep dark atmosphere fog
  scene.fog = new THREE.FogExp2(0x07070a, 0.0018);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 150;

  // Create Particles
  const particleCount = 700;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Colors: Mix of cyan (#00f2fe) and purple (#b152ff)
  const colorCyan = new THREE.Color(0x00f2fe);
  const colorPurple = new THREE.Color(0xb152ff);

  for (let i = 0; i < particleCount; i++) {
    // Spread particles in a 3D volume
    positions[i * 3] = (Math.random() - 0.5) * 400;     // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // z

    // Color mixing
    const mixRatio = Math.random();
    const mixedColor = colorCyan.clone().lerp(colorPurple, mixRatio);
    
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material - clean circles using high-performance shaders
  const material = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  // Create point cloud
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Renderer Setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // capped at 2 for performance
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x07070a, 1);

  // Listeners
  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);

  animate();
}

function onDocumentMouseMove(event) {
  // Normalize mouse coordinate system (-1 to 1)
  targetX = (event.clientX - windowHalfX) * 0.12;
  targetY = (event.clientY - windowHalfY) * 0.12;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Apply smooth cursor tracking rotation with linear interpolation
  currentX += (targetX - currentX) * 0.05;
  currentY += (targetY - currentY) * 0.05;

  particleSystem.rotation.y = currentX * 0.005;
  particleSystem.rotation.x = currentY * 0.005;

  // Constant slow ambient spinning
  particleSystem.rotation.z += 0.0006;

  renderer.render(scene, camera);
}

// Start once DOM is loaded
window.addEventListener('DOMContentLoaded', init);
