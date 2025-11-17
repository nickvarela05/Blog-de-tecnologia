const esbuild = require('esbuild');

// Vercel fornece variáveis de ambiente durante o processo de build.
// Nós as definimos aqui para substituir `process.env.API_KEY` no código do lado do cliente.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn('Aviso: A variável de ambiente API_KEY não está definida. O aplicativo pode não funcionar corretamente.');
}

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: true,
  sourcemap: 'inline',
  target: ['es2020'], // Alvo de navegadores modernos
  define: {
    'process.env.API_KEY': JSON.stringify(apiKey || ''),
  },
  loader: { '.tsx': 'tsx' },
}).catch(() => process.exit(1));
