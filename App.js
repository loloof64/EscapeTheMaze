import React from 'react';
import { View as GraphicsView } from 'expo-graphics';

import ExpoTHREE, { THREE } from 'expo-three';

export default function App() {

  let scene, camera, renderer;
  let cube;

  const buildCubeForScene = (scene) => {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial({color: 0x0000FC});

    let cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    return cube;
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
    camera.position.z = 5;
    
    cube = buildCubeForScene(scene);
  };

  const onRender = delta => { 
    cube.rotation.y += delta * 0.5;
    renderer.render(scene, camera);
  };

  return (
    <GraphicsView
      onContextCreate={onContextCreate}
      onRender={onRender}
    />
  );
}
