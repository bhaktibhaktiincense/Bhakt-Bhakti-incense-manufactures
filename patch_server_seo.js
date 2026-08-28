import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const target = `  if (process.env.NODE_ENV !== "production") {`;

const replacement = `  // Explicitly serve sitemap.xml to prevent SPA fallback interception
  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    const filePath = process.env.NODE_ENV !== "production" 
      ? path.join(process.cwd(), "public", "sitemap.xml")
      : path.join(process.cwd(), "dist", "sitemap.xml");
    res.sendFile(filePath);
  });

  // Explicitly serve robots.txt to prevent SPA fallback interception
  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    const filePath = process.env.NODE_ENV !== "production" 
      ? path.join(process.cwd(), "public", "robots.txt")
      : path.join(process.cwd(), "dist", "robots.txt");
    res.sendFile(filePath);
  });

  if (process.env.NODE_ENV !== "production") {`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with explicit SEO static routes");
