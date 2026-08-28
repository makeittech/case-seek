/**
 * The season flow controller: walks content/story/season.json's flow nodes.
 * The only way the story advances. Screen transitions + notebook side-effects.
 */
import { db } from './content';
import { useUi, type Screen } from '../state/uiStore';
import { useCase, requireCase } from '../state/caseStore';
import { useNotebook } from '../state/notebookStore';
import { markCaseDirty, markNotebookDirty } from './persist';
import type { FlowNode } from '../engine/content/schemas';

export function nodeAt(index: number): FlowNode | null {
  return db().season.flow[index] ?? null;
}

export function currentNode(): FlowNode | null {
  return nodeAt(requireCase().flowIndex);
}

function chapterOfNode(node: FlowNode): number | null {
  const d = db();
  switch (node.type) {
    case 'beat':
      return d.beats.get(node.id)?.chapter ?? null;
    case 'round':
      return d.rounds.get(node.id)?.chapter ?? null;
    case 'recap':
      return node.chapter;
    default:
      return null;
  }
}

/** Enter the node at the case's current flowIndex. */
export function enterCurrentNode(): void {
  const row = requireCase();
  const node = nodeAt(row.flowIndex);
  const ui = useUi.getState();
  if (!node) {
    useCase.getState().patch({ completed: true });
    markCaseDirty();
    ui.goto({ kind: 'title' });
    return;
  }
  const ch = chapterOfNode(node);
  if (ch && ch !== row.chapter) {
    useCase.getState().patch({ chapter: ch });
    markCaseDirty();
  }
  switch (node.type) {
    case 'beat':
      ui.goto({ kind: 'beat', beatId: node.id });
      break;
    case 'round': {
      const template = db().rounds.get(node.id);
      if (template) {
        useNotebook.getState().setObjective(template.objective);
        markNotebookDirty();
      }
      ui.goto({ kind: 'map' });
      break;
    }
    case 'puzzle':
      ui.goto({ kind: 'puzzle', puzzleId: node.id });
      break;
    case 'board-review':
      ui.goto({ kind: 'board-review', brId: node.id });
      break;
    case 'recap':
      ui.goto({ kind: 'recap', chapter: node.chapter });
      break;
    case 'accusation':
      ui.goto({ kind: 'accusation' });
      break;
    case 'epilogue':
      ui.goto({ kind: 'epilogue' });
      break;
  }
  markCaseDirty();
}

export function advanceFlow(): void {
  const row = requireCase();
  useCase.getState().patch({ flowIndex: row.flowIndex + 1 });
  markCaseDirty();
  enterCurrentNode();
}

/** Human label for the Continue notebook ("Resume: Curator's Office — mid-search"). */
export function resumeLabel(screen: Screen | null): string {
  const d = db();
  if (!screen) return 'The letter under the door';
  switch (screen.kind) {
    case 'search': {
      const r = d.rounds.get(screen.roundId);
      const scene = r ? d.scenes.get(r.sceneId) ?? d.variants.get(r.sceneId) : null;
      return scene ? `${scene.name} — mid-search` : 'Mid-search';
    }
    case 'beat': {
      const b = d.beats.get(screen.beatId);
      return b ? `${b.title}` : 'A conversation';
    }
    case 'map':
      return 'The city map';
    case 'puzzle':
      return d.puzzles.get(screen.puzzleId)?.title ?? 'Handling evidence';
    case 'debrief':
    case 'results':
      return 'Updating the notebook';
    case 'board-review':
      return 'The evidence board';
    case 'recap':
      return 'Field notes';
    case 'accusation':
      return 'The rooftop';
    case 'epilogue':
      return 'What the frame holds';
    default:
      return 'Marlowe Bay';
  }
}

/** In-game back: search/beat/etc. → map/title (autosaves instantly). */
export function goBack(): void {
  const ui = useUi.getState();
  const screen = ui.screen;
  const row = useCase.getState().row;
  switch (screen.kind) {
    case 'search':
    case 'beat':
    case 'puzzle':
    case 'board-review':
    case 'recap':
    case 'results':
    case 'debrief':
    case 'accusation':
    case 'epilogue':
      ui.goto(row ? { kind: 'map' } : { kind: 'title' });
      break;
    case 'clue':
      ui.goto(row ? { kind: 'map' } : { kind: 'title' });
      break;
    case 'map':
      ui.goto({ kind: 'title' });
      break;
    case 'lang-select':
      ui.goto({ kind: 'title' });
      break;
    case 'prof-select':
      ui.goto({ kind: 'lang-select' });
      break;
    case 'case-files':
      ui.goto({ kind: 'title' });
      break;
    default:
      break;
  }
  markCaseDirty();
}
