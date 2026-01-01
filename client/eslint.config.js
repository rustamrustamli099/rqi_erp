import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'boundaries': boundaries
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        {
          "type": "domain",
          "pattern": "src/domains/*"
        },
        {
          "type": "shared",
          "pattern": "src/shared/*"
        },
        {
          "type": "shell",
          "pattern": "src/shell/*"
        },
        {
          "type": "services",
          "pattern": "src/services/*"
        },
        {
          "type": "app",
          "pattern": "src/app/*"
        },
      ]
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Architecture Rules
      "boundaries/entry-point": [
        "error",
        {
          "default": "disallow",
          "rules": [
            {
              "target": ["domain"],
              "allow": "index.{ts,tsx}",
              "message": "Domain internals are private. Import only from the public index.ts."
            },
            {
              "target": ["shared", "shell", "services", "app"],
              "allow": "**/*"
            }
          ]
        }
      ],
      "boundaries/element-types": [
        "error",
        {
          "default": "disallow",
          "rules": [
            // App Layer
            {
              "from": ["app"],
              "allow": ["shell", "domain"],
              "message": "App layer orchestrates Shell and Domains. No direct access to Shared or Services."
            },
            // Shell Layer
            {
              "from": ["shell"],
              "allow": ["domain", "shared", "services"],
              "message": "Shell can use Public Domain APIs and Shared Kernel."
            },
            // Domain Layer
            {
              "from": ["domain"],
              "allow": ["shared"],
              "message": "Domains must be isolated. Use EventBus for cross-domain communication. No direct domain-to-domain imports."
            },
            // Shared Layer
            {
              "from": ["shared"],
              "allow": ["shared"],
              "message": "Shared layer must be pure and domain-agnostic."
            },
            // Services (Infra) Layer
            {
              "from": ["services"],
              "allow": ["shared", "services"],
              "message": "Services are infrastructure only. No business domain dependencies."
            }
          ]
        }
      ],
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["src/legacy_modules_backup/*", "@/legacy_modules_backup/*"],
              "message": "Legacy modules are deprecated. Do not import from them."
            },
            {
              "group": ["src/domains/*/views/*", "src/domains/*/components/*", "@/domains/*/views/*", "@/domains/*/components/*"],
              "message": "Domain internals are private. Import only from the public index.ts."
            }
          ],
          // SAP-GRADE: Ban RequirePermission (deleted component)
          "paths": [
            {
              "name": "@/shared/components/auth/RequirePermission",
              "message": "RequirePermission is BANNED. Use resolved actions from Decision Center instead. See GEMINI.md § 4."
            }
          ]
        }
      ],
      // ═══════════════════════════════════════════════════════════════════════
      // SAP-GRADE: GEMINI CONSTITUTION ENFORCEMENT
      // Ban UI-level permission decisions in domain components
      // ═══════════════════════════════════════════════════════════════════════
      "no-restricted-syntax": [
        "error",
        // Ban: can(), hasPermission(), hasAny(), hasAll() calls in domain components
        {
          "selector": "CallExpression[callee.name='can']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call can(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.property.name='can']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call can(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.name='hasPermission']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call hasPermission(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.property.name='hasPermission']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call hasPermission(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.name='hasAny']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call hasAny(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.property.name='hasAny']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call hasAny(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.name='hasAll']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call hasAll(). Use resolved actions from Decision Center."
        },
        {
          "selector": "CallExpression[callee.property.name='hasAll']",
          "message": "GEMINI § 4 VIOLATION: UI components MUST NOT call hasAll(). Use resolved actions from Decision Center."
        }
      ]
    },
  },
)
