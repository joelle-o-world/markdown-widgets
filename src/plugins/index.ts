import * as process from "child_process";

import { MarkdownWidgetPlugin, ParsedBlock } from "../lib";

export async function date() {
  return new Date().toString();
}

export function sh({ header, body }: ParsedBlock) {
  return new Promise((fulfil, reject) => {
    let command = header.slice(header.indexOf(" ") + 1);
    process.exec(command, (err, stdout, stderr) => {
      if (err) reject(err);
      else {
        fulfil(stdout);
      }
    });
  });
}

export default {
  date,
  sh,
} as { [firstWord: string]: MarkdownWidgetPlugin };
