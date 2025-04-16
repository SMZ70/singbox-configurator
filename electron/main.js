import { app, BrowserWindow, protocol } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // In production, load from the built files
    const indexPath = path.join(process.resourcesPath, "dist", "index.html");
    console.log("Loading index.html from:", indexPath);
    win.loadFile(indexPath).catch((err) => {
      console.error("Failed to load index.html:", err);
      // Try alternative path
      const altPath = path.join(__dirname, "../dist/index.html");
      console.log("Trying alternative path:", altPath);
      win.loadFile(altPath).catch((err) => {
        console.error("Failed to load from alternative path:", err);
      });
    });
  }

  // Open DevTools in production for debugging
  win.webContents.openDevTools();
}

// Register file protocol
app.whenReady().then(() => {
  protocol.registerFileProtocol("file", (request, callback) => {
    const url = request.url.substr(7); // Remove 'file://' prefix
    callback(decodeURI(url));
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
