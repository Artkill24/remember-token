#!/bin/bash

# REMEMBER TOKEN - POPULATE ALL FILES SCRIPT
# This script creates all files with their content

echo "🎂 Populating Remember Token files..."

# Create README.md
cat > README.md << 'EOF'
# 🎂 Remember Token ($RMEM)

**Get Paid for Remembering What Matters to People**

The first blockchain platform that rewards human care and connection. Earn $RMEM tokens every time you remember something important for someone else - birthdays, anniversaries, job interviews, medical appointments, and more.

## 🎯 Concept

In a world where we're increasingly disconnected, **Remember Token** incentivizes the most meaningful human behavior: **remembering what matters to others**.

- 📅 Friend has job interview → You remember to wish good luck → Earn $RMEM
- 🎂 Mom's birthday → You call her → Earn $RMEM  
- 💊 Grandpa's doctor appointment → You check in → Earn $RMEM
- 💑 Couple's anniversary → You congratulate them → Earn $RMEM

## 🚀 Why It Works

- ✅ **Universal Appeal**: Everyone has important dates
- ✅ **Emotional Impact**: Memory = Love and Care
- ✅ **Network Effects**: More relationships = more opportunities  
- ✅ **Impossible to Game**: Requires genuine relationships
- ✅ **Viral by Design**: People love sharing when someone cares

## 💰 Token Economics

### $RMEM Token Distribution
- **Community Rewards**: 60% (600M tokens)
- **Team & Development**: 15% (150M tokens)  
- **Partnerships**: 10% (100M tokens)
- **Treasury**: 10% (100M tokens)
- **Liquidity**: 5% (50M tokens)

### Earning Structure
```
Birthday Memory: 10 $RMEM
Anniversary: 15 $RMEM  
Job Interview: 20 $RMEM
Medical Appointment: 25 $RMEM
Major Life Event: 30 $RMEM
Pet Birthday: 8 $RMEM
```

## 🛠️ Technical Stack

- **Blockchain**: Base (Ethereum L2)
- **Smart Contracts**: Solidity
- **Frontend**: React + Web3
- **Mobile**: React Native  
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Notifications**: Push notifications + Email

## 🏗️ Development Roadmap

### Phase 1: MVP (Month 1-2)
- [x] Smart contract development
- [x] Basic web app
- [ ] Memory verification system
- [ ] Token minting mechanism

### Phase 2: Beta (Month 3-4)  
- [ ] Mobile app (iOS/Android)
- [ ] Social features
- [ ] Gift integration
- [ ] Beta testing with 1000 users

### Phase 3: Launch (Month 5-6)
- [ ] Public token launch
- [ ] Marketing campaign  
- [ ] Partnership integrations
- [ ] Viral growth features

### Phase 4: Scale (Month 7-12)
- [ ] Corporate programs
- [ ] Healthcare integration
- [ ] AI memory assistance
- [ ] Global expansion

## 📱 How It Works

1. **Add Memory**: Someone tells you about an important upcoming event
2. **Get Reminder**: App reminds you when the day approaches  
3. **Take Action**: You reach out (call, text, visit, gift)
4. **Verify**: The person confirms they received your care
5. **Earn Tokens**: You receive $RMEM based on event importance

## 🌐 Live Demo

Visit: [project-block.com](https://project-block.com)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- **Website**: [project-block.com](https://project-block.com)
- **Whitepaper**: [docs/whitepaper.md](docs/whitepaper.md)
- **Tokenomics**: [docs/tokenomics.md](docs/tokenomics.md)
- **Discord**: Coming Soon
- **Twitter**: Coming Soon

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💝 Mission

*"In a world that's forgetting how to care, Remember Token rewards those who remember."*

---

**Made with ❤️ by the Remember Token Team**

*Building technology that brings humanity back to human connection.*
EOF

echo "✅ README.md created"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "remember-token",
  "version": "1.0.0",
  "description": "🎂 Get paid for remembering what matters to people - The first blockchain platform that rewards human care and connection",
  "main": "index.js",
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "test": "hardhat test",
    "compile": "hardhat compile",
    "deploy:base-testnet": "hardhat run scripts/deploy.js --network base-goerli",
    "deploy:base-mainnet": "hardhat run scripts/deploy.js --network base-mainnet",
    "verify": "hardhat verify --network base-goerli",
    "start": "node server/index.js",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write .",
    "deploy-frontend": "cd frontend && npm run build && gh-pages -d dist",
    "setup": "npm install && cd frontend && npm install"
  },
  "keywords": [
    "blockchain",
    "cryptocurrency",
    "base-chain",
    "social",
    "memory",
    "care",
    "connection",
    "web3",
    "dapp",
    "defi",
    "social-fi"
  ],
  "author": "Remember Token Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/remember-token.git"
  },
  "homepage": "https://project-block.com",
  "bugs": {
    "url": "https://github.com/yourusername/remember-token/issues"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^3.0.0",
    "@nomicfoundation/hardhat-verify": "^1.0.0",
    "@openzeppelin/contracts": "^4.9.0",
    "hardhat": "^2.17.0",
    "hardhat-gas-reporter": "^1.0.9",
    "solidity-coverage": "^0.8.0",
    "eslint": "^8.0.0",
    "prettier": "^2.8.0",
    "prettier-plugin-solidity": "^1.1.0",
    "gh-pages": "^6.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ethers": "^6.7.0",
    "web3": "^4.0.0",
    "axios": "^1.5.0",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.0",
    "node-cron": "^3.0.2",
    "multer": "^1.4.5",
    "helmet": "^7.0.0",
    "rate-limiter-flexible": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

echo "✅ package.json created"

# Create .env.example
cat > .env.example << 'EOF'
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Base Chain RPC URLs (optional - defaults provided in hardhat.config.js)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_GOERLI_RPC_URL=https://goerli.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Contract Addresses (filled after deployment)
REMEMBER_TOKEN_CONTRACT=
MEMORY_VERIFICATION_CONTRACT=

# API Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/remember-token
DATABASE_NAME=remember_token

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# External APIs
COINMARKETCAP_API_KEY=your_cmc_api_key_for_gas_reporter
INFURA_API_KEY=your_infura_key_if_needed
ALCHEMY_API_KEY=your_alchemy_key_if_needed

# Frontend Configuration
VITE_BASE_CHAIN_ID=8453
VITE_BASE_TESTNET_CHAIN_ID=84531
VITE_CONTRACT_ADDRESS=
VITE_API_BASE_URL=http://localhost:3000/api
EOF

echo "✅ .env.example created"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*/dist/
*/build/
out/

# Hardhat
artifacts/
cache/
coverage/
typechain/
typechain-types/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov
.nyc_output

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/
web_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# Local Netlify folder
.netlify
EOF

echo "✅ .gitignore created"

echo "🎉 All files populated! Run 'ls -la' to see your complete project structure"