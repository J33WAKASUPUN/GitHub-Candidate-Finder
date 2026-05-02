module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Ignore the compiled 'dist' folder so it doesn't run tests twice
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Tell Jest that imports ending in .js should look for .ts files during testing
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        // Silence that isolatedModules warning
        isolatedModules: true, 
      },
    ],
  },
};