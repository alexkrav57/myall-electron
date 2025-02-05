export const generateThumbnail = async (
  webview: Electron.WebviewTag
): Promise<string> => {
  try {
    // Capture the webview content
    const nativeImage = await webview.capturePage();

    // Convert to base64 and resize
    const thumbnail = nativeImage
      .resize({ width: 160, height: 100, quality: "good" })
      .toDataURL();

    return thumbnail;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return "";
  }
};
