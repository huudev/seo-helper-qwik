import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import ConditionalCompile from "vite-plugin-conditional-compiler";
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';

export default defineConfig(env => {
    return {
        build: {
            emptyOutDir: false,
            sourcemap: env.mode != 'production',
            rollupOptions: {
                input: {
                    'off-screen': 'src/off-screen.ts',
                    'service-worker': 'src/service-worker.ts'
                },
                output: {
                    entryFileNames: '[name].js'
                },
                plugins: [tsConfigPaths()]
            }
        },
        plugins: [tsconfigPaths(), ConditionalCompile()],
        preview: {
            headers: {
                'Cache-Control': 'public, max-age=600',
            },
        },
    };
});
