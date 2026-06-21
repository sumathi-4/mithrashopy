const fs = require('fs');
const path = require('path');

const adminFilePath = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\2d212596-f3cf-435c-ac88-5662fb002ce4\\.system_generated\\steps\\4772\\content.md';
const userFilePath = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\2d212596-f3cf-435c-ac88-5662fb002ce4\\.system_generated\\steps\\4780\\content.md';

function searchFile(filePath, regexList, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`${label} file does not exist.`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n================== ${label} ==================`);
  for (const re of regexList) {
    console.log(`\n--- Matches for ${re.source} ---`);
    let match;
    let count = 0;
    while ((match = re.exec(content)) !== null && count < 15) {
      count++;
      // Print context of match (100 chars before and after)
      const start = Math.max(0, match.index - 80);
      const end = Math.min(content.length, match.index + match[0].length + 150);
      console.log(`[${count}] ... ${content.slice(start, end).replace(/\n/g, ' ')} ...`);
    }
  }
}

// Search queries
const queries = [
  /add\s*product/i,
  /variants/i,
  /category/i,
  /attributes/i,
  /description/i,
  /placeholder=/i,
  /ghee|honey|spices/i,
  /form/i,
  /discount/i,
  /sku/i
];

searchFile(adminFilePath, queries, 'ADMIN HUB');
searchFile(userFilePath, queries, 'USER WEBSITE');
