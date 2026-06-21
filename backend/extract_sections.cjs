const fs = require('fs');

const adminFilePath = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\2d212596-f3cf-435c-ac88-5662fb002ce4\\.system_generated\\steps\\4772\\content.md';

if (fs.existsSync(adminFilePath)) {
  const content = fs.readFileSync(adminFilePath, 'utf8');
  
  const sections = [
    'Name, pricing & stock',
    'Image & product flags',
    'Add New Product',
    'e.g. A2 Gir Cow Ghee'
  ];
  
  sections.forEach(sec => {
    console.log(`\n================== SECTION: ${sec} ==================`);
    const idx = content.indexOf(sec);
    if (idx !== -1) {
      const start = Math.max(0, idx - 400);
      const end = Math.min(content.length, idx + sec.length + 1200);
      console.log(content.slice(start, end).replace(/\s+/g, ' '));
    } else {
      console.log(`Not found: ${sec}`);
    }
  });
} else {
  console.log("Admin file not found");
}
