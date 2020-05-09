import React from "react";
import { Dimensions, View, Image, TouchableHighlight } from "react-native";

import { View as GraphicsView } from "expo-graphics";
import ExpoTHREE, { THREE } from "expo-three";

export default function App() {
  const mapDimension = 16;
  const wallThickness = 4;
  let scene3D, camera3D, renderer3D, gl3D, scale3D;
  let scene2D, camera2D, renderer2D, gl2D, scale2D;
  let map;
  let playerX, playerY;
  let playerPointerInMap;
  const InitialCameraX = wallThickness; // we must initially place on row 1
  const InitialCameraZ = 0;

  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;

  const reset3DScene = () => {
    scene3D = new THREE.Scene();
  };

  const reset2DScene = () => {
    scene2D = new THREE.Scene();
  };

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
    };

    const createFreeZonesForMap = () => {
      for (let i = 0; i < mapDimension; i++) map[1][i] = 1;
    };

    playerX = 0;
    playerY = 1;
    buildMapEmptyArray();
    createFreeZonesForMap();
  };

  const build3DMaze = () => {
    if (!map) return;
    for (let j = 0; j < mapDimension; j++) {
      for (let i = 0; i < mapDimension; i++) {
        const cellValue = map[j][i];
        const isAWall = cellValue === 0;

        if (isAWall) {
          let wall3D = createWallIn3DView();
          wall3D.position.x = wallThickness * j;
          wall3D.position.z = -wallThickness * i;
        }
      }
    }
  };

  const createWallIn3DView = () => {
    const geometry = new THREE.BoxGeometry(wallThickness, 16, wallThickness);
    const material = new THREE.MeshBasicMaterial({ color: 0x559641 });

    const wall = new THREE.Mesh(geometry, material);
    scene3D.add(wall);

    return wall;
  };

  const configure3DRenderer = ({ width, height }) => {
    renderer3D = new ExpoTHREE.Renderer({ gl: gl3D, pixelRatio: scale3D, width, height });
    renderer3D.setClearColor(0x000000);
    renderer3D.clear();
  };

  const configure2DRenderer = ({ width, height }) => {
    renderer2D = new ExpoTHREE.Renderer({ gl: gl2D, pixelRatio: scale2D, width, height });
    renderer2D.setClearColor(0xd18b47);
    renderer2D.clear();
  }

  const on3DContextCreate = async ({
    gl: tempGl,
    width,
    height,
    scale: pixelRatio,
  }) => {
    gl3D = tempGl;
    scale3D = pixelRatio;

    configure3DRenderer({ width, height });
    reset3DScene();

    camera3D = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera3D.position.x = InitialCameraX;
    camera3D.position.z = InitialCameraZ;

    if (map) {
      camera3D.position.x = playerY * wallThickness;
      camera3D.position.z = -playerX * wallThickness;
    } else {
      reset3DScene();
    }
    build3DMaze();
  };

  const on3DRender = () => {
    renderer3D.render(scene3D, camera3D);
  };

  const on3DResize = ({ width, height }) => {
    configure3DRenderer({ width, height });

    build3DMaze();
  };

  const goUp = () => {
    if (!map) return;
    if (playerY === 0) return;
    const nextCellValue = map[playerY - 1][playerX];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerY--;
    camera3D.position.x -= wallThickness;
    updatePlayerPositionInMap();
  };

  const goDown = () => {
    if (!map) return;
    if (playerY === mapDimension - 1) return;
    const nextCellValue = map[playerY + 1][playerX];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerY++;
    camera3D.position.x += wallThickness;
    updatePlayerPositionInMap();
  };

  const goLeft = () => {
    if (!map) return;
    if (playerX === 0) return;
    const nextCellValue = map[playerY][playerX - 1];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerX -= 1;
    camera3D.position.z += wallThickness;
    updatePlayerPositionInMap();
  };

  const goRight = () => {
    if (!map) return;
    if (playerX === mapDimension - 1) return;
    const nextCellValue = map[playerY][playerX + 1];
    const nextCellIsAWall = nextCellValue === 0;

    if (nextCellIsAWall) return;
    playerX += 1;
    camera3D.position.z -= wallThickness;
    updatePlayerPositionInMap();
  };

  const updatePlayerPositionInMap = () => {
    playerPointerInMap.position.x = wallThickness * playerX;
    playerPointerInMap.position.y = 30 - wallThickness * playerY;
  }

  const build2DMaze = () => {
    if (!map) return;
    for (let j = 0; j < mapDimension; j++) {
      for (let i = 0; i < mapDimension; i++) {
        const cellValue = map[j][i];
        const isAWall = cellValue === 0;

        if (isAWall) {
          let wall2D = createWallIn2DView();
          wall2D.position.x = wallThickness * i;
          wall2D.position.y = 30 - wallThickness * j;
        }
      }
    }

    playerPointerInMap = createWallIn2DView(0xFF0000);
    updatePlayerPositionInMap();
  };

  const createWallIn2DView = (color) => {
    const geometry = new THREE.BoxGeometry(wallThickness, wallThickness, 16);
    const material = new THREE.MeshBasicMaterial({ color: color || 0x000000 });

    const wall = new THREE.Mesh(geometry, material);
    scene2D.add(wall);

    return wall;
  };

  const on2DContextCreate = async ({
    gl: tempGl,
    width,
    height,
    scale: pixelRatio,
  }) => {
    gl2D = tempGl;
    scale2D = pixelRatio;

    configure2DRenderer({ width, height });
    reset2DScene();
    camera2D = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera2D.position.z = 25;

    build2DMaze();
  };

  const on2DRender = () => {
    renderer2D.render(scene2D, camera2D);
  };

  const on2DResize = ({ width, height }) => {
    configure2DRenderer({ width, height })
  };

  buildMap();

  return (
    <View style={{ width, height }}>
      <GraphicsView
        style={{ width, height: height * 0.5 }}
        onContextCreate={on3DContextCreate}
        onRender={on3DRender}
        onResize={on3DResize}
      />
      <View style={{ width, height: height * 0.5 }}>
        <GraphicsView
          style={{ width, height: height * 0.5 }}
          onContextCreate={on2DContextCreate}
          onRender={on2DRender}
          onResize={on2DResize}
        />
        <View
          style={{
            width,
            height: height * 0.5,
            zIndex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            position: "absolute",
          }}
        >
          <TouchableHighlight
            style={{
              position: "absolute",
              left: width * 0.8,
              top: height * 0.3,
            }}
            onPress={goUp}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require("./assets/up.png")}
            />
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              position: "absolute",
              left: width * 0.8,
              top: height * 0.4,
            }}
            onPress={goDown}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require("./assets/down.png")}
            />
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              position: "absolute",
              left: width * 0.7,
              top: height * 0.35,
            }}
            onPress={goLeft}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require("./assets/left.png")}
            />
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              position: "absolute",
              left: width * 0.9,
              top: height * 0.35,
            }}
            onPress={goRight}
          >
            <Image
              style={{ width: width * 0.1, height: width * 0.1 }}
              source={require("./assets/right.png")}
            />
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}
