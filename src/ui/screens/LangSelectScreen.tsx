/** Language select: three paper covers; tapping speaks the greeting. */
import { useUi } from '../../state/uiStore';
import { speakGreeting } from '../../app/speak';
import { db } from '../../app/content';
import { ui } from '../strings';
import type { Lang } from '../../engine/types';

const LANGS: Lang[] = ['de', 'es', 'it'];

export function LangSelectScreen(): JSX.Element {
  const goto = useUi((s) => s.goto);
  return (
    <main className="screen screen--scroll fade-in">
      <div className="screen-inner" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="select-heading">{ui('chooseLanguage')}</h2>
        <div className="select-grid select-grid--langs">
          {LANGS.map((lang) => {
            const pack = db().packs[lang];
            return (
              <button
                key={lang}
                type="button"
                className="lang-card"
                data-testid={`lang-${lang}`}
                onClick={() => {
                  try {
                    speakGreeting(lang);
                  } catch {
                    /* speech optional */
                  }
                  goto({ kind: 'prof-select', lang });
                }}
              >
                <span className="lang-card__name">{pack.name}</span>
                <span className="lang-card__sub">{pack.nameEn}</span>
                <span className="lang-card__sub" style={{ fontStyle: 'italic' }}>
                  «{pack.greeting}»
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => goto({ kind: 'title' })}>
          {ui('backToTitle')}
        </button>
      </div>
    </main>
  );
}
