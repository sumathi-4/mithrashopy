const fs = require('fs');

const adminFilePath = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\2d212596-f3cf-435c-ac88-5662fb002ce4\\.system_generated\\steps\\4772\\content.md';

if (fs.existsSync(adminFilePath)) {
  const content = fs.readFileSync(adminFilePath, 'utf8');
  
  const idx = content.indexOf('e.g. A2 Gir Cow Ghee');
  if (idx !== -1) {
    const slice = content.slice(idx, idx + 4500);
    console.log(slice.replace(/\s+/g, ' '));
  } else {
    console.log("Anchor string not found");
  }
} else {
  console.log("Admin file not found");
}
