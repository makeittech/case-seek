/** Title: Continue (most recent case) / New Case / Case Files. */
import { useEffect, useState } from 'react';
import { useUi } from '../../state/uiStore';
import { continueCase, listSaves } from '../../app/boot';
import { resumeLabel } from '../../app/flow';
import { savedScreenOf } from '../../app/persist';
import { ui } from '../strings';
import type { CaseRow } from '../../services/StorageService';

export function TitleScreen(): JSX.Element {
  const goto = useUi((s) => s.goto);
  const [saves, setSaves] = useState<CaseRow[]>([]);

  useEffect(() => {
    let live = true;
    void listSaves().then((rows) => {
      if (live) setSaves(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  // Continue offers only unfinished cases; Case Files lists every slot,
  // including solved ones (export/delete/Solved stamp stay reachable).
  const latest = saves.find((r) => !r.completed) ?? null;

  return (
    <main className="screen title-screen fade-in">
      <div className="title-screen__frame" aria-hidden="true">
        🖼️
      </div>
      <h1>{ui('title')}</h1>
      <p className="title-screen__sub">{ui('subtitle')}</p>
      <p className="title-screen__tagline">{ui('tagline')}</p>
      <div className="title-screen__buttons">
        {latest && (
          <button
            type="button"
            className="btn btn--primary"
            data-testid="btn-continue"
            onClick={() => void continueCase(latest)}
          >
            {ui('continue')}
          </button>
        )}
        {latest && (
          <div className="title-screen__resume">
            {resumeLabel(savedScreenOf(latest))} · {latest.wordsKnown} words known
          </div>
        )}
        <button
          type="button"
          className={`btn ${latest ? 'btn--ghost' : 'btn--primary'}`}
          data-testid="btn-new-case"
          onClick={() => goto({ kind: 'lang-select' })}
        >
          {ui('newCase')}
        </button>
        {saves.length > 0 && (
          <button
            type="button"
            className="btn btn--ghost"
            data-testid="btn-case-files"
            onClick={() => goto({ kind: 'case-files' })}
          >
            {ui('caseFiles')}
          </button>
        )}
      </div>
    </main>
  );
}
