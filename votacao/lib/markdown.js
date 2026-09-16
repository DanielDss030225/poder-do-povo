import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(text) {
  if (!text) return '';
  try {
    return marked.parse(text);
  } catch (err) {
    console.error('Error parsing markdown:', err);
    return text;
  }
}
