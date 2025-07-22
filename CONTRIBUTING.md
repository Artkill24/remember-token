# Contributing to Remember Token 🎂

Thank you for your interest in contributing to Remember Token! We're building the first blockchain platform that rewards human care and connection.

## 🌟 How to Contribute

### 1. 🐛 Report Bugs
- Use GitHub Issues
- Include steps to reproduce
- Add screenshots if applicable

### 2. 💡 Suggest Features
- Check existing issues first
- Create new issue with "Feature Request" label
- Describe the problem and solution

### 3. 🔧 Code Contributions
- Fork the repository
- Create feature branch: `git checkout -b feature/amazing-feature`
- Write tests for new functionality
- Ensure all tests pass: `npm test`
- Submit Pull Request

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- MetaMask wallet
- Base Testnet ETH

### Setup
```bash
git clone https://github.com/yourusername/remember-token.git
cd remember-token
npm run setup
cp .env.example .env
# Edit .env with your values
npm test
npm run deploy:base-testnet
