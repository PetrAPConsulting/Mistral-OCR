# Mistral OCR

A simple, self-hosted web application for optical character recognition (OCR) powered by [Mistral AI's OCR API](https://mistral.ai/solutions/document-ai).

## Features

- **Document Processing**: Upload PDF files or images (JPG, PNG, GIF, BMP, TIFF, WebP) up to 20MB
- **Secure API Key Storage**: Your Mistral API key is encrypted locally in your browser using AES-256-GCM with PBKDF2 key derivation
- **Multiple Export Formats**: Download results as Markdown, JSON, and extract embedded images
- **Privacy-Focused**: All processing happens through your own proxy server - no data stored on external servers
- **Choice of models**: proxy server and frontend are prepared for choice between two models (currently Mistral OCR 2 and 3), As long as Mistral keeps the same API structure (/v1/ocr endpoint with the same request format), you can update the model identifiers in proxy-server.js:
Line 90:
`const validModels = ['mistral-ocr-2505', 'mistral-ocr-2512'];` 
- **Simple Setup**: Just two files - an HTML frontend and a Node.js proxy server

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- A [Mistral AI API key](https://console.mistral.ai/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PetrAPConsulting/Mistral-OCR.git
   cd mistral-ocr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the proxy server:
   ```bash
   npm start
   ```
2. Open web browser and open
   ```bash
   http://localhost:3001
   ```
3. Enter your Mistral API key and a password to encrypt it (the key is stored encrypted locally in your browser)

4. Select model for OCR, MistralOCR 2 is default model with API endpoint 'mistral-ocr-2505'

5. Upload a document and click "Process with OCR"
   
6. Download results in your preferred format

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Browser (HTML) │ ───► │  Proxy Server   │ ───► │  Mistral API    │
│                 │      │  (localhost)    │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

The proxy server is necessary because browsers block direct API calls to Mistral due to CORS restrictions. The proxy:
- Receives file uploads from the browser
- Forwards requests to Mistral's API
- Returns OCR results to the browser

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check - returns server status |
| `/api/upload` | POST | Upload a file to Mistral for processing |
| `/api/ocr` | POST | Process uploaded file with OCR |

## Security Considerations

- **API Key Encryption**: Your API key is encrypted using AES-256-GCM before being stored in localStorage. A password-derived key (PBKDF2, 100,000 iterations) is used for encryption.
- **Local Processing**: The proxy server runs locally - your documents are not stored anywhere.
- **Session-Based**: API keys are only decrypted into memory for the current session.

## File Structure

```
mistral-ocr/
├── index.html          # Frontend
├── Assets              # Frontend components
      └── favicon.png
      └── images.png
├── proxy-server.js     # Node.js proxy server
├── package.json        # Dependencies configuration
├── node_modules        # Installed dependencies
└── README.md           # This file
```

## Dependencies

- [Express](https://expressjs.com/) - Web server framework
- [Multer](https://github.com/expressjs/multer) - File upload handling
- [CORS](https://github.com/expressjs/cors) - Cross-origin resource sharing
- [node-fetch](https://github.com/node-fetch/node-fetch) - HTTP client for API calls
- [form-data](https://github.com/form-data/form-data) - Multipart form data handling

## License

MIT License - see [LICENSE](LICENSE) for details.

## Version

ver. 1.2.0 December 2025

## Acknowledgments

- Powered by [Mistral AI](https://mistral.ai/) OCR API
- Developed by [AP Consulting](https://www.apconsulting.cz/)
