# Contributing to HackPro

First off, thank you for considering contributing to HackPro! 🎉

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

### Our Standards
- ✅ Be respectful and inclusive
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

---

## How Can I Contribute?

### 🐛 Reporting Bugs
Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### 💡 Suggesting Features
Feature suggestions are welcome! Please include:

- **Clear use case**
- **Expected behavior**
- **Potential implementation approach**
- **Mockups/wireframes** (if applicable)

### 🔧 Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linters
5. Commit your changes (see commit message guidelines below)
6. Push to your fork
7. Open a Pull Request

---

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL or Neon account
- Cloudinary account
- SMTP credentials

### Setup Steps
```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/hackpro-saas.git
cd hackpro-saas

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Run development server
npm run dev
```

### Development Workflow
```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build

# Run production build locally
npm run start
```

---

## Coding Standards

### TypeScript
- ✅ Use TypeScript for all new code
- ✅ Define proper types (avoid `any`)
- ✅ Use interfaces for object shapes
- ✅ Export types when needed by other files

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
async function getUser(id: any): Promise<any> {
  // ...
}
```

### React Components
- ✅ Use functional components
- ✅ Use TypeScript for props
- ✅ Extract reusable logic to hooks
- ✅ Keep components focused and small

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}

// ❌ Bad
export function Button({ label, onClick, variant }: any) {
  return <button onClick={onClick}>{label}</button>
}
```

### File Structure
```typescript
// API Routes
app/api/resource/route.ts

// Pages
app/page.tsx
app/resource/page.tsx

// Components
components/ui/button.tsx
components/admin/dashboard.tsx

// Utilities
lib/utils.ts
lib/resource-utils.ts

// Hooks
hooks/use-resource.ts

// Types
types/resource.ts
```

### Naming Conventions
- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

```typescript
// ✅ Good
const MAX_PARTICIPANTS = 100
interface UserProfile { }
function getUserById() { }
function UserCard() { }

// ❌ Bad
const max_participants = 100
interface user_profile { }
function GetUserById() { }
function user_card() { }
```

### Code Style
- ✅ Use 2 spaces for indentation
- ✅ Use single quotes for strings
- ✅ Add trailing commas in objects/arrays
- ✅ Use semicolons
- ✅ Keep lines under 100 characters (when reasonable)

```typescript
// ✅ Good
const user = {
  name: 'John',
  email: 'john@example.com',
}

// ❌ Bad
const user = {
  name: "John",
  email: "john@example.com"
}
```

### Comments
- ✅ Add JSDoc for public functions
- ✅ Comment complex logic
- ✅ Keep comments up-to-date
- ❌ Don't comment obvious code

```typescript
// ✅ Good
/**
 * Calculate the total score for a team
 * @param scores - Array of judge scores
 * @returns Average score rounded to 2 decimals
 */
function calculateTotalScore(scores: number[]): number {
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round((sum / scores.length) * 100) / 100
}

// ❌ Bad
// This function adds numbers
function add(a: number, b: number) {
  return a + b // return the sum
}
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Feature
feat(auth): add two-factor authentication

# Bug fix
fix(api): resolve race condition in user creation

# Documentation
docs(readme): update installation instructions

# Multiple changes
feat(organization): implement usage tracking

- Add UsageMetrics model
- Create tracking utilities
- Add API endpoints for usage data
- Update organization dashboard

Closes #123
```

### Commit Message Guidelines
- ✅ Use present tense ("add feature" not "added feature")
- ✅ Use imperative mood ("move cursor to..." not "moves cursor to...")
- ✅ Start with lowercase (after type)
- ✅ Don't end with a period
- ✅ Keep subject under 72 characters
- ✅ Reference issues in footer

---

## Pull Request Process

### Before Submitting
- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (successful)
- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Add tests if applicable

### PR Title
Follow commit message format:
```
feat(scope): add amazing feature
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Step 3

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)
- [ ] All tests pass
```

### Review Process
1. **Automated checks** must pass
2. **At least one reviewer** approval required
3. **Address feedback** from reviewers
4. **Squash commits** if needed
5. **Maintainer merges** when approved

### After Merging
- Delete your branch
- Close related issues
- Update changelog (if major change)

---

## Development Guidelines

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- user.test.ts
```

### Database Changes
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Update Prisma Client
npx prisma generate

# View database in browser
npx prisma studio
```

### API Development
- ✅ Use proper HTTP methods (GET, POST, PUT, DELETE)
- ✅ Return appropriate status codes
- ✅ Include error messages
- ✅ Validate input data
- ✅ Document API endpoints

### Security
- ✅ Never commit `.env` file
- ✅ Sanitize user input
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Validate JWT tokens
- ✅ Hash passwords properly

---

## Questions?

- 📧 Email: [support@hackpro.com](mailto:support@hackpro.com)
- 💬 Discord: [Join our server](https://discord.gg/hackpro)
- 🐛 Issues: [GitHub Issues](https://github.com/belalwws/hackpro-saas/issues)

---

Thank you for contributing to HackPro! 🙏
