import path from "path";
import commonjs from 'vite-plugin-commonjs';
import eslint from 'vite-plugin-eslint';



export default {
    root: './app',
    resolve: {
        alias: {
            '@parent': path.resolve(__dirname, '../'),
        },
    },
    base: './',
    build: {
        minify: false,
        cssMinify: false,
        target: "es6"
    },
    plugins: [
        // passing string type Regular expression
        commonjs({
                filter(id) {
                    // `node_modules` is exclude by default, so we need to include it explicitly
                    // https://github.com/vite-plugin/vite-plugin-commonjs/blob/v0.7.0/src/index.ts#L125-L127
                    if (id.includes('node_modules/')) {
                        return true
                    }
                }
            }
        ),
        eslint({
            exclude: ['**/node_modules/**', 'dist/**', '**/mdPickers/**']
        }
        )
    ]
}
