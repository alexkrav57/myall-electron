import {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  ipcRenderer,
  Tray,
  Menu,
  nativeImage,
  dialog,
  MenuItemConstructorOptions,
  MenuItem,
  MessageChannelMain,
  session,
  shell,
  contentTracing,
} from "electron";
import * as path from "path";
import * as fs from "fs";
import os from "os";

// Use os.homedir() instead of app.getPath('home')
const homeDir = os.homedir();
const logFile = path.join(homeDir, "electron-debug.log");

// Create a simple logging function
const logToFile = (message: string) => {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
};

logToFile("=== Application starting... ===");
logToFile(`Log file location: ${logFile}`);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let contentView: BrowserView | null = null;

// Data storage setup
const userDataPath = app.getPath("userData");
const dataPath = path.join(userDataPath, "data");

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// IPC handlers for data operations
ipcMain.handle("fs-read", (event, fileName: string) => {
  try {
    const filePath = path.join(dataPath, fileName);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
});

ipcMain.handle("fs-write", (event, fileName: string, data: any) => {
  try {
    const filePath = path.join(dataPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
});

function updateTrayMenu(isVisible: boolean) {
  if (!tray) return;

  const menu = Menu.buildFromTemplate([
    {
      label: isVisible ? "Hide" : "Show",
      click: () => {
        if (isVisible) {
          mainWindow?.hide();
        } else {
          mainWindow?.show();
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
}

function createTray() {
  const iconPath = process.env.VITE_DEV_SERVER_URL
    ? path.join(__dirname, "../assets/myall16.png") // Dev path
    : path.join(process.resourcesPath, "myall16.png"); // Production path

  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip("MyAll Browser");
  updateTrayMenu(true);

  tray.on("double-click", () => {
    const isVisible = mainWindow?.isVisible() ?? false;
    if (isVisible) {
      mainWindow?.hide();
    } else {
      mainWindow?.show();
    }
    updateTrayMenu(!isVisible);
  });
}

// Disable hardware acceleration
app.disableHardwareAcceleration();

// Configure GPU settings before app is ready
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-gpu-compositing");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");

function createWindow(): void {
  const isDev = process.env.npm_lifecycle_event === "electron:dev";
  console.log("Running in dev mode:", isDev);

  // Configure session before window creation
  const ses = session.defaultSession;

  ses.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline';",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: https:;",
          "connect-src 'self' https:;",
        ].join("; "),
      },
    });
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      webSecurity: true, // Enable web security
      sandbox: true,
    },
  });

  // Handle webview creation
  app.on("web-contents-created", (event, contents) => {
    if (contents.getType() === "webview") {
      // Add permission handler
      contents.session.setPermissionRequestHandler(
        (webContents, permission, callback) => {
          callback(true);
        }
      );

      // Prevent navigation to unwanted URLs
      contents.on("will-navigate", (event, url) => {
        if (url.includes("contacts.google.com") || url.includes("hovercard")) {
          event.preventDefault();
        }
      });

      // Handle new window requests
      contents.setWindowOpenHandler(({ url }) => {
        if (
          url.includes("docs.google.com") ||
          url.includes("drive.google.com")
        ) {
          contents.loadURL(url);
        } else if (
          !url.includes("contacts.google.com") &&
          !url.includes("hovercard")
        ) {
          shell.openExternal(url);
        }
        return { action: "deny" };
      });
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
    // Reduce DevTools logging
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.executeJavaScript(
        'console.clear(); console.log("DevTools ready");'
      );
    });
  }

  console.log("Dev server URL:", process.env.VITE_DEV_SERVER_URL);
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Handle window visibility changes
  mainWindow.on("show", () => {
    updateTrayMenu(true);
  });

  mainWindow.on("hide", () => {
    updateTrayMenu(false);
  });

  // Handle the close button
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Handle IPC messages
  ipcMain.on("close-window", () => {
    mainWindow?.hide();
  });

  ipcMain.on("minimize-window", () => {
    mainWindow?.minimize();
  });

  ipcMain.on("maximize-window", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  mainWindow.on("closed", () => {
    logToFile("Window closed");
    mainWindow = null;
  });

  createTray();
}

declare global {
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}

app.isQuitting = false;

// Other command line switches
app.commandLine.appendSwitch("ignore-certificate-errors");
app.commandLine.appendSwitch("disable-site-isolation-trials");
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
app.commandLine.appendSwitch("no-sandbox");

// Disable verbose logging
app.commandLine.appendSwitch("v", "0");
app.commandLine.appendSwitch("enable-logging", "false");

// Register IPC handlers
const registerIpcHandlers = () => {
  ipcMain.handle("browser-window:create", async (event, { url }) => {
    try {
      if (contentView) {
        mainWindow?.removeBrowserView(contentView);
        contentView = null;
      }

      contentView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          webviewTag: true,
          plugins: true,
          offscreen: false,
        },
      });

      if (!mainWindow) return null;
      mainWindow.addBrowserView(contentView);

      // Enable hardware acceleration
      app.commandLine.appendSwitch("enable-features", "VaapiVideoDecoder");
      app.commandLine.appendSwitch("ignore-gpu-blacklist");
      app.commandLine.appendSwitch("enable-gpu-rasterization");
      app.commandLine.appendSwitch("enable-zero-copy");

      // Set initial bounds
      const bounds = mainWindow.getBounds();
      contentView.setBounds({
        x: 250, // Left panel width
        y: 120, // Title bar + toolbar height + extra space for overlay
        width: bounds.width - 250,
        height: bounds.height - 120, // Adjusted height
      });

      // Make sure BrowserView stays below our overlay
      contentView.webContents.setZoomFactor(1.0);
      contentView.setAutoResize({ width: true, height: true });

      // Set background color to help with visual layering
      contentView.setBackgroundColor("#ffffff");

      contentView.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Content-Security-Policy":
                "default-src * blob: data: filesystem: ws: wss: 'unsafe-inline' 'unsafe-eval';" +
                "media-src * blob: data: 'unsafe-inline';" +
                "script-src * blob: data: 'unsafe-inline' 'unsafe-eval';" +
                "style-src * blob: data: 'unsafe-inline';" +
                "img-src * blob: data: 'unsafe-inline';" +
                "font-src * blob: data: 'unsafe-inline';",
            },
          });
        }
      );

      await contentView.webContents.loadURL(url);
      return contentView.webContents.id;
    } catch (error) {
      console.error("Error creating browser view:", error);
      return null;
    }
  });

  ipcMain.handle("browser-window:load-url", async (event, { url }) => {
    try {
      if (!contentView) return;

      // Add navigation event listeners
      contentView.webContents.on("did-navigate", (event, url) => {
        mainWindow?.webContents.send("browser-view:url-changed", {
          url,
          canGoBack: contentView?.webContents.canGoBack(),
          canGoForward: contentView?.webContents.canGoForward(),
        });
      });

      await contentView.webContents.loadURL(url);
    } catch (error) {
      console.error("Error loading URL:", error);
    }
  });

  ipcMain.handle("browser-window:go-back", () => {
    if (contentView?.webContents.canGoBack()) {
      contentView.webContents.goBack();
    }
  });

  ipcMain.handle("browser-window:go-forward", () => {
    if (contentView?.webContents.canGoForward()) {
      contentView.webContents.goForward();
    }
  });

  ipcMain.handle("browser-window:reload", () => {
    contentView?.webContents.reload();
  });

  ipcMain.handle("browser-window:stop", () => {
    contentView?.webContents.stop();
  });

  ipcMain.handle("browser-window:destroy", () => {
    if (contentView) {
      mainWindow?.removeBrowserView(contentView);
      contentView = null;
    }
  });

  // Add this to the registerIpcHandlers function
  ipcMain.handle("browser-window:set-bounds", (event, { bounds }) => {
    if (!contentView || !mainWindow) return;

    contentView.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
  });

  ipcMain.handle("browser-window:get-data", async () => {
    if (!contentView) return null;

    try {
      const url = contentView.webContents.getURL();
      const title = contentView.webContents.getTitle();
      return { url, title };
    } catch (error) {
      console.error("Error getting browser view data:", error);
      return null;
    }
  });

  ipcMain.handle("browser-window:capture", async () => {
    if (!contentView) return null;
    try {
      const image = await contentView.webContents.capturePage();
      const thumbnail = image.resize({
        width: 320,
        height: 180,
        quality: "good",
      });
      return thumbnail.toDataURL();
    } catch (error) {
      console.error("Error capturing page:", error);
      return null;
    }
  });

  ipcMain.handle("browser-window:remove-item", (event, { title }) => {
    if (!mainWindow) return false;

    const response = dialog.showMessageBoxSync(mainWindow, {
      type: "question",
      buttons: ["Cancel", "Delete"],
      defaultId: 1,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete "${title}"?`,
      detail: "This action cannot be undone.",
      noLink: true,
      cancelId: 0,
    });

    return response === 1;
  });

  // ... other handlers ...
};

app.whenReady().then(() => {
  logToFile("App is ready");
  createWindow();
  registerIpcHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  logToFile("All windows closed");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuitting = true;
});

// Log any uncaught exceptions
process.on("uncaughtException", (error) => {
  logToFile(`Uncaught Exception: ${error}`);
});

// Log that we've reached the end of the file
logToFile("=== Main process file loaded ===");

// Add these handlers in your main.ts
ipcMain.handle("get-storage-path", () => {
  return path.join(app.getPath("userData"), "myall-data");
});

ipcMain.handle("read-file", async (_, filePath) => {
  return fs.promises.readFile(filePath, "utf8");
});

ipcMain.handle("write-file", async (_, filePath, data) => {
  return fs.promises.writeFile(filePath, data);
});

ipcMain.handle("file-exists", (_, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle("create-directory", (_, dirPath) => {
  return fs.promises.mkdir(dirPath, { recursive: true });
});

ipcMain.handle("delete-file", (_, filePath) => {
  return fs.promises.unlink(filePath);
});

ipcMain.handle(
  "content-view-action",
  async (event, { viewId, action, data }) => {
    const view = mainWindow?.getBrowserViews()[0];

    if (!view) {
      console.error("View not found");
      return;
    }

    switch (action) {
      case "loadURL":
        try {
          // Configure session
          const ses = view.webContents.session;

          // Clear existing handlers
          ses.webRequest.onBeforeSendHeaders(null);
          ses.webRequest.onHeadersReceived(null);

          // Set secure headers
          ses.webRequest.onHeadersReceived((details, callback) => {
            callback({
              responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy":
                  "default-src 'self' https: data: blob:; " +
                  "script-src 'self' https: 'unsafe-inline'; " +
                  "style-src 'self' https: 'unsafe-inline'; " +
                  "img-src 'self' https: data: blob:; " +
                  "connect-src 'self' https: wss: ws:;",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "SAMEORIGIN",
              },
            });
          });

          await view.webContents.loadURL(data.url, {
            userAgent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
          });
        } catch (error) {
          console.error("Error loading URL:", error);
        }
        break;
    }
  }
);
