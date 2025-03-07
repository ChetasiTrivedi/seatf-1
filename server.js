const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_FLAG = "flag{The_Game_Is_Afoot_221B_BakerStreet}";
const ENCRYPTION_KEY = crypto.scryptSync("abcdefghijklmnopqrstuvwx", "salt", 24); // Derive 24-byte key
const XOR_KEY = 42;
const IV = Buffer.alloc(16, 0); // Fixed IV for AES

// Helper functions
const base64Encode = (text) => Buffer.from(text, "utf-8").toString("base64");
const base64Decode = (text) => Buffer.from(text, "base64").toString("utf-8");

const xorEncrypt = (text, key) =>
  text.split("").map((c) => String.fromCharCode(c.charCodeAt(0) ^ key)).join("");
const xorDecrypt = xorEncrypt;

const aesEncrypt = (text, key, iv) => {
  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Generate encrypted C++ code
const cppCode = `#include <iostream>\nusing namespace std;\nint main() { cout << 12345; return 0; }`;
let encryptedCode = xorEncrypt(cppCode, XOR_KEY);
encryptedCode = base64Encode(encryptedCode);
encryptedCode = aesEncrypt(encryptedCode, ENCRYPTION_KEY, IV);
fs.writeFileSync("nextclue.txt", encryptedCode);

// API to validate flag and return encrypted file
app.post("/validate-flag", (req, res) => {
  const { flag } = req.body;
  if (flag === SECRET_FLAG) {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=nextclue.txt");
    res.send(fs.readFileSync("nextclue.txt"));
  } else {
    res.status(403).json({ error: "Incorrect flag" });
  }
});

// API to validate final CTF answer
app.post("/validate-final", (req, res) => {
  const userCode = req.body.code;
  const correctCode = "12345"; // This should match the C++ output

  if (String(userCode) !== correctCode) {
    return res.status(403).json({ error: "Incorrect code!" });
  }

  res.json({ flag: "CTF{SHERLOCK_YOU_CRACKED_IT}" });
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
