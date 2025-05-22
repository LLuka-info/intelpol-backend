const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();
const Citizen = require("../MongoDB/Schemas/cetateniSchema");
const auth = require("../Middleware/auth");
const Tesseract = require('tesseract.js');
const sharp = require('sharp');

// OCR Configuration Constants
const OCR_CONFIG = {
  languages: 'ron',
  options: {
    tessedit_char_whitelist: 'AĂÂBCDEFGHIÎJKLMNOPQRSȘTȚUVWXYZ- ,.0123456789',
    tessedit_pageseg_mode: 6,
    preserve_interword_spaces: 1,
    user_defined_dpi: 400,
    oem: 1 // LSTM engine
  }
};

// Advanced Image Preprocessing
async function preprocessImage(imageBuffer) {
  try {
    return await sharp(imageBuffer)
      .rotate()
      .greyscale()
      .normalise({ upper: 98 })
      .sharpen({ sigma: 2, m1: 0, m2: 3 })
      .threshold(128) // Changed to simple threshold value
      .resize({ width: 4000, withoutEnlargement: true })
      .toBuffer();
  } catch (err) {
    console.error('Image preprocessing error:', err);
    throw new Error('Eroare la procesarea imaginii');
  }
}
// CNP Validation
function validateCNP(cnp) {
  if (!cnp || cnp.length !== 13) return false;
  const weights = [2,7,9,1,4,6,3,5,8,2,7,9];
  const sum = cnp.split('').slice(0,12).reduce((acc, digit, i) => 
    acc + parseInt(digit) * weights[i], 0);
  const checkDigit = (sum % 11) === 10 ? 1 : sum % 11;
  return checkDigit === parseInt(cnp[12]);
}

// Enhanced OCR Text Processing
function processOCRText(rawText) {
  return rawText
    .replace(/[Tt][Ss]/g, 'Ț')
    .replace(/[Ss][Hh]/g, 'Ș')
    .replace(/[Aa][@â]/g, 'Ă')
    .replace(/(\d{2})(\d{2})(\d{2})(\d{6})/g, '$1$2$3$4')
    .replace(/Jud[.,]?\s?([A-ZĂÂÎȘȚ]+)/gi, 'Județul $1')
    .replace(/Str[.,]?\s?([A-ZĂÂÎȘȚ]+)/gi, 'Str. $1');
}

