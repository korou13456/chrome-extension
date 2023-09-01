module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        chrome: true,
    },
    // parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            globalReturn: false,
        },
        ecmaVersion: 13,
        sourceType: 'module',
        requireConfigFile: false,
        allowImportExportEverywhere: false,
    },
    plugins: ['react', 'eslint-plugin-react', 'eslint-plugin-react-hooks'],
};
