const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const pngToIco = require("png-to-ico");

async function createIcons() {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngPaths = []; // Store PNG file paths instead of buffers

  // Source SVG
  const inputSvg = path.join(__dirname, "../assets/myall64.svg");

  // Ensure public directory exists
  const publicDir = path.join(__dirname, "../public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Create and save PNGs for each size
  for (const size of sizes) {
    const pngPath = path.join(publicDir, `icon-${size}.png`);
    await sharp(inputSvg).resize(size, size).png().toFile(pngPath);
    pngPaths.push(pngPath);
  }

  // Save the tray icon (16x16)
  fs.copyFileSync(
    path.join(publicDir, "icon-16.png"),
    path.join(publicDir, "icon.png")
  );

  // Create ICO file from the PNG files
  try {
    console.log("Creating ICO file...");
    const icoBuffer = await pngToIco(pngPaths);
    const icoPath = path.join(publicDir, "icon.ico");
    fs.writeFileSync(icoPath, icoBuffer);
    console.log("ICO file created at:", icoPath);
  } catch (error) {
    console.error("Error creating ICO file:", error);
  }

  console.log("Icons created successfully!");
}

createIcons().catch((err) => {
  console.error("Error creating icons:", err);
  process.exit(1);
});
