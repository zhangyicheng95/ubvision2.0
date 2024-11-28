import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    // if (label === "json") {
    //   return "./json.worker.js";
    // }
    // if (label === "typescript" || label === "javascript") {
    //   return "./ts.worker.js";
    // }
    // return "./editor.worker.js";
    return "";
  },
};
