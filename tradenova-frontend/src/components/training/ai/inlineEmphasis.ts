export type InlineEmphasisToken = {
  text: string;
  emphasized: boolean;
};

export function parseInlineEmphasis(value: string): InlineEmphasisToken[] {
  const tokens: InlineEmphasisToken[] = [];
  const pattern = /\*\*(.+?)\*\*/gs;
  let cursor = 0;

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({ text: value.slice(cursor, index), emphasized: false });
    }
    tokens.push({ text: match[1], emphasized: true });
    cursor = index + match[0].length;
  }

  if (cursor < value.length || tokens.length === 0) {
    tokens.push({ text: value.slice(cursor), emphasized: false });
  }

  return tokens;
}
