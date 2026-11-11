import type { ReactNode } from "react";

/** Rendu limité : gras, listes, tableaux. Aucune balise HTML n'est interprétée. */
export default function SafeMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const cells = lines[index].split("|").slice(1, -1).map((cell) => cell.trim());
        if (!cells.every((cell) => /^-+$/.test(cell))) rows.push(cells);
        index += 1;
      }
      blocks.push(
        <table key={`t-${index}`} className="text-sm border-collapse my-2">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border border-gray-700 px-2 py-1">{inline(cell)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }
    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(<ul key={`u-${index}`} className="list-disc pl-5 my-2">{items.map((item) => <li key={item}>{inline(item)}</li>)}</ul>);
      continue;
    }
    if (line.trim()) blocks.push(<p key={`p-${index}`} className="my-1">{inline(line)}</p>);
    index += 1;
  }
  return <div>{blocks}</div>;
}

function inline(text: string) {
  const safe = text.replace(/</g, "‹").replace(/>/g, "›");
  const parts = safe.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : <span key={index}>{part}</span>);
}
