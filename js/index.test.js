describe('restream', () => {
  it('can be imported', () => {
    const load = () => require('.'); // eslint-disable-line global-require
    expect(load).not.toThrow();
    expect(load()).toEqual(
      expect.objectContaining({
        actions: expect.any(Function),
        actionTypes: expect.any(Object),
      })
    );
  });
});
