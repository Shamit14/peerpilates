import React from 'react';

/**
 * Parse markdown-like text and convert to formatted JSX
 * Handles: **bold**, *italic*, `code`, headers, lists, etc.
 */
export function parseMarkdown(text) {
  if (!text) return null;
  
  // Split by lines for processing
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'
  let currentIndex = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          React.createElement('ol', {
            key: `ol-${currentIndex}`,
            className: 'list-decimal list-inside space-y-1 my-2 ml-2'
          }, listItems)
        );
      } else {
        elements.push(
          React.createElement('ul', {
            key: `ul-${currentIndex}`,
            className: 'list-disc list-inside space-y-1 my-2 ml-2'
          }, listItems)
        );
      }
      listItems = [];
      listType = null;
    }
  };

  const formatInlineText = (text, keyPrefix) => {
    // Process inline formatting: **bold**, *italic*, `code`
    const parts = [];
    let remaining = text;
    let partIndex = 0;

    while (remaining.length > 0) {
      // Check for bold **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Check for inline code `text`
      const codeMatch = remaining.match(/`(.+?)`/);

      // Find the earliest match
      let earliestMatch = null;
      let matchType = null;
      let matchIndex = Infinity;

      if (boldMatch && remaining.indexOf(boldMatch[0]) < matchIndex) {
        matchIndex = remaining.indexOf(boldMatch[0]);
        earliestMatch = boldMatch;
        matchType = 'bold';
      }
      if (codeMatch && remaining.indexOf(codeMatch[0]) < matchIndex) {
        matchIndex = remaining.indexOf(codeMatch[0]);
        earliestMatch = codeMatch;
        matchType = 'code';
      }

      if (earliestMatch) {
        // Add text before the match
        if (matchIndex > 0) {
          parts.push(React.createElement('span', { key: `${keyPrefix}-${partIndex++}` }, remaining.slice(0, matchIndex)));
        }

        // Add the formatted element
        if (matchType === 'bold') {
          parts.push(React.createElement('strong', { key: `${keyPrefix}-${partIndex++}`, className: 'font-semibold' }, earliestMatch[1]));
        } else if (matchType === 'code') {
          parts.push(React.createElement('code', { key: `${keyPrefix}-${partIndex++}`, className: 'bg-gray-200 px-1 rounded text-sm font-mono' }, earliestMatch[1]));
        }

        remaining = remaining.slice(matchIndex + earliestMatch[0].length);
      } else {
        // No more matches, add remaining text
        if (remaining) {
          parts.push(React.createElement('span', { key: `${keyPrefix}-${partIndex++}` }, remaining));
        }
        break;
      }
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines but add spacing
    if (!trimmedLine) {
      flushList();
      elements.push(React.createElement('div', { key: `space-${index}`, className: 'h-2' }));
      return;
    }

    // Headers (## or **Header:** at start of line)
    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        React.createElement('h3', { key: `h3-${index}`, className: 'font-bold text-lg mt-3 mb-1' },
          formatInlineText(trimmedLine.slice(3), `h3-${index}`)
        )
      );
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(
        React.createElement('h2', { key: `h2-${index}`, className: 'font-bold text-xl mt-3 mb-1' },
          formatInlineText(trimmedLine.slice(2), `h2-${index}`)
        )
      );
      return;
    }

    // Bold headers like **Title:** or **Title**
    if (/^\*\*[^*]+\*\*:?$/.test(trimmedLine) || /^\*\*[^*]+:\*\*$/.test(trimmedLine)) {
      flushList();
      const headerText = trimmedLine.replace(/\*\*/g, '').replace(/:$/, '');
      elements.push(
        React.createElement('h4', { key: `h4-${index}`, className: 'font-semibold text-base mt-3 mb-1' }, headerText)
      );
      return;
    }

    // Numbered list items (1. 2. 3. etc)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(
        React.createElement('li', { key: `li-${index}`, className: 'text-gray-700' },
          formatInlineText(numberedMatch[2], `li-${index}`)
        )
      );
      return;
    }

    // Bullet points (*, -, •)
    const bulletMatch = trimmedLine.match(/^[\*\-•]\s+(.+)$/);
    if (bulletMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(
        React.createElement('li', { key: `li-${index}`, className: 'text-gray-700' },
          formatInlineText(bulletMatch[1], `li-${index}`)
        )
      );
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      React.createElement('p', { key: `p-${index}`, className: 'my-1' },
        formatInlineText(trimmedLine, `p-${index}`)
      )
    );
    currentIndex++;
  });

  // Flush any remaining list items
  flushList();

  return elements;
}

export default parseMarkdown;
