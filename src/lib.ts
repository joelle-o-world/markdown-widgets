function nextLineIndex(str: string, position = 0) {
  if (position === str.length) return null;
  let i = str.indexOf("\n", position);
  if (i === -1) return null;
  else return i + 1;
}
export function* lineEnds(str: string, position = 0) {
  let i: number | null = position;
  while ((i = nextLineIndex(str, i)) !== null) yield i;
  if (i !== str.length) yield str.length;
}

/**
 * Iterate line indexes, including the zero position.
 */
export function* iterateBlocks(str: string) {
  let start = 0;
  let blockStart = null;
  for (let end of lineEnds(str)) {
    if (str[start] === "§" && str[start + 1] === " ") {
      blockStart = blockStart === null ? start : blockStart;
    } else if (blockStart !== null) {
      yield {
        block: parseBlock(str.slice(blockStart, start)),
        start: blockStart,
        end: start,
      };
      blockStart = null;
    }
    start = end;
  }
}

export function parseBlock(blockStr: string) {
  const [header, ...bodyLines] = blockStr
    .split("\n")
    .map((line) => line.slice(2));
  return {
    header,
    body: bodyLines.join("\n"),
  };
}
export type ParsedBlock = ReturnType<typeof parseBlock>;

export function rePrefixBlock({ header, body }: ParsedBlock) {
  return [header, ...body.split("\n")].map((line) => "§ " + line).join("\n");
}

export interface MarkdownWidgetPlugin {
  (black: ParsedBlock, context?: {}): Promise<string>;
}

const firstWord = (str: string) => str.slice(0, str.indexOf(" "));

export function transformBlocks(
  original: string,
  plugins: { [key: string]: MarkdownWidgetPlugin }
) {
  let promises = [];

  for (let { block, start, end } of iterateBlocks(original)) {
    let plugin = plugins[firstWord(block.header)];
    if (plugin)
      promises.push(
        plugin(block).then((transformedBody) => ({
          start,
          end,
          blockStr: rePrefixBlock({
            header: block.header,
            body: transformedBody,
          }),
        }))
      );
  }

  return Promise.all(promises).then((replacements) => {
    let lastEnd = 0;
    let bits = [];
    for (let { start, end, blockStr } of replacements) {
      bits.push(original.slice(lastEnd, start));
      bits.push(blockStr);
      lastEnd = end;
    }
    bits.push(original.slice(lastEnd));
    return bits.join("");
  });
}
