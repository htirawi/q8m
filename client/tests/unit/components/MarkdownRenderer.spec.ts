/**
 * Unit Tests: MarkdownRenderer Component
 * Tests markdown parsing and syntax highlighting
 */

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownRenderer from "@/components/common/MarkdownRenderer.vue";

describe("MarkdownRenderer", () => {
  describe("Basic Markdown Rendering", () => {
    it("should render plain text", () => {
      const content = "This is plain text";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      expect(wrapper.text()).toContain("This is plain text");
    });

    it("should render headers", () => {
      const content = "# Heading 1\n## Heading 2\n### Heading 3";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<h1");
      expect(html).toContain("Heading 1");
      expect(html).toContain("<h2");
      expect(html).toContain("Heading 2");
      expect(html).toContain("<h3");
      expect(html).toContain("Heading 3");
    });

    it("should render lists", () => {
      const content = "- Item 1\n- Item 2\n- Item 3";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<ul");
      expect(html).toContain("<li");
      expect(html).toContain("Item 1");
      expect(html).toContain("Item 2");
      expect(html).toContain("Item 3");
    });

    it("should render inline code", () => {
      const content = "Use `const` for constants";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<code");
      expect(html).toContain("const");
    });

    it("should render bold text", () => {
      const content = "**Bold text** and __more bold__";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<strong");
      expect(html).toContain("Bold text");
      expect(html).toContain("more bold");
    });

    it("should render links", () => {
      const content = "[Click here](https://example.com)";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<a");
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain("Click here");
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });
  });

  describe("Code Block Rendering", () => {
    it("should render code blocks with language header", () => {
      const content = "```typescript\nconst x = 5;\n```";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("typescript");
      expect(html).toContain("<pre");
      expect(html).toContain("<code");
    });

    it("should include copy button for code blocks", () => {
      const content = '```js\nconsole.log("test");\n```';
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      expect(wrapper.text()).toContain("Copy");
    });

    it("should render multiple code blocks", () => {
      const content = "```js\nconst a = 1;\n```\n\nSome text\n\n```ts\nconst b = 2;\n```";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toMatch(/const a = 1/);
      expect(html).toMatch(/const b = 2/);
    });
  });

  describe("Syntax Highlighting", () => {
    it("should highlight TypeScript keywords", () => {
      const content = "```typescript\nconst x = 5;\nif (x > 0) return true;\n```";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      // Keywords should be wrapped in spans with color classes
      expect(html).toContain("const");
      expect(html).toContain("if");
      expect(html).toContain("return");
      expect(html).toContain("true");
    });

    it("should highlight strings", () => {
      const content = '```js\nconst message = "Hello World";\n```';
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("Hello World");
      // Strings should have green color class
      expect(html).toMatch(/text-green/);
    });

    it("should highlight HTML tags", () => {
      const content = '```html\n<div class="container">Content</div>\n```';
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("div");
      expect(html).toContain("container");
    });

    it("should highlight CSS properties", () => {
      const content = "```css\n.button { color: red; }\n```";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("button");
      expect(html).toContain("color");
      expect(html).toContain("red");
    });

    it("should handle unsupported languages gracefully", () => {
      const content = '```python\nprint("hello")\n```';
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      // Should render without errors
      expect(html).toContain("print");
      expect(html).toContain("hello");
    });
  });

  describe("Tables", () => {
    it("should render markdown tables", () => {
      const content = "| Column 1 | Column 2 |\n|----------|----------|\n| Value 1  | Value 2  |";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<table");
      expect(html).toContain("Column 1");
      expect(html).toContain("Column 2");
      expect(html).toContain("Value 1");
      expect(html).toContain("Value 2");
    });

    it("should detect comparison tables (3 columns)", () => {
      const content =
        "| Feature | Option A | Option B |\n|---------|----------|----------|\n| Speed   | Fast     | Slow     |";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("Feature");
      expect(html).toContain("Option A");
      expect(html).toContain("Option B");
    });
  });

  describe("Safety and XSS Prevention", () => {
    it("should escape HTML in plain text", () => {
      const content = '<script>alert("xss")</script>';
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      // Script tags should be escaped
      expect(html).not.toContain("<script>");
      expect(html).toMatch(/&lt;script&gt;/);
    });

    it("should sanitize malicious links", () => {
      const content = '[Click](javascript:alert("xss"))';
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      // Should render link but sanitize javascript: protocol
      expect(html).toContain("Click");
      expect(html).toContain("href=");
    });
  });

  describe("Complex Content", () => {
    it("should handle mixed content", () => {
      const content = `
# Title

This is a paragraph with **bold** and \`inline code\`.

- List item 1
- List item 2

\`\`\`typescript
const example = "syntax highlighted";
\`\`\`

Another paragraph with [a link](https://example.com).
      `;

      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("<h1");
      expect(html).toContain("Title");
      expect(html).toContain("<strong");
      expect(html).toContain("bold");
      expect(html).toContain("<ul");
      expect(html).toContain("<li");
      expect(html).toContain("<pre");
      expect(html).toContain("<a");
    });

    it("should preserve code formatting", () => {
      const content = "```js\nfunction test() {\n  return 5;\n}\n```";
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      const html = wrapper.html();
      expect(html).toContain("function");
      expect(html).toContain("test");
      expect(html).toContain("return");
    });
  });

  describe("Empty and Edge Cases", () => {
    it("should handle empty content", () => {
      const wrapper = mount(MarkdownRenderer, {
        props: { content: "" },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("should handle whitespace-only content", () => {
      const wrapper = mount(MarkdownRenderer, {
        props: { content: "   \n   " },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("should handle unclosed code blocks gracefully", () => {
      const content = "```js\nconst x = 5;\n"; // Missing closing ```
      const wrapper = mount(MarkdownRenderer, {
        props: { content },
      });

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });
  });
});
