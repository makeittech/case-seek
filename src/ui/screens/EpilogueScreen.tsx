/** Epilogue: six panels, then the Season Two coda, then back to the title. */
import { useState } from 'react';
import { db } from '../../app/content';
import { useNotebook } from '../../state/notebookStore';
import { markNotebookDirty } from '../../app/persist';
import { completeEpilogue } from '../../app/storyFlow';
import { ui } from '../strings';

export function EpilogueScreen(): JSX.Element {
  const ep = db().epilogue;
  const [i, setI] = useState(0);
  const addCaseLine = useNotebook((s) => s.addCaseLine);

  const panels = ep.panels;
  const inCoda = i >= panels.length;
  const panel = panels[i];

  const next = (): void => {
    if (panel) {
      addCaseLine(6, panel.caseLine);
      markNotebookDirty();
    }
    setI(i + 1);
  };

  return (
    <main className="screen screen--scroll fade-in" data-testid="epilogue-screen">
      <div className="screen-inner" style={{ justifyContent: 'center' }}>
        {!inCoda && panel ? (
          <div className="paper epilogue-panel fade-in" key={i}>
            <div className="epilogue-panel__location">{panel.location}</div>
            <div className="epilogue-panel__icon" aria-hidden="true">
              {panel.icon}
            </div>
            <p>{panel.text}</p>
            <p className="margin-note">{panel.caseLine}</p>
            <button type="button" className="btn btn--primary" data-testid="btn-epilogue-next" onClick={next}>
              {ui('epilogue.continue')} ({i + 1}/{panels.length})
            </button>
          </div>
        ) : (
          <div className="paper epilogue-panel fade-in">
            <h2>{ep.codaTitle}</h2>
            {ep.coda.map((line, k) => (
              <p key={k} className="margin-note" style={{ fontSize: '1rem' }}>
                {line}
              </p>
            ))}
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-epilogue-finish"
              onClick={completeEpilogue}
            >
              Case closed
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
