# Contributing to GymnaTech

First off, thank you for considering contributing to GymnaTech! It's people like you that make GymnaTech a great tool for the gymnastics community.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Be collaborative
- Be patient and understanding
- Focus on what is best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples
- Describe the behavior you observed and what you expected
- Include screenshots if applicable
- Include your environment details (OS, browser, versions)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- List some examples of how it would be used

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Write a clear commit message
6. Create a pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/gymnastech.git

# Navigate to the project
cd gymnastech

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up database
createdb gymnastech_scoring
cd backend
npm run migrate
npm run seed

# Start development
npm run dev
```

## Development Process

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow conventional commits:
```
feat: add new feature
fix: correct bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
perf: performance improvements
```

### Code Style

#### TypeScript/JavaScript
- Use TypeScript for type safety
- Use meaningful variable names
- Add comments for complex logic
- Follow existing formatting (use Prettier if available)

#### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Use TypeScript interfaces for props

#### Backend
- Follow RESTful conventions
- Add proper error handling
- Use async/await for asynchronous operations
- Validate all inputs

### Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

### Documentation

- Update README.md if you change functionality
- Update API_DOCUMENTATION.md for API changes
- Add inline comments for complex code
- Update SETUP.md for setup process changes

## Project Structure

```
gymnastech/
├── backend/          # Express API server
├── frontend/         # React application
├── docs/            # Additional documentation
└── tests/           # Test files
```

## Getting Help

- Check existing documentation
- Look through existing issues
- Ask questions in GitHub Discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes for significant contributions
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GymnaTech! 🏆

