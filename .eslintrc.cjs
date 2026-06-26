module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: ['./tsconfig.eslint.json', './h5/plur-film/tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['dist/', 'dist-*/', 'node_modules/', 'babel.config.js'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lucide-react-taro',
            message:
              'Import icons from @/components/icons (tree-shake + bundle audit).',
          },
          {
            name: 'lodash',
            message: 'Use native utilities; lodash is not bundled for mini program.',
          },
          {
            name: 'date-fns',
            message: 'Use dateTimeNative or dayjs in travel-plan only.',
          },
          {
            name: '@/api/aiChatActor',
            message: 'Import from @/api/requestActor instead.',
          },
        ],
        patterns: [
          {
            group: ['lucide-react-taro/*'],
            message:
              'Import icons from @/components/icons (tree-shake + bundle audit).',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['h5/plur-film/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': 'off',
        'react-hooks/exhaustive-deps': 'off',
      },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: ['src/utils/appToast.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.object.name='Taro'][callee.property.name='showToast']",
            message: 'Use showAppToast from @/utils/appToast.',
          },
        ],
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      env: { jest: true },
    },
    {
      files: ['src/components/icons/**/*.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      files: [
        'src/pages/**/*.{ts,tsx}',
        'src/packageEvent/**/*.{ts,tsx}',
        'src/packageProfile/**/*.{ts,tsx}',
        'src/components/event/**/*.{ts,tsx}',
        'src/components/navigation/**/*.{ts,tsx}',
        'src/components/auth/**/*.{ts,tsx}',
        'src/app.tsx',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'lucide-react-taro',
                message:
                  'Import icons from @/components/icons (tree-shake + bundle audit).',
              },
              {
                name: 'lodash',
                message: 'Use native utilities; lodash is not bundled for mini program.',
              },
              {
                name: 'date-fns',
                message: 'Use dateTimeNative or dayjs in travel-plan only.',
              },
              {
                name: '@/api/aiChatActor',
                message: 'Import from @/api/requestActor instead.',
              },
            ],
            patterns: [
              {
                group: ['lucide-react-taro/*'],
                message:
                  'Import icons from @/components/icons (tree-shake + bundle audit).',
              },
              {
                group: [
                  '@/domains/*/hooks/*',
                  '@/domains/*/components/*',
                  '@/domains/*/utils/*',
                ],
                message: 'Import from @/domains/<domain> barrel (no hooks/components/utils deep paths).',
              },
            ],
          },
        ],
      },
    },
  ],
};
