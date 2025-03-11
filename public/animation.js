import {scene, moveForward, moveBackward, moveLeft, moveRight, direction, velocity, camera, checkCollisions, renderer, playerSpeed} from "./threejs-world.js"
/* animation.js */

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

camera.position.set(0, 2, 5);
animate();

