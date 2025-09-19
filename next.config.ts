/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ปิด strict mode ชั่วคราวเพื่อ debug
  reactStrictMode: false,
  
  // ปรับ headers สำหรับ PDF
  async headers() {
    return [
      {
        source: '/api/pdf',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options', 
            value: 'SAMEORIGIN'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;