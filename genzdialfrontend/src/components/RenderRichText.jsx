// Render plain text with light markdown-style conventions:
// - Lines starting with "# " become section headings (h2)
// - Lines starting with "- " become bullet list items
// - Lines starting with "1. ", "2. ", ... become ordered list items
// - Blank lines separate blocks
// - Everything else is a paragraph

import { Fragment } from 'react';

export default function RenderRichText({ text }) {
    if (!text) return null;
    const lines = String(text).replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let buffer = [];
    let mode = 'p'; // 'p' | 'ul' | 'ol'

    const flush = () => {
        if (!buffer.length) return;
        blocks.push({ mode, items: buffer });
        buffer = [];
    };

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) { flush(); mode = 'p'; continue; }

        if (line.startsWith('# ')) {
            flush();
            blocks.push({ mode: 'h2', items: [line.slice(2).trim()] });
            mode = 'p';
            continue;
        }
        if (line.startsWith('- ')) {
            if (mode !== 'ul') { flush(); mode = 'ul'; }
            buffer.push(line.slice(2).trim());
            continue;
        }
        const olMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (olMatch) {
            if (mode !== 'ol') { flush(); mode = 'ol'; }
            buffer.push(olMatch[2].trim());
            continue;
        }
        if (mode !== 'p') { flush(); mode = 'p'; }
        buffer.push(line);
    }
    flush();

    return (
        <>
            {blocks.map((b, i) => {
                if (b.mode === 'h2') return <h2 key={i} className="rt-h2">{b.items[0]}</h2>;
                if (b.mode === 'ul') return (
                    <ul key={i} className="rt-ul">
                        {b.items.map((it, j) => <li key={j}>{it}</li>)}
                    </ul>
                );
                if (b.mode === 'ol') return (
                    <ol key={i} className="rt-ol">
                        {b.items.map((it, j) => <li key={j}>{it}</li>)}
                    </ol>
                );
                // paragraph: join joined lines with spaces
                return <p key={i} className="rt-p">{b.items.join(' ')}</p>;
            })}
        </>
    );
}
