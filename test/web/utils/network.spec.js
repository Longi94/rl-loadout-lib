describe('Network', () => {
  it('should not modify urls', () => {
    const config = new RL.RocketConfig({assetHost: 'http://example.com'});
    const result = RL.getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test.tga');
    const result2 = RL.getAssetUrl('test/test.glb', config);
    expect(result2).to.equal('http://example.com/test/test.glb');
  });

  it('should transform png texture urls', () => {
    const config = new RL.RocketConfig({
      assetHost: 'http://example.com',
      textureFormat: RL.TextureFormat.PNG
    });
    const result = RL.getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test.png');
  });

  it('should transform small texture urls', () => {
    const config = new RL.RocketConfig({
      assetHost: 'http://example.com',
      textureQuality: RL.TextureQuality.LOW
    });
    const result = RL.getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test_S.tga');
  });

  it('should transform small png texture urls', () => {
    const config = new RL.RocketConfig({
      assetHost: 'http://example.com',
      textureQuality: RL.TextureQuality.LOW,
      textureFormat: RL.TextureFormat.PNG
    });
    const result = RL.getAssetUrl('test/test.tga', config);
    expect(result).to.equal('http://example.com/test/test_S.png');
  });

  it('should transform draco model urls', () => {
    const config = new RL.RocketConfig({
      assetHost: 'http://example.com',
      useCompressedModels: true
    });
    const result = RL.getAssetUrl('test/test.glb', config);
    expect(result).to.equal('http://example.com/test/test.draco.glb');
  });
});
