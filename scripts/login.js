const { ipcRenderer } = require('electron');

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username === "admin" && password === "1234") {
    ipcRenderer.send('login-success'); // notify main.js
  } else {
    document.getElementById('errorMsg').style.display = "block";
  }
});
