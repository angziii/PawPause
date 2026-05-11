import { useEffect, useRef, useState } from "react";
import type { CSSProperties, JSX, PointerEvent } from "react";
import { i18n, resolveLanguage } from "../../../shared/i18n";
import type { PetLayout, SpeechBubble } from "../../../shared/types";
import { getSelectedPetAsset } from "../assets";
import { useNow, useSnapshot } from "../hooks";

type DragRef = {
  pointerId: number;
  startX: number;
  startY: number;
  dragging: boolean;
};

const DRAG_START_DISTANCE_PX = 10;

function formatFocusCountdown(endsAt: number | null, now: number): string {
  const remainingSeconds = Math.max(0, Math.ceil(((endsAt ?? now) - now) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function PetView(): JSX.Element {
  const snapshot = useSnapshot();
  const now = useNow(1000);
  const [bubble, setBubble] = useState<SpeechBubble | null>(null);
  const [layout, setLayout] = useState<PetLayout>({
    petOffsetX: 0,
    bubbleAnchorX: 0,
    bubbleLeftX: 0,
    bubbleArrowX: 0
  });
  const dragRef = useRef<DragRef | null>(null);
  const labels = i18n(resolveLanguage(snapshot.settings.language)).settings;

  useEffect(() => {
    const offLayout = window.pawpause.onPetLayout(setLayout);
    const offBubble = window.pawpause.onShowBubble(setBubble);
    const offHide = window.pawpause.onHideBubble(() => setBubble(null));
    return () => {
      offLayout();
      offBubble();
      offHide();
    };
  }, []);

  const state = snapshot.petState;
  const altText = `PawPause ${state}`;
  const usesDirectionalSprite = state === "runningLeft" || state === "runningRight";
  const facingClass = usesDirectionalSprite
    ? "facing-natural"
    : snapshot.petFacing === "left"
      ? "facing-left"
      : "facing-right";
  const selectedPetId = snapshot.settings.selectedPetId;
  const asset = getSelectedPetAsset(selectedPetId, snapshot.settings.installedPets, state);
  const lyricsModeEnabled = snapshot.settings.lyricsModeEnabled;

  function finishPointerDrag(clicked: boolean): void {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.dragging) {
      window.pawpause.petDragStop();
      return;
    }
    if (clicked) window.pawpause.petClicked();
  }

  useEffect(() => {
    const cancelActiveDrag = (): void => finishPointerDrag(false);
    window.addEventListener("pointerup", cancelActiveDrag);
    window.addEventListener("pointercancel", cancelActiveDrag);
    window.addEventListener("blur", cancelActiveDrag);
    return () => {
      window.removeEventListener("pointerup", cancelActiveDrag);
      window.removeEventListener("pointercancel", cancelActiveDrag);
      window.removeEventListener("blur", cancelActiveDrag);
    };
  }, []);

  useEffect(() => {
    if (!lyricsModeEnabled) return;
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.dragging) window.pawpause.petDragStop();
  }, [lyricsModeEnabled]);

  function startPointer(event: PointerEvent<HTMLButtonElement>): void {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false
    };
  }

  function movePointer(event: PointerEvent<HTMLButtonElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.dragging && distance > DRAG_START_DISTANCE_PX) {
      drag.dragging = true;
      window.pawpause.petDragStart({ offsetX: drag.startX, offsetY: drag.startY });
    }
  }

  function stopPointer(event: PointerEvent<HTMLButtonElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const shouldReleaseCapture = event.currentTarget.hasPointerCapture(event.pointerId);
    finishPointerDrag(true);
    if (shouldReleaseCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function cancelPointer(event: PointerEvent<HTMLButtonElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    finishPointerDrag(false);
  }

  return (
    <main
      className={`pet-shell${snapshot.screenBlockActive ? " is-screen-block" : ""}${lyricsModeEnabled ? " is-lyrics-mode" : ""}`}
      aria-label="PawPause desktop pet"
      dir={resolveLanguage(snapshot.settings.language) === "ar" ? "rtl" : "ltr"}
      style={
        {
          "--pet-scale": snapshot.settings.petScale,
          "--idle-motion-duration": `${snapshot.settings.petIdleMotionSeconds}s`,
          "--pet-layout-offset-x": `${layout.petOffsetX}px`,
          "--bubble-anchor-x": `${layout.bubbleAnchorX}px`,
          "--bubble-left-x": `${layout.bubbleLeftX}px`,
          "--bubble-arrow-x": `${layout.bubbleArrowX}px`
        } as CSSProperties
      }
      onContextMenu={
        lyricsModeEnabled
          ? undefined
          : (event) => {
              event.preventDefault();
              window.pawpause.petContextMenu();
            }
      }
    >
      {bubble ? (
        <section className="speech-bubble">
          <p>{bubble.message}</p>
          {!lyricsModeEnabled && bubble.actions?.length ? (
            <div className="bubble-actions">
              {bubble.actions.map((action) => (
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

      {snapshot.focusActive ? (
        <div className="focus-badge">
          <span>{labels.focus}</span>
          <strong>{formatFocusCountdown(snapshot.timers.focusEndsAt, now)}</strong>
        </div>
      ) : null}

      {!snapshot.focusActive && snapshot.timers.breakSnoozeDueAt ? (
        <div className="focus-badge break-snooze-badge">
          <span>{labels.break}</span>
          <strong>{formatFocusCountdown(snapshot.timers.breakSnoozeDueAt, now)}</strong>
        </div>
      ) : null}

      <button
        className={`pet-button state-${state} ${facingClass}`}
        aria-disabled={lyricsModeEnabled}
        onPointerCancel={lyricsModeEnabled ? undefined : cancelPointer}
        onPointerDown={lyricsModeEnabled ? undefined : startPointer}
        onLostPointerCapture={lyricsModeEnabled ? undefined : () => finishPointerDrag(false)}
        onPointerMove={lyricsModeEnabled ? undefined : movePointer}
        onPointerUp={lyricsModeEnabled ? undefined : stopPointer}
        tabIndex={lyricsModeEnabled ? -1 : 0}
        type="button"
      >
        {asset.kind === "sprite" ? (
          <span
            className="sprite-pet"
            role="img"
            aria-label={altText}
            style={
              {
                "--sprite-url": `url(${asset.src})`,
                "--sprite-row": asset.animation.row,
                "--sprite-frames": asset.animation.frames,
                "--sprite-duration": `${asset.animation.durationMs}ms`,
                "--sprite-frame-width": `${asset.frameWidth}px`,
                "--sprite-frame-height": `${asset.frameHeight}px`,
                "--sprite-sheet-width": `${asset.sheetWidth}px`,
                "--sprite-sheet-height": `${asset.sheetHeight}px`
              } as CSSProperties
            }
          />
        ) : (
          <span className="fallback-pet" role="img" aria-label={altText}>
            <span className="fallback-pet__ear fallback-pet__ear--left" />
            <span className="fallback-pet__ear fallback-pet__ear--right" />
            <span className="fallback-pet__face">
              <span className="fallback-pet__eye fallback-pet__eye--left" />
              <span className="fallback-pet__eye fallback-pet__eye--right" />
              <span className="fallback-pet__nose" />
            </span>
            <span className="fallback-pet__tail" />
          </span>
        )}
      </button>
    </main>
  );
}
