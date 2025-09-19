const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let selectedData = {
  district: null,
  block: null,
  gramPanchayat: null
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/login.html'));
  mainWindow.webContents.setZoomFactor(1.0);
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// ✅ Handle login success
ipcMain.on('login-success', () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'district.html'));
  }
});

// ✅ Save complete district object and go to block page
ipcMain.on('district-selected', (event, district) => {
  selectedData.district = district;
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'block.html')).then(() => {
      mainWindow.webContents.send('set-district-data', district);
    });
  }
});

// ✅ Save complete block object and go to gram panchayat page
ipcMain.on('block-selected', (event, block) => {
  selectedData.block = block;
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'grampanchayat.html')).then(() => {
      mainWindow.webContents.send('set-block-data', {
        block: block,
        district: selectedData.district
      });
    });
  }
});

// ✅ Save complete gram panchayat object and send ALL data to voting page
ipcMain.on('gram-panchayat-selected', (event, gramPanchayat) => {
  selectedData.gramPanchayat = gramPanchayat;
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'voting.html')).then(() => {
      mainWindow.webContents.send('set-all-data', selectedData);
    });
  }
});

// ✅ NEW: Handle refresh requests from renderer processes
ipcMain.on('request-data-on-refresh', (event, pageType) => {
  if (!mainWindow) return;
  
  switch(pageType) {
    case 'block':
      if (selectedData.district) {
        event.sender.send('set-district-data', selectedData.district);
      }
      break;
    case 'grampanchayat':
      if (selectedData.district && selectedData.block) {
        event.sender.send('set-block-data', {
          block: selectedData.block,
          district: selectedData.district
        });
      }
      break;
    case 'voting':
      if (selectedData.district && selectedData.block && selectedData.gramPanchayat) {
        event.sender.send('set-all-data', selectedData);
      }
      break;
  }
});
// ✅ Handle sidebar navigation
ipcMain.on('navigate-to', (event, page) => {
  if (!mainWindow) return;
  switch (page) {
    case 'voting':
      mainWindow.loadFile(path.join(__dirname, 'src', 'voting.html'));
      break;
    case 'sync':
      mainWindow.loadFile(path.join(__dirname, 'src', 'sync.html'));
      break;
    case 'update':
      mainWindow.loadFile(path.join(__dirname, 'src', 'update.html'));
      break;
    case 'view':
      mainWindow.loadFile(path.join(__dirname, 'src', 'view.html'));
      break;
    case 'home':
      mainWindow.loadFile(path.join(__dirname, 'src', 'home.html'));
      break;
  }
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});