/**
 * App shell: screen router (uiStore state machine) + global overlays
 * (notebook, settings, notebook peek) + settings side-effects.
 */
import { useEffect } from 'react';
import { useUi } from '../state/uiStore';
import { useSettings } from '../state/settingsStore';
import { getServices } from '../services';
import { TitleScreen } from './screens/TitleScreen';
import { CaseFilesScreen } from './screens/CaseFilesScreen';
import { LangSelectScreen } from './screens/LangSelectScreen';
import { TierSelectScreen } from './screens/TierSelectScreen';
import { MapScreen } from './screens/MapScreen';
import { BeatScreen } from './screens/BeatScreen';
import { SearchScreen } from './screens/search/SearchScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { DebriefScreen } from './screens/DebriefScreen';
import { ClueScreen } from './screens/ClueScreen';
import { PuzzleScreen } from './screens/PuzzleScreen';
import { BoardReviewScreen } from './screens/BoardReviewScreen';
import { RecapScreen } from './screens/RecapScreen';
import { AccusationScreen } from './screens/AccusationScreen';
import { EpilogueScreen } from './screens/EpilogueScreen';
import { Notebook } from './overlays/Notebook';
import { SettingsSheet } from './overlays/SettingsSheet';

export function App(): JSX.Element {
  const screen = useUi((s) => s.screen);
  const peek = useUi((s) => s.notebookPeek);
  const setPeek = useUi((s) => s.setNotebookPeek);
  const openNotebook = useUi((s) => s.openNotebook);
  const textSize = useSettings((s) => s.textSize);
  const dyslexiaFont = useSettings((s) => s.dyslexiaFont);
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const volSfx = useSettings((s) => s.volSfx);

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(textSize / 100));
    document.body.classList.toggle('dyslexia-font', dyslexiaFont);
    document.body.classList.toggle('reduced-motion', reducedMotion);
  }, [textSize, dyslexiaFont, reducedMotion]);

  useEffect(() => {
    try {
      getServices().audio.setVolume(volSfx);
    } catch {
      /* services not ready during first paint */
    }
  }, [volSfx]);

  useEffect(() => {
    if (!peek) return;
    const t = window.setTimeout(() => setPeek(false), 3200);
    return () => window.clearTimeout(t);
  }, [peek, setPeek]);

  return (
    <>
      {renderScreen(screen)}
      {peek && (
        <button type="button" className="notebook-peek" onClick={() => openNotebook()}>
          📓 The notebook takes a note…
        </button>
      )}
      <Notebook />
      <SettingsSheet />
    </>
  );
}

function renderScreen(screen: ReturnType<typeof useUi.getState>['screen']): JSX.Element {
  switch (screen.kind) {
    case 'boot':
      return (
        <main className="screen title-screen">
          <div className="title-screen__frame" aria-hidden="true">
            🖼️
          </div>
          <p className="title-screen__sub">Opening the case file…</p>
        </main>
      );
    case 'title':
      return <TitleScreen />;
    case 'case-files':
      return <CaseFilesScreen />;
    case 'lang-select':
      return <LangSelectScreen />;
    case 'prof-select':
      return <TierSelectScreen lang={screen.lang} />;
    case 'map':
      return <MapScreen />;
    case 'beat':
      return <BeatScreen key={screen.beatId} beatId={screen.beatId} />;
    case 'search':
      return <SearchScreen key={screen.roundId} roundId={screen.roundId} />;
    case 'results':
      return <ResultsScreen roundId={screen.roundId} />;
    case 'debrief':
      return <DebriefScreen roundId={screen.roundId} />;
    case 'clue':
      return <ClueScreen clueId={screen.clueId} back={screen.back} />;
    case 'puzzle':
      return <PuzzleScreen key={screen.puzzleId} puzzleId={screen.puzzleId} />;
    case 'board-review':
      return <BoardReviewScreen key={screen.brId} brId={screen.brId} />;
    case 'recap':
      return <RecapScreen key={screen.chapter} chapter={screen.chapter} />;
    case 'accusation':
      return <AccusationScreen />;
    case 'epilogue':
      return <EpilogueScreen />;
  }
}
