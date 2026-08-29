/** Proficiency select, then the case opens. */
import { useState } from 'react';
import { newCase } from '../../app/boot';
import { db } from '../../app/content';
import { ui } from '../strings';
import type { Lang, Tier } from '../../engine/types';

const TIERS: Tier[] = ['new', 'basics', 'conversational', 'advanced'];

export function TierSelectScreen({ lang }: { lang: Lang }): JSX.Element {
  const [busy, setBusy] = useState(false);
  const pack = db().packs[lang];
  return (
    <main className="screen screen--scroll fade-in">
      <div className="screen-inner" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="select-heading">
          {pack.name} — {ui('chooseTier')}
        </h2>
        <div className="select-grid select-grid--tiers">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className="tier-card"
              data-testid={`tier-${tier}`}
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void newCase(lang, tier);
              }}
            >
              <span className="tier-card__name">{ui(`tier.${tier}`)}</span>
              <span className="tier-card__desc">{ui(`tier.${tier}.desc`)}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
