// ============================================
// Unit 5 Assignment: Methane Molecule Model
// Author: [Your Name]
// Date: [Insert Date]
// Description: 3D model of a methane molecule using Three.js
// ============================================

// --------------------
// 1. Scene Setup
// --------------------
const scene = new THREE.Scene(); // Create the 3D scene

// Camera: PerspectiveCamera(fov, aspect, near, far)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10); // Place camera back to view molecule

// Renderer: WebGLRenderer with shadows enabled
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// --------------------
// 2. Lighting
// --------------------
// Directional light to cast shadows
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);

// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// --------------------
// 3. Plane (Ground)
// --------------------
// Green plane that receives shadows but does not move
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x00ff00, // green
  side: THREE.DoubleSide 
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Make it horizontal
plane.position.y = -1; // Place under molecule
plane.receiveShadow = true; // Receives shadows
scene.add(plane);

// --------------------
// 4. Atoms
// --------------------

// 4a. Carbon atom (center)
const carbonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const carbonMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // red
const carbon = new THREE.Mesh(carbonGeometry, carbonMaterial);
carbon.castShadow = true; // Cast shadows on plane
carbon.position.set(0, 0, 0);

// 4b. Hydrogen atoms (tetrahedral positions)
const hydrogenPositions = [
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(-1, -1, 1),
  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(1, -1, -1)
];

const hydrogenMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // blue
const hydrogens = [];

hydrogenPositions.forEach(pos => {
  const hydrogen = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    hydrogenMaterial
  );
  hydrogen.position.copy(pos);
  hydrogen.castShadow = true; // Cast shadows
  hydrogens.push(hydrogen);
});

// --------------------
// 5. Bonds (C-H)
// --------------------
// Function to create a cylinder bond between two atoms
function createBond(start, end) {
  const distance = start.distanceTo(end);
  const bondGeometry = new THREE.CylinderGeometry(0.1, 0.1, distance, 16);
  const bondMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, // white
    emissive: 0xd3d3d3 // light gray emissive
  });
  const bond = new THREE.Mesh(bondGeometry, bondMaterial);
  bond.castShadow = true; // Cast shadows on plane

  // Position bond at midpoint between atoms
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  bond.position.copy(mid);

  // Align cylinder along the vector from start to end
  bond.lookAt(end); // Point bond toward end atom
  bond.rotateX(Math.PI / 2); // Rotate cylinder to stand upright along vector

  return bond;
}

const bonds = hydrogenPositions.map(pos => createBond(carbon.position, pos));

// --------------------
// 6. Molecule Group
// --------------------
// Group all molecule parts (carbon, hydrogens, bonds) so we can rotate them together
const molecule = new THREE.Group();
molecule.add(carbon);
hydrogens.forEach(h => molecule.add(h));
bonds.forEach(b => molecule.add(b));
scene.add(molecule);

// --------------------
// 7. Mouse Controls
// --------------------
// Allow user to rotate molecule without moving plane or lights
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // Focus on molecule
controls.enableDamping = true; // Smooth movement
controls.enablePan = false; // Prevent moving the camera sideways
controls.update();

// --------------------
// 8. Animation Loop
// --------------------
// Slowly rotate molecule automatically
function animate() {
  requestAnimationFrame(animate);

  // Rotate molecule around its center
  molecule.rotation.y += 0.01;
  molecule.rotation.x += 0.005;

  controls.update(); // Update mouse controls
  renderer.render(scene, camera);
}
animate();

// --------------------
// 9. Handle Window Resize
// --------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});