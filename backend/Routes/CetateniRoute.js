const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data"); // Explicitly require FormData
const sharp = require("sharp");

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // Max: 5MB

// ---- Helper Functions ----

// Extract every contiguous substring of length "len" from a string.
function extractSubstringsOfLength(str, len) {
  const substrings = [];
  for (let i = 0; i <= str.length - len; i++) {
    substrings.push(str.substring(i, i + len));
  }
  return substrings;
}

// Validate a Romanian CNP using the standard checksum algorithm.
function validateCNP(cnp) {
  if (!/^\d{13}$/.test(cnp)) return false;
  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i], 10) * weights[i];
  }
  const remainder = sum % 11;
  const controlDigit = remainder === 10 ? 1 : remainder;
  return controlDigit === parseInt(cnp[12], 10);
}

// ---- Advanced CNP Extraction from OCR Text ----
function parseIDData(text) {
  const data = {};

  console.log("Raw OCR Output:", text);

  // First, correct common OCR misreads: replace common misinterpreted characters.
  // (For example, sometimes "T" is misread instead of "8" and "I" for "1".)
  let correctedText = text.replace(/T/gi, "8").replace(/I/gi, "1");

  // --- Step 1. Try extracting candidates line by line ---
  const lines = correctedText.split("\n");
  let candidates = [];
  for (let line of lines) {
    // Remove spaces
    let cleanLine = line.replace(/\s+/g, "");
    // Look for sequences of digits in that line.
    const matches = cleanLine.match(/\d+/g);
    if (matches) {
      for (let numStr of matches) {
        // If a sequence is longer than or equal to 13 digits,
        // add every contiguous substring of length 13.
        if (numStr.length >= 13) {
          candidates.push(...extractSubstringsOfLength(numStr, 13));
        } else {
          candidates.push(numStr);
        }
      }
    }
  }

  // --- Step 2. Also consider the entire corrected text ---
  const fullCleaned = correctedText.replace(/\s+/g, "");
  const fullCandidates = extractSubstringsOfLength(fullCleaned, 13);
  candidates.push(...fullCandidates);

  // Remove duplicates.
  candidates = [...new Set(candidates)];
  console.log("Candidate number sequences:", candidates);

  // --- Step 3. Check if any candidate passes the CNP checksum test ---
  for (let cand of candidates) {
    if (cand.length === 13 && validateCNP(cand)) {
      data.cnp = cand;
      console.log("Validated CNP found:", cand);
      return data;
    }
  }

  // --- Step 4. Fallback: if no candidate validates, choose the first 13-digit candidate.
  for (let cand of candidates) {
    if (cand.length === 13) {
      data.cnp = cand;
      console.log("Using candidate (not checksum validated):", cand);
      return data;
    }
  }

  console.warn("CNP not found. Check OCR output formatting.");
  return data;
}

// ---- OCR Upload Endpoint ----
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Fișier lipsă" });
  }

  try {
    // Preprocess the image for better OCR accuracy:
    const processedImage = await sharp(req.file.buffer)
      .greyscale()
      .resize(2000, 2000, { withoutEnlargement: true })
      .modulate({ brightness: 1.2, contrast: 1.5 }) // Boost brightness & contrast
      .sharpen()
      .toBuffer();

    // Create the FormData object AFTER preprocessing:
    const formData = new FormData();
    formData.append("file", processedImage, {
      filename: "image.png",
      contentType: req.file.mimetype,
    });

    // Send image to OCR.Space API:
    const ocrRes = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: {
          apiKey: "K84008147388957",
          ...formData.getHeaders(),
        },
      }
    );

    const rawText =
      ocrRes.data.ParsedResults?.[0]?.ParsedText?.trim() || "";
    if (!rawText) {
      console.error("OCR response empty or invalid.");
      return res.status(500).json({ success: false, message: "OCR nu a returnat text" });
    }

    // Use our advanced extraction function:
    const extracted = parseIDData(rawText);

    return res.json({
      success: true,
      message: "Procesare completă",
      extractedData: extracted,
      debug: process.env.NODE_ENV === "development" ? rawText : undefined,
    });
  } catch (err) {
    console.error("OCR Processing Error:", err);
    return res.status(500).json({ success: false, message: "Eroare procesare buletin" });
  }
});

module.exports = router;
