# rl-loadout-lib

[![CircleCI][circleci]][circleci-url]
[![NPM package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]
[![Language Grade][lgtm]][lgtm-url]
[![Discord][discord]][discord-url]

[circleci]: https://circleci.com/gh/Longi94/rl-loadout-lib/tree/master.svg?style=svg
[circleci-url]: https://circleci.com/gh/Longi94/rl-loadout-lib/tree/master
[npm]: https://img.shields.io/npm/v/rl-loadout-lib
[npm-url]: https://www.npmjs.com/package/rl-loadout-lib
[build-size]: https://badgen.net/bundlephobia/minzip/rl-loadout-lib
[build-size-url]: https://bundlephobia.com/result?p=rl-loadout-lib
[lgtm]: https://img.shields.io/lgtm/grade/javascript/github/Longi94/rl-loadout-lib.svg?label=code%20quality
[lgtm-url]: https://lgtm.com/projects/g/Longi94/rl-loadout-lib/
[discord]: https://img.shields.io/discord/609050910731010048.svg?colorB=7581dc&logo=discord&logoColor=white
[discord-url]: https://discord.gg/c8cArY9

Load Rocket League assets into three.js. This library is closely tied with [Rocket Loadout](https://github.com/Longi94/rl-loadout) as the code was originally part of it. It uses GLTF models and TGA textures created and stored for the website.

## Quick start

```bash
npm install rl-loadout-lib
```

Models are DRACO compressed, you must provide the [decoder](https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco).

```typescript
import { Scene } from 'three';
import { RocketAssetManager, RocketConfig, PaintConfig } from 'rl-loadout-lib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// You must provide the GLTFLoader to avoid issues with multiple instances of three.js and webgl context
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
const config = new RocketConfig(gltfLoader);

const manager = new RocketAssetManager(config);

const scene = new Scene();

async function load() {
  // Default colors (blue team)
  const paintConfig = new PaintConfig();

  // load Octane body
  const body = await manager.loadBody(23, paintConfig);
  // load OEM wheels
  const wheels = await manager.loadWheel(376, paintConfig);

  // Add the wheels to the body.
  // It will automatically create 4 wheels with the correct position and scale
  body.addWheelsModel(wheels);
 
  // Now you can add the car to the three.js scene
  scene.add(body.scene);
}
```
