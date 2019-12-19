import { expect } from 'chai';
import 'mocha';
import { getAssetUrl } from '../../src/utils/network';
import { RocketConfig, TextureFormat, TextureQuality } from '../../src/model/rocket-config';


describe('Network', () => {
  it('should not modify urls', () => {
    const config = new RocketConfig({assetHost: 'http://example.com'});
    const result = getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test.tga');
    const result2 = getAssetUrl('test/test.glb', config);
    expect(result2).to.equal('http://example.com/test/test.glb');
  });

  it('should transform png texture urls', () => {
    const config = new RocketConfig({assetHost: 'http://example.com', textureFormat: TextureFormat.PNG});
    const result = getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test.png');
  });

  it('should transform small texture urls', () => {
    const config = new RocketConfig({assetHost: 'http://example.com', textureQuality: TextureQuality.LOW});
    const result = getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test_S.tga');
  });

  it('should transform small png texture urls', () => {
    const config = new RocketConfig({
      assetHost: 'http://example.com',
      textureQuality: TextureQuality.LOW,
      textureFormat: TextureFormat.PNG
    });
    const result = getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test_S.png');
  });

  it('should transform draco model urls', () => {
    const config = new RocketConfig({
      assetHost: 'http://example.com',
      useCompressedModels: true
    });
    const result = getAssetUrl('test/test.glb', config);
    expect(result).to.equal('http://example.com/test/test.draco.glb');
  });
});
