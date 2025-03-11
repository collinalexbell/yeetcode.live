import * as THREE from 'three';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/controls/PointerLockControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const threeContainer = document.getElementById("three-container");

const width = threeContainer.clientWidth;
const height = threeContainer.clientHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
threeContainer.appendChild(renderer.domElement);

// Pointer Lock Controls (FPS style)
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', (event) => {
    if (!event.target.closest("#editor-container")) {
        controls.lock();
    }
});

// Ensure help text is always on top of Three.js
const helpText = document.getElementById("help-text");
helpText.style.zIndex = "100"; // Ensures it stays on top

// Player movement
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const playerSpeed = 0.1;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Event Listeners for movement
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyW') moveForward = true;
    if (event.code === 'KeyS') moveBackward = true;
    if (event.code === 'KeyA') moveLeft = true;
    if (event.code === 'KeyD') moveRight = true;
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW') moveForward = false;
    if (event.code === 'KeyS') moveBackward = false;
    if (event.code === 'KeyA') moveLeft = false;
    if (event.code === 'KeyD') moveRight = false;
});

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Add a Cube (Target)
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 1, -5);
scene.add(box);

// Bullet Shooting
const bullets = [];
document.addEventListener('click', (event) => {
    if (!controls.isLocked || event.target.closest("#editor-container")) return;

    const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);

    orb.position.copy(camera.position);
    scene.add(orb);

    const shootDirection = new THREE.Vector3();
    camera.getWorldDirection(shootDirection);
    bullets.push({ mesh: orb, velocity: shootDirection.clone().multiplyScalar(0.5) });
});

// Collision Detection
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        bullet.mesh.position.add(bullet.velocity);
        const distance = bullet.mesh.position.distanceTo(box.position);

        if (distance < 1.5) {
            executeCubeScript();
            scene.remove(bullet.mesh);
            bullets.splice(i, 1);
        }

        if (bullet.mesh.position.length() > 50) {
            scene.remove(bullet.mesh);
            bullets.splice(i, 1);
        }
    }
}

// Cube Movement Animation
function moveCube(x, y, z, duration) {
    const startPosition = box.position.clone();
    const endPosition = startPosition.clone().add(new THREE.Vector3(x, y, z));
    const startTime = performance.now();

    function animateMove() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        box.position.lerpVectors(startPosition, endPosition, progress);

        if (progress < 1) {
            requestAnimationFrame(animateMove);
        }
    }

    animateMove();
}

// Function to execute the script in the Cube's context
function executeCubeScript() {
    try {
        const code = window.monacoEditor.getValue();

        const cubeContext = {
            changeColor: function(color) {
                box.material.color.set(color);
            },
            rotateCube: function(speed) {
                animateRotation(speed);
            },
            moveCube: function(x, y, z, duration) {
                moveCube(x, y, z, duration);
            }
        };

        const func = new Function('context', `"use strict";\n${code}`);
        func(cubeContext);
    } catch (err) {
        console.error("Error executing cube script:", err);
    }
}

// Cube Rotation Animation
function animateRotation(speed) {
    const rotateInterval = setInterval(() => {
        box.rotation.y += speed;
    }, 16);
    
    setTimeout(() => clearInterval(rotateInterval), 5000);
}

// Window Resize Handling
window.addEventListener('resize', () => {
    const newWidth = threeContainer.clientWidth;
    const newHeight = threeContainer.clientHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    direction.set(0, 0, 0);
    if (moveForward) direction.z -= 1;
    if (moveBackward) direction.z += 1;
    if (moveLeft) direction.x -= 1;
    if (moveRight) direction.x += 1;

    direction.normalize();
    direction.applyEuler(camera.rotation);
    velocity.copy(direction).multiplyScalar(playerSpeed);
    camera.position.add(velocity);

    checkCollisions();
    renderer.render(scene, camera);
}


// Handle Mouse Scroll Inside Three.js Context
document.addEventListener('wheel', (event) => {
    if (document.activeElement === document.body) { // Ensures it's in Three.js context
        event.preventDefault(); // Prevents page scrolling

        const scriptSelector = document.getElementById('script-selector');
        const scriptNames = Array.from(scriptSelector.options).map(option => option.value);
        let currentIndex = scriptNames.indexOf(scriptSelector.value);

        if (event.deltaY > 0) {
            // Scroll Down → Next script
            currentIndex = (currentIndex + 1) % scriptNames.length;
        } else if (event.deltaY < 0) {
            // Scroll Up → Previous script
            currentIndex = (currentIndex - 1 + scriptNames.length) % scriptNames.length;
        }

        scriptSelector.value = scriptNames[currentIndex];

        // Update Monaco Editor with new script
        window.monacoEditor.setValue(JSON.parse(localStorage.getItem('scripts'))[scriptSelector.value]);
    }
}, { passive: false });

document.addEventListener('keydown', (event) => {
    if (event.key === '.') {
        // Release pointer lock & focus Monaco editor
        controls.unlock();
        window.monacoEditor.focus();
	event.preventDefault();
    }
});


camera.position.set(0, 2, 5);
animate();

