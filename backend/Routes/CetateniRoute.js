const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");
const diff = require("deep-diff").diff;
const Citizen = require("../MongoDB/Schemas/cetateniSchema");
const AuditLog = require("../MongoDB/Schemas/istoricSchema");

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/:cnp", auth, async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ cnp: req.params.cnp });
    if (!citizen) return res.status(404).json({ message: "Cetățean negăsit" });
    res.json(citizen);
  } catch (err) {
    res.status(500).json({ message: "Eroare server" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const oldData = await Citizen.findById(req.params.id);
    const updated = await Citizen.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const changes = diff(oldData.toObject(), updated.toObject());
    if (Object.keys(changes).length > 0) {
      const auditLog = new AuditLog({
        officer: req.officer._id,
        citizen: req.params.id,
        changes: changes,
        timestamp: new Date()
      });
      await auditLog.save();
    }

    res.json(updated);
  } catch (err) {
    console.error("Eroare update:", err);
    res.status(500).json({ message: "Eroare actualizare" });
  }
});
function extractSubstringsOfLength(str, len) {
  const substrings = [];
  for (let i = 0; i <= str.length - len; i++) {
    substrings.push(str.substring(i, i + len));
  }
  return substrings;
}

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

function parseIDData(text) {
  const data = {};
  console.log("Raw OCR Output:", text);

  let correctedText = text.replace(/T/gi, "8").replace(/I/gi, "1");

  const nameRegex = /Nome.*?\n([A-Za-z]+)\s([A-Za-z]+)/i;
  const nameMatch = correctedText.match(nameRegex);
  if (nameMatch) {
    data.fullName = `${nameMatch[1]} ${nameMatch[2]}`;
  }

  const addressRegex = /Domiciliu.*?\n(.+)/i;
  const addressMatch = correctedText.match(addressRegex);
  if (addressMatch) {
    data.address = addressMatch[1].replace(/\s+/g, ' ');
  }

  const lines = correctedText.split("\n");
  let candidates = [];
  for (let line of lines) {
    let cleanLine = line.replace(/\s+/g, "");
    const matches = cleanLine.match(/\d+/g);
    if (matches) {
      for (let numStr of matches) {
        if (numStr.length >= 13) {
          candidates.push(...extractSubstringsOfLength(numStr, 13));
        } else {
          candidates.push(numStr);
        }
      }
    }
  }

  const fullCleaned = correctedText.replace(/\s+/g, "");
  const fullCandidates = extractSubstringsOfLength(fullCleaned, 13);
  candidates.push(...fullCandidates);

  candidates = [...new Set(candidates)];
  console.log("Candidate number sequences:", candidates);

  for (let cand of candidates) {
    if (cand.length === 13 && validateCNP(cand)) {
      data.cnp = cand;
      console.log("Validated CNP found:", cand);
      return data;
    }
  }

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

router.post("/upload", auth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Fișier lipsă" });
  }

  try {
    const processedImage = await sharp(req.file.buffer)
      .greyscale()
      .resize(2000, 2000, { withoutEnlargement: true })
      .modulate({ brightness: 1.2, contrast: 1.5 })
      .sharpen()
      .toBuffer();

    const formData = new FormData();
    formData.append("file", processedImage, {
      filename: "image.png",
      contentType: req.file.mimetype,
    });

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

    const rawText = ocrRes.data.ParsedResults?.[0]?.ParsedText?.trim() || "";
    if (!rawText) {
      console.error("OCR response empty or invalid.");
      return res.status(500).json({ success: false, message: "OCR nu a returnat text" });
    }

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
