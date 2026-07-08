const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies["xlsx"] = "https://cdn.sheetjs.com/xlsx-0.20.1/xlsx-0.20.1.tgz";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
