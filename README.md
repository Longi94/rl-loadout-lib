# rl-loadout-lib

![https://www.npmjs.com/package/rl-loadout-lib](https://img.shields.io/npm/v/rl-loadout-lib)

Load Rocket League assets into three.js. This library is closely tied with [Rocket Loadout](https://github.com/Longi94/rl-loadout) as the code was originally part of it. It uses GLTF models and TGA textures created and stored for the website.

## Quick start

Models are DRACO compressed, you must provide the [decoder](https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco).

```typescript
import { Scene } from 'three';
import { RocketAssetManager, RocketConfig, PaintConfig } from 'rl-loadout-lib';

const config = new RocketConfig();
config.dracoDecoderPath = '/draco/';

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
