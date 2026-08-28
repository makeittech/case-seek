/**
 * UI smoke: Title → New Case → Español → tier → the cold-open beat renders,
 * plus notebook overlay tabs. (Search canvas is exercised in Playwright.)
 */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { initTestServices } from '../services';
import { useUi } from '../state/uiStore';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useNotebook } from '../state/notebookStore';
import { useRound } from '../state/roundStore';
import { initContent } from '../app/content';

describe('onboarding flow (UI)', () => {
  beforeAll(async () => {
    await initContent();
  });
  beforeEach(() => {
    initTestServices();
    useUi.setState({ screen: { kind: 'title' }, notebookOpen: null, settingsOpen: false, notebookPeek: false });
    useCase.getState().clear();
    useVocab.getState().reset();
    useNotebook.getState().reset();
    useRound.getState().reset();
  });

  it('walks title → language → tier → first beat', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Case & Seek')).toBeTruthy();
    await user.click(screen.getByTestId('btn-new-case'));

    expect(screen.getByText('Deutsch')).toBeTruthy();
    expect(screen.getByText('Italiano')).toBeTruthy();
    await user.click(screen.getByTestId('lang-es'));

    expect(screen.getByTestId('tier-new')).toBeTruthy();
    await user.click(screen.getByTestId('tier-basics'));

    await waitFor(() => expect(useUi.getState().screen.kind).toBe('beat'));
    expect(screen.getByTestId('beat-screen')).toBeTruthy();
    expect(useCase.getState().row?.lang).toBe('es');
    expect(useCase.getState().row?.tier).toBe('basics');
  });

  it('beat screen reveals lines and completes into the map', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('btn-new-case'));
    await user.click(screen.getByTestId('lang-es'));
    await user.click(screen.getByTestId('tier-conversational'));
    await waitFor(() => expect(useUi.getState().screen.kind).toBe('beat'));

    // advance through all lines
    let guard = 0;
    while (screen.queryByTestId('btn-beat-next') && guard++ < 40) {
      await user.click(screen.getByTestId('btn-beat-next'));
    }
    const finish = screen.queryByTestId('btn-beat-continue') ?? screen.queryByTestId('btn-beat-warm');
    expect(finish).toBeTruthy();
    await user.click(finish!);
    await waitFor(() => expect(useUi.getState().screen.kind).toBe('map'));
    expect(screen.getByTestId('btn-go-there')).toBeTruthy();
  });

  it('notebook overlay opens with all four tabs', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('btn-new-case'));
    await user.click(screen.getByTestId('lang-de'));
    await user.click(screen.getByTestId('tier-new'));
    await waitFor(() => expect(useUi.getState().screen.kind).toBe('beat'));

    await user.click(screen.getByTestId('open-notebook'));
    expect(screen.getByTestId('notebook')).toBeTruthy();
    for (const tab of ['case', 'people', 'clues', 'words']) {
      await user.click(screen.getByTestId(`nb-tab-${tab}`));
      expect(screen.getByTestId(`nb-${tab}`)).toBeTruthy();
    }
  });
});
