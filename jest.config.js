module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "css"],
    moduleNameMapper: {
        // Helps avoid CSS import issues
        "\\.(css|less)$": "jest-transform-stub",
    },
    transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
    setupFiles: ["./tests/jest.setup.js"],
};
