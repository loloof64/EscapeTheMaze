import React from 'react';
import { View as GraphicsView } from 'expo-graphics';

import ExpoTHREE, { THREE } from 'expo-three';

export default function App() {

  let scene, camera, renderer;
  const InitialCameraZ = 25;

  const buildMazeForScene = (scene) => {
    for (let i = 0; i < 10; i++) {
      let wallLeft = createWallForScene(scene);
      wallLeft.position.x = -2;
      wallLeft.position.z = 20 - 4*i;

      let wallRight = createWallForScene(scene);
      wallRight.position.x = 8;
      wallRight.position.z = 20 - 4*i;
    }
  }

  const createWallForScene = (scene) => {
    const geometry = new THREE.BoxGeometry(2, 16, 4);
    const material = new THREE.MeshBasicMaterial({color: 0x559641});

    const wall = new THREE.Mesh(geometry, material);
    scene.add(wall);

    return wall;
  }

  const onContextCreate = async ({
    gl,
    width,
    height,
    scale: pixelRatio,
  }) => {
    renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
    renderer.setClearColor(0x000000)
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = 3;
    camera.position.z = InitialCameraZ;
    
    buildMazeForScene(scene);
  };

  const onRender = delta => { 
    camera.position.z -= delta * 3.5;
    if (camera.position.z <= 0) camera.position.z = InitialCameraZ;
    renderer.render(scene, camera);
  };

  return (
    <GraphicsView
      onContextCreate={onContextCreate}
      onRender={onRender}
    />
  );
}
