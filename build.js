const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const distDir = 'dist';

async function build() {
    try {
        // Vercel provides env vars. We define them for client-side code.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.warn('Warning: API_KEY environment variable is not set. The app may not function correctly.');
        }
        
        // Ensure dist directory exists
        await fs.mkdir(distDir, { recursive: true });

        // Build the JS bundle
        await esbuild.build({
            entryPoints: ['index.tsx'],
            bundle: true,
            outfile: path.join(distDir, 'bundle.js'),
            minify: true,
            sourcemap: 'inline',
            target: ['es2020'],
            define: {
                'process.env.API_KEY': JSON.stringify(apiKey || ''),
            },
            loader: { '.tsx': 'tsx' },
        });

        // Read, modify, and write index.html to dist
        let htmlContent = await fs.readFile('index.html', 'utf-8');

        // Remove importmap script block
        htmlContent = htmlContent.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');

        // Update script tag to be relative for serving from dist
        htmlContent = htmlContent.replace('<script src="/dist/bundle.js"></script>', '<script src="bundle.js"></script>');
        
        // Write the modified HTML to the dist directory
        await fs.writeFile(path.join(distDir, 'index.html'), htmlContent);

        console.log('Build finished successfully. `dist` directory is ready for deployment.');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
