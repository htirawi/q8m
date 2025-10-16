<template>
  <div class="markdown-content space-y-4">
    <component v-for="(block, index) in parsedBlocks" :key="index" :is="block.component" v-bind="block.props" />
  </div>
</template>

<script setup lang="ts">
import type { IMarkdownRendererProps as Props, IParsedBlock } from "@/types/components/common";
import { computed, ref, h } from 'vue';



const props = defineProps<Props>();

const copiedBlocks = ref<Set<number>>(new Set());



const parsedBlocks = computed(() => {
  const blocks: IParsedBlock[] = [];
  const lines = props.content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line?.trim().startsWith('```')) {
      const result = parseCodeBlock(lines, i);
      blocks.push(result.block);
      i = result.nextIndex;
      continue;
    }

    // Tables (HTML or markdown)
    if (line?.trim().startsWith('<table') || line?.trim().startsWith('|')) {
      const result = line.trim().startsWith('<table')
        ? parseHtmlTable(lines, i)
        : parseMarkdownTable(lines, i);
      if (result) {
        blocks.push(result.block);
        i = result.nextIndex;
        continue;
      }
    }

    // Headers
    if (line?.trim().startsWith('#')) {
      blocks.push(parseHeader(line));
      i++;
      continue;
    }

    // Lists
    if (line?.trim().match(/^[-*]\s/)) {
      const result = parseList(lines, i);
      blocks.push(result.block);
      i = result.nextIndex;
      continue;
    }

    // Regular paragraph
    if (line?.trim()) {
      blocks.push(parseParagraph(line));
    }
    i++;
  }

  return blocks;
});

function parseCodeBlock(lines: string[], startIndex: number) {
  const firstLine = lines[startIndex] || '';
  const language = firstLine.replace('```', '').trim() || 'code';
  const codeLines: string[] = [];
  let i = startIndex + 1;

  while (i < lines.length && !lines[i]?.trim().startsWith('```')) {
    codeLines.push(lines[i] || '');
    i++;
  }

  const blockIndex = startIndex;
  const code = codeLines.join('\n');

  return {
    block: {
      component: h('div', { class: 'group relative my-4' }, [
        // Header with language and copy button
        h('div', {
          class: 'flex items-center justify-between rounded-t-lg bg-gray-800 px-4 py-2 dark:bg-gray-900'
        }, [
          h('span', {
            class: 'text-xs font-medium uppercase tracking-wider text-gray-300'
          }, language),
          h('button', {
            class: 'rounded px-3 py-1 text-xs font-medium text-gray-300 transition-all hover:bg-gray-700 hover:text-white',
            onClick: () => copyCode(blockIndex, code),
          }, copiedBlocks.value.has(blockIndex) ? '✓ Copied!' : 'Copy'),
        ]),
        // Code content
        h('pre', {
          class: 'max-w-full overflow-x-auto rounded-b-lg bg-gray-900 p-4 text-sm dark:bg-black'
        }, [
          h('code', {
            class: 'whitespace-pre-wrap break-words font-mono text-gray-100'
          }, code),
        ]),
      ]),
      props: {},
    },
    nextIndex: i + 1,
  };
}

function parseHtmlTable(lines: string[], startIndex: number) {
  const tableLines: string[] = [];
  let i = startIndex;

  while (i < lines.length && !lines[i]?.includes('</table>')) {
    tableLines.push(lines[i] || '');
    i++;
  }
  if (i < lines.length) {
    tableLines.push(lines[i] || '');
  }

  const tableHtml = tableLines.join('\n');
  const rows = extractTableRows(tableHtml);

  if (rows.length === 0) {
    return null;
  }

  const isComparison = rows[0]?.length === 3 && rows.length > 1;

  return {
    block: {
      component: isComparison ? ComparisonTable : RegularTable,
      props: { rows },
    },
    nextIndex: i + 1,
  };
}

function parseMarkdownTable(lines: string[], startIndex: number) {
  const tableLines: string[] = [];
  let i = startIndex;

  while (i < lines.length && lines[i]?.trim().startsWith('|')) {
    tableLines.push(lines[i] || '');
    i++;
  }

  if (tableLines.length < 2) return null;

  const rows = tableLines
    .filter(line => !line.includes('---')) // Skip separator line
    .map(line =>
      line
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim())
    );

  const isComparison = rows[0]?.length === 3;

  return {
    block: {
      component: isComparison ? ComparisonTable : RegularTable,
      props: { rows },
    },
    nextIndex: i,
  };
}

