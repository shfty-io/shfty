# Contributing to Developer Marketplace

Thank you for your interest in contributing to Developer Marketplace! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/yourusername/developer-marketplace/issues)
- If not, create a new issue with a descriptive title and clear description
- Include steps to reproduce, expected behavior, and actual behavior
- Add screenshots if applicable

### Suggesting Features

- Check if the feature has already been suggested in the [Issues](https://github.com/yourusername/developer-marketplace/issues)
- If not, create a new issue with the label "enhancement"
- Clearly describe the feature and its potential benefits

### Pull Requests

1. Fork the repository
2. Create a new branch from `main` for your changes
3. Make your changes following our coding standards
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request to the `main` branch

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure environment variables
4. Set up Supabase using the schema in `db/schema.sql`
5. Run the development server: `npm run dev`

## Pull Request Process

1. Update the README.md or documentation with details of changes if applicable
2. Update the tests if necessary
3. The PR should work in a development environment
4. Ensure your code follows our style guidelines
5. A maintainer will review your PR and may request changes
6. Once approved, a maintainer will merge your PR

## Coding Standards

- Follow the existing code style
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused
- Write tests for new functionality

## Commit Messages

- Use clear and meaningful commit messages
- Start with a verb in the present tense (e.g., "Add feature" not "Added feature")
- Reference issue numbers when applicable (e.g., "Fix login bug, closes #123")

## Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Run tests with `npm test`

## Documentation

- Update documentation for any changed functionality
- Use clear language and examples where appropriate
- Keep documentation up to date with code changes

## Review Process

All submissions require review. We use GitHub pull requests for this purpose:

1. A maintainer will review your PR
2. They may ask for changes or clarification
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged in our release notes

Thank you for contributing to Developer Marketplace! 