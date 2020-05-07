import React from 'react';
import { Dimensions, View } from 'react-native';

import { View as GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import { ProcessingView } from 'expo-processing';

export default function App() {

  let scene, camera, renderer, gl, scale, twoDZoneProgressionRate;
  const InitialCameraZ = 20;

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

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

  const configureRenderer = ({ width, height }) => {
    renderer = new ExpoTHREE.Renderer({ gl, pixelRatio: scale, width, height });
    renderer.setClearColor(0x000000)
  }

  const on3DContextCreate = async ({
    gl: tempGl,
    width,
    height,
    scale: pixelRatio,
  }) => {
    gl = tempGl;
    scale = pixelRatio;

    configureRenderer({ width, height });

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = 3;
    camera.position.z = InitialCameraZ;
    
    buildMazeForScene(scene);
  };

  const onRender = delta => { 
    camera.position.z -= delta * 3.5;
    twoDZoneProgressionRate = 20 - camera.position.z;
    if (camera.position.z <= 0) camera.position.z = InitialCameraZ;
    renderer.render(scene, camera);
  };

  const onResize = ({width, height}) => {
    configureRenderer({ width, height });
  }

  const sketch2D = (p) => {
    const unit = width * 0.04;

    p.setup = () => {
      p.size(width, height * 0.5);
      p.strokeWeight(unit);
    }

    p.draw = () => {
      p.background(152);

      p.stroke(0);
      p.line(3*unit, 3*unit, 23*unit, 3*unit);
      p.line(3*unit, 7*unit, 23*unit, 7*unit);

      p.stroke(255, 12, 20);
      p.point(3*unit + twoDZoneProgressionRate*unit, 5*unit);
    }
  }

  return (
    <View style={{width, height}}>
      <GraphicsView
        style={{width, height: height * 0.5}}
        onContextCreate={on3DContextCreate}
        onRender={onRender}
        onResize={onResize}
      />
      <ProcessingView
        style={{width, height: height * 0.5}}
        sketch={sketch2D}
      />
    </View>
  );
}
