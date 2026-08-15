import { X, Download, ExternalLink, FileText } from 'lucide-react'

export default function PdfViewerModal({ result, onClose }) {
  if (!result) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-line px-5 py-4">
          <div>
            <p className="font-display text-lg font-semibold text-text-hi">{result.categoryName} — {result.drawCode}</p>
          <p className="text-xs text-text-lo">Source page for this result</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-text-lo hover:bg-ink-soft hover:text-text-hi">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-ink px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-ink-line bg-ink-panel text-gold-bright">
            <FileText size={24} />
          </span>
          <p className="font-medium text-text-hi">Open the source result page</p>
          <p className="max-w-sm text-sm text-text-lo">
            The winning numbers below were parsed from the linked source page. Verify the
            result there before claiming any prize.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-ink-line px-5 py-4 sm:flex-row">
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-gold-bright"
          >
            <ExternalLink size={15} /> Open source result
          </a>
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-line px-4 py-2.5 text-sm font-medium text-text-lo hover:text-text-hi"
          >
            <Download size={15} /> Save source page
          </a>
        </div>
      </div>
    </div>
  )
}
