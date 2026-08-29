/** Case files drawer: every save slot with resume / export / delete. */
import { useEffect, useState } from 'react';
import { useUi } from '../../state/uiStore';
import { continueCase, deleteCase, exportCase, listSaves } from '../../app/boot';
import { resumeLabel } from '../../app/flow';
import { savedScreenOf } from '../../app/persist';
import { db } from '../../app/content';
import { ui } from '../strings';
import { TopBar } from '../components/TopBar';
import type { CaseRow } from '../../services/StorageService';

export function CaseFilesScreen(): JSX.Element {
  const goto = useUi((s) => s.goto);
  const [saves, setSaves] = useState<CaseRow[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = (): void => {
    void listSaves().then(setSaves);
  };
  useEffect(refresh, []);

  return (
    <main className="screen fade-in">
      <TopBar title={ui('caseFiles')} onBack={() => goto({ kind: 'title' })} />
      <div className="screen-inner" style={{ overflowY: 'auto' }}>
        {saves.length === 0 && <p style={{ textAlign: 'center', opacity: 0.7 }}>No case files yet.</p>}
        {saves.map((row) => (
          <div key={row.caseId} className="paper case-slot">
            <div className="case-slot__row">
              <span className="case-slot__lang">{db().packs[row.lang].name}</span>
              <span className="case-slot__meta">
                {ui(`tier.${row.tier}`)} · Ch. {row.chapter} · {row.wordsKnown} words known
                {row.completed ? ' · Solved' : ''}
              </span>
            </div>
            <div className="margin-note">{resumeLabel(savedScreenOf(row))}</div>
            <div className="case-slot__actions">
              {!row.completed && (
                <button type="button" className="btn btn--primary" onClick={() => void continueCase(row)}>
                  {ui('resume')}
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={() => void exportCase(row.caseId)}>
                {ui('export')}
              </button>
              {confirmDelete === row.caseId ? (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => {
                    void deleteCase(row.caseId).then(refresh);
                    setConfirmDelete(null);
                  }}
                >
                  Really delete?
                </button>
              ) : (
                <button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(row.caseId)}>
                  {ui('delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
