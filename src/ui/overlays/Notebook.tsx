/** The notebook overlay: CASE / PEOPLE / CLUES / WORDS. Read-only, data-driven. */
import { useUi, type NotebookTab } from '../../state/uiStore';
import { useNotebook } from '../../state/notebookStore';
import { useVocab } from '../../state/vocabStore';
import { useCase } from '../../state/caseStore';
import { band, pips } from '../../engine/vocab/scheduler';
import { nounDisplay } from '../../engine/content/loader';
import { db } from '../../app/content';
import { clueCaption } from '../../app/storyFlow';
import { speakConcept } from '../../app/speak';
import { useModal } from '../components/useModal';
import { ui } from '../strings';

const TABS: NotebookTab[] = ['case', 'people', 'clues', 'words'];

export function Notebook(): JSX.Element | null {
  const tab = useUi((s) => s.notebookOpen);
  if (!tab) return null;
  return <NotebookBody tab={tab} />;
}

// separate component so useModal runs only while the notebook is open
function NotebookBody({ tab }: { tab: NotebookTab }): JSX.Element {
  const close = useUi((s) => s.closeNotebook);
  const openNotebook = useUi((s) => s.openNotebook);
  const modalRef = useModal<HTMLDivElement>({ onClose: close });

  return (
    <div
      className="overlay-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="notebook" role="dialog" aria-modal="true" aria-label={ui('notebook')} data-testid="notebook" ref={modalRef}>
        <div className="notebook__tabs">
          {/* the close button must live outside the tablist (only tabs may be its children) */}
          <div role="tablist" style={{ display: 'flex', flex: 1 }}>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                id={`nb-tab-btn-${t}`}
                aria-selected={tab === t}
                aria-controls={`nb-panel-${t}`}
                className={`notebook__tab ${tab === t ? 'notebook__tab--active' : ''}`}
                data-testid={`nb-tab-${t}`}
                onClick={() => openNotebook(t)}
              >
                {ui(`tab.${t}`)}
              </button>
            ))}
          </div>
          <button type="button" className="notebook__tab" aria-label="Close notebook" onClick={close} style={{ flex: '0 0 48px' }}>
            ✕
          </button>
        </div>
        <div className="notebook__body" role="tabpanel" id={`nb-panel-${tab}`} aria-labelledby={`nb-tab-btn-${tab}`}>
          {tab === 'case' && <CaseTab />}
          {tab === 'people' && <PeopleTab />}
          {tab === 'clues' && <CluesTab />}
          {tab === 'words' && <WordsTab />}
        </div>
      </div>
    </div>
  );
}

function CaseTab(): JSX.Element {
  const caseLines = useNotebook((s) => s.caseLines);
  const objective = useNotebook((s) => s.objective);
  const chapters = db().season.chapters;
  return (
    <div data-testid="nb-case">
      {objective && (
        <p className="margin-note" style={{ color: 'var(--teal)', fontWeight: 700 }}>
          Now: {objective}
        </p>
      )}
      {chapters.map((ch) => {
        const lines = caseLines.filter((l) => l.chapter === ch.n);
        if (lines.length === 0) return null;
        return (
          <section key={ch.n}>
            <h3 style={{ marginTop: 12 }}>
              Ch. {ch.n} — {ch.title}
            </h3>
            {lines.map((l, i) => (
              <div key={i} className="case-line">
                {l.line}
              </div>
            ))}
          </section>
        );
      })}
      {caseLines.length === 0 && <p className="margin-note">The first page is still blank.</p>}
    </div>
  );
}

function PeopleTab(): JSX.Element {
  const people = useNotebook((s) => s.people);
  const cast = db().cast;
  const known = cast.filter((c) => people[c.id]);
  return (
    <div data-testid="nb-people">
      {known.length === 0 && <p className="margin-note">No one has given Halloway a reason to write them down. Yet.</p>}
      {known.map((c) => {
        const entry = people[c.id]!;
        return (
          <div key={c.id} className="person-card">
            <div className="person-card__head">
              <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>
                {c.icon}
              </span>
              <span>{c.name}</span>
              <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{c.role}</span>
              <span className={`person-stamp person-stamp--${entry.stamp}`}>{entry.stamp}</span>
            </div>
            <ul className="person-card__facts">
              {entry.facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function CluesTab(): JSX.Element {
  const clues = useNotebook((s) => s.clues);
  const boardLinks = useNotebook((s) => s.boardLinks);
  const solvedOffscreen = useNotebook((s) => s.solvedOffscreen);
  return (
    <div data-testid="nb-clues">
      {clues.length === 0 && <p className="margin-note">No evidence pinned yet.</p>}
      {clues.map((cid) => {
        const clue = db().clues.get(cid);
        if (!clue) return null;
        return (
          <div key={cid} className="clue-row">
            <span className="clue-row__icon" aria-hidden="true">
              {clue.icon}
            </span>
            <div>
              <strong>{clue.name}</strong>
              {clueCaption(clue) && <span className="margin-note"> {clueCaption(clue)}</span>}
              <div className="margin-note">{clue.note}</div>
            </div>
          </div>
        );
      })}
      {boardLinks.length > 0 && (
        <>
          <h3 style={{ marginTop: 14 }}>Strings drawn</h3>
          {boardLinks.map(([a, b], i) => (
            <div key={i} className="case-line">
              🧵 {db().clues.get(a)?.name} ⟷ {db().clues.get(b)?.name}
            </div>
          ))}
        </>
      )}
      {solvedOffscreen.length > 0 && (
        <>
          <h3 style={{ marginTop: 14 }}>Handled by Margo</h3>
          {solvedOffscreen.map((pid) => (
            <div key={pid} className="case-line">
              {db().puzzles.get(pid)?.skipNote ?? pid}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function WordsTab(): JSX.Element {
  const words = useVocab((s) => s.words);
  const row = useCase((s) => s.row);
  if (!row) return <p className="margin-note">No case open.</p>;
  const now = Date.now();
  const entries = Object.values(words)
    .filter((w) => w.timesServedAsTarget > 0 || w.timesSeen > 0)
    .sort((a, b) => (a.conceptId < b.conceptId ? -1 : 1));
  const counts = { new: 0, seen: 0, known: 0 };
  for (const w of entries) {
    const b = band(w, now);
    if (b === 'new' || b === 'seen' || b === 'known') counts[b]++;
  }
  return (
    <div data-testid="nb-words">
      <p className="margin-note">
        {counts.known} known · {counts.seen} seen · {counts.new} new — in {db().packs[row.lang].name}
      </p>
      {entries.map((w) => {
        const lx = db().lexemes[row.lang].get(w.conceptId);
        const c = db().concepts.get(w.conceptId);
        if (!lx || !c) return null;
        const p = pips(w, now);
        return (
          <div key={w.conceptId} className="word-row">
            <span aria-hidden="true">{c.icon}</span>
            <button
              type="button"
              style={{ fontWeight: 600, textAlign: 'left' }}
              onClick={() => speakConcept(w.conceptId, {})}
              aria-label={`${nounDisplay(lx)}, hear it`}
            >
              {nounDisplay(lx)}
            </button>
            <span className="margin-note">{lx.gloss ?? c.gloss}</span>
            <span className="word-row__pips" aria-label={`strength ${p} of 3`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`word-pip ${i < p ? 'word-pip--full' : ''}`} />
              ))}
            </span>
          </div>
        );
      })}
      {entries.length === 0 && <p className="margin-note">Words will collect here as Halloway finds them.</p>}
    </div>
  );
}
