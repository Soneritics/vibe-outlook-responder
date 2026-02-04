// Mock for uuid package - generates simple unique IDs for testing
let counter = 0;

module.exports = {
  v4: () => `test-uuid-${++counter}-${Date.now()}`,
  v1: () => `test-uuid-v1-${++counter}`,
  v3: () => `test-uuid-v3-${++counter}`,
  v5: () => `test-uuid-v5-${++counter}`,
  validate: () => true,
  version: () => 4,
  NIL: '00000000-0000-0000-0000-000000000000',
  MAX: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
};
