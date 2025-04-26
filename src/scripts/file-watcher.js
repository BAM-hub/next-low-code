const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

const dirToWatch = path.resolve(__dirname, "../components/serverElements");
const clientDir = path.resolve(__dirname, "../components/elements");

const serverComponents = fs.readdirSync(dirToWatch).map((value) => ({
  name: value,
  isServer: true,
}));

const clientComponents = fs.readdirSync(clientDir).map((value) => ({
  name: value,
  isServer: false,
}));

const initialFiles = [...serverComponents, ...clientComponents];

fetch("http://localhost:3000/api/admin/ui/availableComponents").then((res) => {
  console.log(
    "will watch for changes in ../components/serverElements",
    initialFiles
  );
  fetch("http://localhost:3000/api/admin/ui/availableComponents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(initialFiles),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("response from server", data);
    });

  chokidar
    .watch([dirToWatch, clientDir], {
      persistent: true,
      ignoreInitial: true,
    })
    .on("add", (event, path) => {
      console.log("asas", event, path);
    });

  chokidar
    .watch([dirToWatch, clientDir], {
      persistent: true,
      ignoreInitial: true,
    })
    .on("unlink", (event, path) => {
      console.log("asas", event, path);
    });
});