function parseHeader(line: string) {
  const level = line.match(/^#+/)?.[0].length || 1;
  const text = line.replace(/^#+\s*/, '');

  const classes = {
    1: 'text-3xl font-extrabold text-gray-900 dark:text-white mb-4',
    2: 'text-2xl font-bold text-gray-900 dark:text-white mb-3',
    3: 'text-xl font-semibold text-gray-900 dark:text-white mb-2',
    4: 'text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2',
    5: 'text-base font-medium text-gray-800 dark:text-gray-100 mb-1',
    6: 'text-sm font-medium text-gray-700 dark:text-gray-200 mb-1',
  };

  return {
    component: `h${Math.min(level, 6)}`,
    props: {
      class: classes[level as keyof typeof classes] || classes[1],
      innerHTML: parseInlineFormatting(text),
    },
  };
}

function parseList(lines: string[], startIndex: number) {
  const items: string[] = [];
  let i = startIndex;

  while (i < lines.length && lines[i]?.trim().match(/^[-*]\s/)) {
    const item = lines[i]?.replace(/^[-*]\s+/, '') || '';
    items.push(item);
    i++;
  }

  return {
    block: {
      component: h('ul', { class: 'list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4' },
        items.map(item => h('li', { innerHTML: parseInlineFormatting(item) }))
      ),
      props: {},
    },
    nextIndex: i,
  };
}

function parseParagraph(line: string) {
  return {
    component: 'p',
    props: {
      class: 'mb-3 max-w-full overflow-hidden break-words leading-relaxed text-gray-700 dark:text-gray-300',
      innerHTML: parseInlineFormatting(line),
    },
  };
}

function parseInlineFormatting(text: string): string {
  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');

  // Italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  text = text.replace(/_(.+?)_/g, '<em class="italic">$1</em>');

  // Inline code: `code`
  text = text.replace(/`(.+?)`/g, '<code class="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-pink-600 dark:text-pink-400">$1</code>');

  // Links: [text](url)
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  return text;
}

function extractTableRows(html: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const cellRegex = /<t[hd][^>]*>(.*?)<\/t[hd]>/gs;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1] || '';
    const cells: string[] = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      // Robust HTML tag sanitization - iteratively remove until no tags remain
      let cellContent = cellMatch[1] || '';
      let previousContent;
      do {
        previousContent = cellContent;
        cellContent = cellContent.replace(/<[^>]+>/g, '');
      } while (cellContent !== previousContent && /<[^>]+>/.test(cellContent));

      cells.push(cellContent.trim());
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

function copyCode(blockIndex: number, code: string) {
  navigator.clipboard.writeText(code).then(() => {
    const newSet = new Set(copiedBlocks.value);
    newSet.add(blockIndex);
    copiedBlocks.value = newSet;

    setTimeout(() => {
      const updatedSet = new Set(copiedBlocks.value);
      updatedSet.delete(blockIndex);
      copiedBlocks.value = updatedSet;
    }, 2000);
  });
}

// Table Components
const ComparisonTable = (props: { rows: string[][] }) => {
  const hoveredRow = ref<number | null>(null);

  return h('div', { class: 'my-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700' }, [
    h('div', { class: 'overflow-x-auto' }, [
      h('table', { class: 'w-full' }, [
        // Header
        h('thead', [
          h('tr', { class: 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800' },
            props.rows[0]?.map((header) =>
              h('th', {
                class: 'border-b border-gray-200 dark:border-gray-700 px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white'
              }, header)
            )
          ),
        ]),
        // Body
        h('tbody',
          props.rows.slice(1).map((row, rowIndex) =>
            h('tr', {
              class: [
                'border-b border-gray-100 dark:border-gray-800 transition-all',
                hoveredRow.value === rowIndex ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50' : 'bg-white dark:bg-gray-900'
              ],
              onMouseenter: () => hoveredRow.value = rowIndex,
              onMouseleave: () => hoveredRow.value = null,
            },
              row.map((cell, cellIndex) =>
                h('td', {
                  class: [
                    'px-6 py-4 text-sm',
                    cellIndex === 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  ],
                  innerHTML: parseInlineFormatting(cell),
                })
              )
            )
          )
        ),
      ]),
    ]),
  ]);
};

const RegularTable = (props: { rows: string[][] }) => {
  const hoveredRow = ref<number | null>(null);
  const hasHeader = props.rows.length > 0;

  return h('div', { class: 'my-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700' }, [
    h('div', { class: 'overflow-x-auto' }, [
      h('table', { class: 'w-full' }, [
        // Header (first row)
        hasHeader && h('thead', [
          h('tr', { class: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700' },
            props.rows[0]?.map(header =>
              h('th', {
                class: 'border-b border-gray-200 dark:border-gray-700 px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white'
              }, header)
            )
          ),
        ]),
        // Body
        h('tbody',
          props.rows.slice(hasHeader ? 1 : 0).map((row, rowIndex) =>
            h('tr', {
              class: [
                'border-b border-gray-100 dark:border-gray-800 transition-all',
                hoveredRow.value === rowIndex ? 'bg-gray-50/80 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'
              ],
              onMouseenter: () => hoveredRow.value = rowIndex,
              onMouseleave: () => hoveredRow.value = null,
            },
              row.map((cell, cellIndex) =>
                h('td', {
                  class: [
                    'px-6 py-3 text-sm',
                    cellIndex === 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  ],
                  innerHTML: parseInlineFormatting(cell),
                })
              )
            )
          )
        ),
      ]),
    ]),
  ]);
};
</script>

<style scoped>
.markdown-content {
  @apply text-base;
}

.markdown-content :deep(a) {
  @apply text-blue-600 dark:text-blue-400 hover:underline;
}

.markdown-content :deep(code) {
  @apply rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-pink-600 dark:text-pink-400;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent p-0 text-gray-100;
}

@media (max-width: 640px) {
  .markdown-content {
    @apply text-sm;
  }

  .markdown-content :deep(pre) {
    @apply text-xs;
  }
}
</style>
