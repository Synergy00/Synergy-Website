/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Production-grade HTTP security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Enable XSS protection in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Force HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Restrict referrer info leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy (disable unused browser APIs)
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Content Security Policy — blocks XSS, restricts script sources
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co",
              "frame-src https://docs.google.com https://drive.google.com https://canva.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
