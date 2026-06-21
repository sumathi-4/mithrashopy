const http = require('http');

http.get('http://127.0.0.1:5000/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('API PRODUCTS RESPONSE:');
      if (parsed.products) {
        parsed.products.forEach(p => {
          console.log(`- ID: ${p.id}, Name: ${p.name}, Image: ${p.image}, Images: ${JSON.stringify(p.images)}, Variants count: ${p.variants ? p.variants.length : 0}`);
          if (p.variants) {
            p.variants.forEach((v, idx) => {
              console.log(`  Var ${idx}: color=${v.color}, size=${v.size}, image=${v.image}`);
            });
          }
        });
      } else {
        console.log('No products array in response:', parsed);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
