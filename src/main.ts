import { transformBlocks } from "./lib";
import plugins from "./plugins";

const fs = require("fs");

const data = fs.readFileSync(0, "utf-8");

transformBlocks(data, plugins).then((result) => console.log(result));
