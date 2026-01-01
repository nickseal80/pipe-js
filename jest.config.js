export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[tj]s$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'ts', 'json'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};