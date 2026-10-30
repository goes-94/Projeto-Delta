/** @type {import('next').NextConfig} */
const nextConfig = {
  watchOptions: {
    poll: 1000,           // Verifica mudanças a cada 1 segundo
    aggregateTimeout: 300 // Agrupa mudanças em 300ms para reduzir recarregamentos
  },
};

module.exports = nextConfig;