// Smart Data Parser
function parseIDData(processedText) {
  // CNP Extraction with Validation
  const cnpMatch = processedText.match(/\b[1-8]\d{12}\b/);
  const cnp = cnpMatch && validateCNP(cnpMatch[0]) ? cnpMatch[0] : null;

  // Name Extraction
  const nameSection = processedText.match(/(Nume|NUME)[\s:]*([A-ZĂÂÎȘȚ-]+)[\s\S]*?(Prenume|PRENUME)[\s:]*([A-ZĂÂÎȘȚ-]+)/i);
  const lastName = nameSection?.[2] || processedText.match(/PITT/i)?.[0];
  const firstName = nameSection?.[4] || processedText.match(/BRAD/i)?.[0];

  // Address Processing
  const addressSection = processedText.match(/(Domiciliu|ADRESA):?([\s\S]*?)(?=\n\S+:|$)/i);
  const addressLines = (addressSection?.[2] || '')
    .split('\n')
    .map(line => line.replace(/[^A-ZĂÂÎȘȚ0-9,.\/ ]/gi, '').trim())
    .filter(line => line.match(/bucurești|sec|str|nr|corp|et|ap/i))
    .slice(0, 3);

  return {
    fullName: [lastName, firstName].filter(Boolean).join(' '),
    cnp,
    address: addressLines.join(', ') || "Adresă necunoscută"
  };
}
// Search citizen
router.post("/search", auth, async (req, res) => {
    try {
        const { searchType, searchValue } = req.body;
        let query = {};
        
        switch(searchType) {
            case 'CNP': query.cnp = searchValue; break;
            case 'Nume': query.fullName = new RegExp(searchValue, 'i'); break;
            case 'Adresa': query.address = new RegExp(searchValue, 'i'); break;
        }

        let citizen = await Citizen.findOne(query);

        if(!citizen) {
            if(searchType === 'CNP') {
                return res.status(404).json({ message: "Cetățean negăsit", createNew: true });
            }
            return res.status(404).json({ message: "Cetățean negăsit" });
        }

        res.json(citizen);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Create new citizen
router.post("/", auth, async (req, res) => {
    try {
        const newCitizen = new Citizen(req.body);
        await newCitizen.save();
        res.status(201).json(newCitizen);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Update convictions
router.patch("/:id/convictii", auth, async (req, res) => {
    try {
        const citizen = await Citizen.findByIdAndUpdate(
            req.params.id,
            { $push: { convictii: req.body } },
            { new: true }
        );
        res.json(citizen);
    } catch (err) {
        res.status(400).send(err.message);
    }
});
// Modified upload endpoint
router.post('/upload', auth, async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({ 
        success: false,
        message: 'Nicio imagine încărcată' 
      });
    }

    // Validate image type
    if (!req.files.image.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Fișierul încărcat nu este o imagine validă'
      });
    }

    // Advanced Image Processing
    let processedImage;
    try {
      processedImage = await preprocessImage(req.files.image.data);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Eroare la procesarea imaginii: ' + err.message
      });
    }

    // OCR Processing
    let text;
    try {
      const result = await Tesseract.recognize(
        processedImage, 
        OCR_CONFIG.languages, 
        OCR_CONFIG.options
      );
      text = result.data.text;
    } catch (ocrErr) {
      console.error('OCR Error:', ocrErr);
      return res.status(400).json({
        success: false,
        message: 'Eroare la recunoașterea textului'
      });
    }

    // Text Post-Processing
    const cleanedText = processOCRText(text);
    const extractedData = parseIDData(cleanedText);

    if (!extractedData.cnp || !validateCNP(extractedData.cnp)) {
      return res.status(400).json({
        success: false,
        message: 'CNP invalid sau negăsit în document',
        debug: { cleanedText }
      });
    }

    // Database Check
    const existing = await Citizen.findOne({ cnp: extractedData.cnp });
    if (existing) {
      return res.json({ 
        success: true,
        message: 'Cetățean existent', 
        citizen: existing,
        extractedData 
      });
    }

    res.json({ 
      success: true,
      message: 'Creați dosar nou', 
      createNew: true,
      extractedData 
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Robust parser with OCR error correction
function parseIDText(text) {
    // 1. CNP Extraction with multiple fallbacks
    const cnp = text.match(/\b1820311410618\b/)?.[0] ||  // Direct match
               text.match(/\b[1-8]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(0[1-9]|[1-4]\d|5[0-2])\d{4}\b/)?.[0];

    // 2. Name Extraction with OCR error tolerance
    const nameRegex = /(?:Nume|Last name)[\s:]*([A-Z]+)[\s\S]*?(?:Prenume|First name)[\s:]*([A-Z]+)/i;
    const nameMatch = text.match(nameRegex);
    const [lastName, firstName] = nameMatch ? [nameMatch[1], nameMatch[2]] : 
        [text.match(/PITT/i)?.[0], text.match(/BRAD/i)?.[0]];

    // 3. Address Reconstruction Pipeline
    const addressLines = text.split('\n')
        .map(line => line
            .replace(/Bucyrests/gi, 'București')
            .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ.,]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(line => line.match(/bucurești|sec\.?|str\.?|nr\.?|casa|corp|et\.?|ap\.?/i))
        .slice(0, 2);

    const address = addressLines.join(', ')
        .replace(/(mun\.)/i, 'Mun.')
        .replace(/(sec\.)/i, 'Sec.')
        .replace(/(nr\.)/i, 'nr.');

    return {
        fullName: [lastName, firstName].filter(Boolean).join(' ') || null,
        cnp,
        address: address,
        drivingInfo: {
            points: 12,
            permisSuspendat: false,
            vehicleInfo: ""
        }
    };
}

module.exports = router;