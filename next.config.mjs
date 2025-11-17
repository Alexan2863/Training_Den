/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress source map warnings from browser extensions (React DevTools, etc.)
      // These extensions inject scripts with source map references that don't exist
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /installHook\.js/,
          message: /Failed to parse source map/,
        },
        {
          // Ignore all source map warnings for anonymous code (browser extensions)
          message: /Failed to parse source map.*anonymous/,
        },
      ];

      // Also suppress webpack dev server overlay for these warnings
      if (config.devServer) {
        config.devServer.client = {
          ...config.devServer.client,
          overlay: {
            errors: true,
            warnings: false, // Don't show warnings in overlay
          },
        };
      }
    }

    return config;
  },
};

export default nextConfig;
