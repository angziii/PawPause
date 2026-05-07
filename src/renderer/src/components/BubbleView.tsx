import { useEffect, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type { SpeechBubbleFrame } from "../../../shared/types";

export function BubbleView(): JSX.Element {
  const [frame, setFrame] = useState<SpeechBubbleFrame | null>(null);

  useEffect(() => {
    const offBubble = window.pawpause.onShowBubble(setFrame);
    const offHide = window.pawpause.onHideBubble(() => setFrame(null));
    return () => {
      offBubble();
      offHide();
    };
  }, []);

  return (
    <main
      className="bubble-shell"
      aria-hidden={!frame}
      style={
        {
          "--bubble-arrow-x": `${frame?.layout.bubbleArrowX ?? 138}px`
        } as CSSProperties
      }
    >
      {frame ? (
        <section className="speech-bubble">
          <p>{frame.bubble.message}</p>
          {frame.bubble.actions?.length ? (
            <div className="bubble-actions">
              {frame.bubble.actions.map((action) => (
                <button
                  className={`bubble-button ${action.kind ?? "secondary"}`}
                  key={action.id}
                  onClick={() => window.pawpause.bubbleAction(action.id)}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
