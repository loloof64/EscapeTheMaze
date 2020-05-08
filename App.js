import React   from 'react';
import { Dimensions, View, Image, TouchableHighlight } from 'react-native';

import { View as GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import { ProcessingView } from 'expo-processing';

export default function App() {

  const mapDimension = 16;
  const wallThickness = 4;
  const wallLength = 4;
  let scene, camera, renderer, gl, scale;
  let map, mapDrawn = true;
  const mapBackground = 152;
  let playerX, playerY;
  const InitialCameraX = wallThickness; // we must initially place on row 1
  const InitialCameraZ = 0;

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const resetScene = () => {
    scene = new THREE.Scene();
  }

  const buildMap = () => {

    const buildMapEmptyArray = () => {
      map = new Array(mapDimension);
      for (let j = 0; j < mapDimension; j++) {
        const arrToSet = new Array(mapDimension);
        for (let i = 0; i < mapDimension; i++) {
          arrToSet[i] = 0;
        }
        map[j] = arrToSet;
      }
    }

    const createFreeZonesForMap = () => {
      for (let i = 0; i < mapDimension; i++) map[1][i] = 1;
    }

    playerX = 0;
    playerY = 1;
    buildMapEmptyArray();
    createFreeZonesForMap();
    mapDrawn = false;
  }

  const buildMaze = () => {
    for (let j = 0; j < mapDimension; j++) {
      for (let i = 0; i < mapDimension; i++) {
        const cellValue = map[j][i];
        const isAWall = cellValue === 0;

        if (isAWall) {
          let wall = createWall();
          wall.position.x = wallThickness * j;
          wall.position.z = - wallThickness * i;
        }
      }
    }
  }

  const createWall = () => {
    const geometry = new THREE.BoxGeometry(wallThickness, 16, wallLength);
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
    resetScene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = InitialCameraX;
    camera.position.z = InitialCameraZ;
    
    if (map) {
      camera.position.x = playerY * wallThickness;
      camera.position.z = -playerX * wallThickness;
      mapDrawn = false;
    }
    else {
      buildMap();
      resetScene();
    }
    buildMaze();
  };

  const onRender = () => { 
    renderer.render(scene, camera);
  };

  const onResize = ({width, height}) => {
    configureRenderer({ width, height });

    buildMap();
    buildMaze();
  }

  const goUp = () => {
    if (!map) return;
    if (playerY === 0) return;
    const nextCellValue = map[playerY-1][playerX];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerY--;
    camera.position.x -= wallThickness;

    mapDrawn = false;
  }

  const goDown = () => {
    if (!map) return;
    if (playerY === mapDimension - 1) return;
    const nextCellValue = map[playerY+1][playerX];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerY++;
    camera.position.x += wallThickness;

    mapDrawn = false;
  }

  const goLeft = () => {
    if (!map) return;
    if (playerX === 0) return;
    const nextCellValue = map[playerY][playerX-1];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerX -= 1;
    camera.position.z += wallThickness;

    mapDrawn = false;
  }

  const goRight = () => {
    if (playerX === mapDimension - 1) return;
    const nextCellValue = map[playerY][playerX+1];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerX+=1;
    camera.position.z -= wallThickness;

    mapDrawn = false;
  }

  const sketch2D = (p) => {
    const unit = width * 0.04;

    const drawPlayerPosition = () => {
      p.stroke(255, 12, 20);
      p.point(unit*(3+playerX), unit*(3+playerY));
    }

    const drawMapIfNecessary = () => {
      if (map && !mapDrawn)
      {  
        p.background(mapBackground);

        p.stroke(0);
        for (let j = 0; j < mapDimension; j++)
        {
          for (let i = 0; i < mapDimension; i++)
          {
            const cellValue = map[j][i];
            const isAWall = cellValue === 0;

            if (isAWall)
            {
              p.point(unit * (3+i), unit * (3+j));
            }
          }
        }

        drawPlayerPosition();

        mapDrawn = true;
      }
    }

    p.setup = () => {
      p.size(width, height * 0.5);
      p.strokeWeight(unit);
    }

    p.draw = () => {
      drawMapIfNecessary();
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
      <View
        style={{width, height: height * 0.5}}
      >
        <ProcessingView
          style={{width, height: height * 0.5}}
          sketch={sketch2D}
        />
        <View
          style={{
            width, height: height * 0.5,
            zIndex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            position: "absolute",
          }}
        >
          <TouchableHighlight
            style={{
              position: 'absolute',
              left: width * 0.8,
              top: height * 0.3,
            }}
            onPress={goUp}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require('./assets/up.png')}
            />
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              position: 'absolute',
              left: width * 0.8,
              top: height * 0.4,
            }}
            onPress={goDown}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require('./assets/down.png')}
            />
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              position: 'absolute',
              left: width * 0.7,
              top: height * 0.35,
            }}
            onPress={goLeft}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require('./assets/left.png')}
            />
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              position: 'absolute',
              left: width * 0.9,
              top: height * 0.35,
            }}
            onPress={goRight}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require('./assets/right.png')}
            />
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}
