describe('Setup validation', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have Office mock available', () => {
    expect(global.Office).toBeDefined();
    expect(global.Office.onReady).toBeDefined();
  });
});
