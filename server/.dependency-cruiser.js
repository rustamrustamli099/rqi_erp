/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    options: {
        doNotFollow: {
            path: 'node_modules'
        },
        tsConfig: {
            fileName: 'tsconfig.json'
        },
        tsPreCompilationDeps: true
    },
    forbidden: [
        {
            name: 'no-inter-module-imports',
            severity: 'error',
            comment: 'Modules must not depend on other modules directly. Use Domain Events or Contracts.',
            from: { path: '^src/modules/([^/]+)' },
            to: {
                path: '^src/modules/([^/]+)',
                pathNot: [
                    '^src/modules/$1',
                    '^src/modules/[^/]+/contract',
                    '.+\\.module\\.(ts|js)$'
                ]
            }
        },
        {
            name: 'shared-kernel-purity',
            severity: 'error',
            comment: 'Shared Kernel must be pure.',
            from: { path: '^src/shared-kernel' },
            to: { path: '^(src/modules|src/platform)' }
        },
        {
            name: 'platform-independence',
            severity: 'error',
            comment: 'Platform cannot depend on modules.',
            from: { path: '^src/platform' },
            to: { path: '^src/modules' }
        },
        {
            name: 'domain-layer-purity',
            severity: 'error',
            comment: 'Domain layer must only depend on itself or Shared Kernel.',
            from: { path: '^src/modules/([^/]+)/domain' },
            to: {
                path: [
                    '^src/modules/$1/application',
                    '^src/modules/$1/infrastructure',
                    '^src/modules/$1/api'
                ]
            }
        },
        {
            name: 'api-layer-independence',
            severity: 'error',
            comment: 'API layer cannot be imported by inner layers.',
            from: { path: '^(src/modules/([^/]+)/(domain|application|infrastructure))' },
            to: { path: '^src/modules/$2/api' }
        }
    ]
};
