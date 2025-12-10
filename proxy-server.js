const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

console.log('🚀 Mistral OCR Proxy Server starting...');

// Upload file to Mistral API
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing API key in headers' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📤 Uploading file: ${file.originalname} (${file.size} bytes)`);

    // Create form data for Mistral API
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });
    formData.append('purpose', 'ocr');

    // Forward to Mistral API
    const response = await fetch('https://api.mistral.ai/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Upload failed:', response.status, responseData);
      return res.status(response.status).json(responseData);
    }

    console.log('✅ File uploaded successfully:', responseData.id);
    res.json(responseData);

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Process OCR with Mistral API
app.post('/api/ocr', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const { fileId, fileType } = req.body; // Changed from signedUrl to fileId

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing API key in headers' });
    }

    console.log('🔍 Processing OCR...');
    console.log('📄 File ID:', fileId);
    console.log('📄 File type:', fileType);

    // Use file_id directly according to Mistral API docs
    const ocrRequest = {
      model: 'mistral-ocr-latest',
      document: {
        type: 'file',
        file_id: fileId  // Use file_id directly
      },
      include_image_base64: true
    };

    console.log('📤 OCR Request payload:', JSON.stringify(ocrRequest, null, 2));

    const response = await fetch('https://api.mistral.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ocrRequest)
    });

    console.log(`📊 OCR Response status: ${response.status}`);
    console.log(`📊 OCR Response headers:`, [...response.headers.entries()]);

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ OCR returned HTML instead of JSON:', htmlText.substring(0, 200));
      return res.status(500).json({ 
        error: `OCR API returned HTML instead of JSON. Status: ${response.status}` 
      });
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      const textResponse = await response.text();
      console.error('❌ Failed to parse OCR JSON response:', textResponse);
      return res.status(500).json({ 
        error: `Invalid OCR JSON response: ${textResponse.substring(0, 200)}` 
      });
    }

    if (!response.ok) {
      console.error('❌ OCR processing failed:', response.status, responseData);
      return res.status(response.status).json(responseData);
    }

    console.log('✅ OCR processing completed');
    console.log('📊 OCR result pages:', responseData.pages?.length || 0);
    res.json(responseData);

  } catch (error) {
    console.error('❌ OCR error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mistral OCR Proxy Server is running' });
});

app.listen(port, () => {
  console.log(`✅ Proxy server running at http://localhost:${port}`);
  console.log('📋 Available endpoints:');
  console.log('   POST /api/upload - Upload file to Mistral');
  console.log('   POST /api/ocr - Process OCR (uses file_id directly)');
  console.log('   GET  /health - Health check');
  console.log('');
  console.log('🌐 Open your web app and it should now work!');
  console.log('📝 Note: OCR now uses file_id directly (no signed URL step)');
});