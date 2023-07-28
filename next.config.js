module.exports = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};
