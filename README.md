# Password Sync App

A secure desktop application for merging Apple and Google password exports into a unified collection.

## 🔒 Security First
- **100% Local Processing** - All data stays on your computer
- **No Internet Required** - Works completely offline
- **No Data Collection** - We never see your passwords
- **Open Source** - Full transparency

## ✨ Features
- Merge Apple Keychain and Google Password Manager exports
- Identify and resolve password conflicts
- Export in multiple formats (Apple, Google, or unified CSV)
- Beautiful, intuitive interface
- Cross-platform support

## 🚀 Quick Start

### For Mac Users:
1. Download the latest release from the [Releases](../../releases) page
2. Open the DMG file and drag the app to Applications
3. Right-click the app and select "Open" (first time only)
4. Upload your password CSV files and merge!

### Building from Source:

#### Using GitHub Actions (Recommended):
1. Fork this repository
2. Go to Actions tab in your fork
3. Click "Build Password Sync App"
4. Click "Run workflow"
5. Download the built app from artifacts

#### Local Build:
```bash
npm install
npm run build
npm run electron:build:mac
```

## 📋 How to Export Your Passwords

### From Apple (Safari/Keychain):
1. Open Safari → Preferences → Passwords
2. Click the gear icon → Export Passwords
3. Save as CSV file

### From Google:
1. Go to passwords.google.com
2. Click Settings (gear icon)
3. Click "Export passwords"
4. Download CSV file

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build:mac
```

## 📄 File Formats Supported

- **Apple CSV**: Title, URL, Username, Password, Notes, OTPAuth
- **Google CSV**: name, url, username, password
- **Unified Export**: All fields combined with source tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the [Issues](../../issues) page for common problems
- Create a new issue if you need help
- All processing is local, so your passwords are always secure

---

**Made with ❤️ for password security and convenience**