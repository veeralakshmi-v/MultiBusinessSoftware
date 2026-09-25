import { spawn } from 'child_process';

console.log('⚡ Starting Multi-Business Billing System Backend & Frontend processes...\n');

const server = spawn('npx', ['tsx', 'watch', 'server/index.ts'], { stdio: 'inherit', shell: true });
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  console.log('\n🛑 Shutting down processes...');
  server.kill();
  vite.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
