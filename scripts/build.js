const { execSync } = require('child_process');
const path = require('path');

// Pastikan DATABASE_URL memiliki nilai fallback saat build di CI/CD (Netlify/Vercel)
// agar Prisma Generate tidak gagal jika environment variable belum diatur di dashboard
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/bazar_pos?schema=public';

console.log('🚀 [Build Script] Memulai proses build monorepo POS Bazar...');

// Deteksi runner di CI/CD (Netlify/Vercel memakai Node/npm)
function getRunner() {
  try {
    execSync('npm --version', { stdio: 'ignore' });
    return 'npm';
  } catch {
    try {
      execSync('bun --version', { stdio: 'ignore' });
      return 'bun';
    } catch {
      return 'npm';
    }
  }
}

const runner = getRunner();
console.log(`ℹ️ [Environment] Menggunakan package runner: ${runner}`);

try {
  console.log('📦 [1/2] Menjalankan Prisma Generate...');
  const prismaCmd = runner === 'bun' ? 'bunx prisma generate --schema=./server/prisma/schema.prisma' : 'npx prisma generate --schema=./server/prisma/schema.prisma';
  execSync(prismaCmd, {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Prisma client berhasil di-generate!');
} catch (error) {
  console.warn('⚠️ [Prisma Generate Warning]:', error.message);
  console.log('Melanjutkan proses build client...');
}

try {
  console.log('💻 [2/2] Membangun frontend client (Vite + React)...');
  const clientDir = path.join(__dirname, '..', 'client');
  if (runner === 'bun') {
    execSync('bun run build', {
      cwd: clientDir,
      stdio: 'inherit',
      env: process.env,
    });
  } else {
    execSync('npm install', {
      cwd: clientDir,
      stdio: 'inherit',
      env: process.env,
    });
    execSync('npm run build', {
      cwd: clientDir,
      stdio: 'inherit',
      env: process.env,
    });
  }
  console.log('🎉 [Success] Frontend client berhasil di-build ke client/dist!');
} catch (error) {
  console.error('❌ Gagal melakukan build frontend client:', error.message);
  process.exit(1);
}
