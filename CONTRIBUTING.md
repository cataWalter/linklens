# Contributing to LinkLens

Thank you for your interest in contributing to LinkLens! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write or update tests as needed
5. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/linklens.git
cd linklens

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

## Code Style

- **Rust**: Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- **TypeScript/React**: Use ESLint and Prettier configurations
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

## Running Tests

```bash
# Frontend tests
npm run test

# Backend tests
cd src-tauri && cargo test

# E2E tests
npm run test:e2e
```

## Adding a New Language Parser

1. Add the tree-sitter grammar to `Cargo.toml`
2. Create a new parser file in `src-tauri/src/parser/`
3. Register the parser in `mod.rs`
4. Add tests for the new parser

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the CHANGELOG.md if applicable
5. Request review from maintainers

## Reporting Issues

When reporting issues, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- System information (OS, Rust version, Node version)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
