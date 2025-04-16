# Singbox Configurator

[![Version](https://img.shields.io/github/package-json/v/SMZ70/singbox-configurator)](https://github.com/SMZ70/singbox-configurator)
[![License](https://img.shields.io/github/license/SMZ70/singbox-configurator)](https://github.com/SMZ70/singbox-configurator/blob/master/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/SMZ70/singbox-configurator/ci.yml)](https://github.com/SMZ70/singbox-configurator/actions)
[![Code Coverage](https://img.shields.io/codecov/c/github/SMZ70/singbox-configurator)](https://codecov.io/gh/SMZ70/singbox-configurator)

A web-based configuration generator for Singbox, a universal proxy platform. This tool provides a user-friendly interface to create, edit, and manage Singbox configurations without needing to write YAML manually.

## Features

- 🎨 Modern, responsive UI built with React and Tailwind CSS
- ⚡ Real-time configuration validation
- 📝 YAML configuration generation
- 🖥️ Cross-platform desktop application (Windows, macOS, Linux)
- 🐳 Docker support for easy deployment
- 🔄 Live preview of configuration changes
- 📦 Export configurations in various formats

## Screenshots

*Screenshots coming soon!*

## Project Structure

```
singbox-configurator/
├── src/                    # Source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── public/                # Static assets
├── electron/             # Electron main process code
├── docker/               # Docker-related files
│   ├── Dockerfile        # Container configuration
│   └── docker-compose.yml # Docker Compose configuration
├── assets/               # Application assets (icons, images)
├── README.md             # Project documentation
├── LICENSE               # License file
├── CHANGELOG.md          # Version history
└── CONTRIBUTING.md       # Contribution guidelines
```

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for containerized deployment)
- Git

## Getting Started

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/SMZ70/singbox-configurator.git
   cd singbox-configurator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For Electron development:
   ```bash
   npm run electron:dev
   ```

### Production Deployment

#### Desktop Application
1. Build the application:
   ```bash
   npm run electron:build
   ```
2. Find the installer in the `release` directory

#### Docker Deployment
1. Build and start the container:
   ```bash
   cd docker
   docker-compose up -d --build
   ```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes between versions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Singbox](https://github.com/SagerNet/sing-box) - The universal proxy platform
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Electron](https://www.electronjs.org/) - Build cross-platform desktop apps 