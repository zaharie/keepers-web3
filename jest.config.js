module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
};
