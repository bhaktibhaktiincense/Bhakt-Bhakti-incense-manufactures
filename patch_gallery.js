import fs from 'fs';
let code = fs.readFileSync('src/pages/Gallery.tsx', 'utf8');

code = code.replace(
  /backgroundImage: 'url.*'/,
  'backgroundImage: \'url("data:image/svg+xml,%3Csvg width=\\\'60\\\' height=\\\'60\\\' viewBox=\\\'0 0 60 60\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cg fill=\\\'none\\\' fill-rule=\\\'evenodd\\\'%3E%3Cg fill=\\\'%23d4ac0d\\\' fill-opacity=\\\'1\\\'%3E%3Cpath d=\\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")\''
);

fs.writeFileSync('src/pages/Gallery.tsx', code);
console.log("Patched Gallery.tsx");
