import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { i18n, LANGUAGE_OPTIONS, resolveLanguage } from "../../../shared/i18n";
import { allPets } from "../../../shared/bundledPets";
import type {
  DemoTrigger,
  InstalledPet,
  PetRoamDirection,
  Settings,
  TodayStats
} from "../../../shared/types";
import { getSelectedPetAsset } from "../assets";
import { distractionHelp, formatDistractionState, formatTimer, formatTimestamp, localeFor } from "../format";
import { useNow, useSnapshot } from "../hooks";

type SettingsCopy = ReturnType<typeof i18n>["settings"];
type StatsRange = "day" | "month" | "all";
type PrefsPage = "stats" | "pets" | "settings";
type StatsMetric = "breaksTaken" | "watersLogged" | "focusMinutes" | "focusWarnings";
type StatsTrendPoint = TodayStats & {
  label: string;
};

function Row({
  label,
  hint,
  control
}: {
  label: string;
  hint?: string;
  control: JSX.Element;
}): JSX.Element {
  return (
    <div className="pref-row">
      <div className="pref-row__label">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
      <div className="pref-row__control">{control}</div>
    </div>
  );
}

function ToggleControl({
  checked,
  onChange,
  ariaLabel
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`pref-toggle${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="pref-toggle__thumb" />
    </button>
  );
}

function NumberControl({
  value,
  min,
  max,
  unit,
  onChange
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (next: number) => void;
}): JSX.Element {
  const [draftValue, setDraftValue] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setDraftValue(String(value));
  }, [isEditing, value]);

  function clamp(next: number): number {
    return Math.min(max, Math.max(min, next));
  }

  function commit(raw: string): void {
    const trimmed = raw.trim();
    if (!trimmed) {
      setDraftValue(String(value));
      return;
    }

    const next = Number(trimmed);
    if (!Number.isFinite(next)) {
      setDraftValue(String(value));
      return;
    }

    const normalized = clamp(next);
    setDraftValue(String(normalized));
    if (normalized !== value) onChange(normalized);
  }

  return (
    <div className="pref-stepper">
      <button
        type="button"
        className="pref-stepper__btn"
        aria-label="−"
        disabled={value <= min}
        onClick={() => {
          const next = clamp(value - 1);
          setDraftValue(String(next));
          onChange(next);
        }}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={draftValue}
        onBlur={() => {
          setIsEditing(false);
          commit(draftValue);
        }}
        onChange={(event) => setDraftValue(event.target.value)}
        onFocus={() => setIsEditing(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setDraftValue(String(value));
            event.currentTarget.blur();
          }
        }}
      />
      <span className="pref-stepper__unit">{unit}</span>
      <button
        type="button"
        className="pref-stepper__btn"
        aria-label="+"
        disabled={value >= max}
        onClick={() => {
          const next = clamp(value + 1);
          setDraftValue(String(next));
          onChange(next);
        }}
      >
        +
      </button>
    </div>
  );
}

function SelectControl({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <select className="pref-select" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}): JSX.Element {
  return (
    <div className="segmented-control" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? "is-selected" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ChipsControl({
  value,
  onChange,
  labels
}: {
  value: string[];
  onChange: (next: string[]) => void;
  labels: SettingsCopy;
}): JSX.Element {
  const [draft, setDraft] = useState("");

  function commit(raw: string): void {
    const trimmed = raw.trim().replace(/,$/, "").trim();
    if (!trimmed) return;
    if (value.some((entry) => entry.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div className="pref-chips">
      <div className="pref-chips__list">
        {value.map((entry) => (
          <span key={entry} className="pref-chip">
            {entry}
            <button
              type="button"
              aria-label={labels.removeListItem(entry)}
              onClick={() => onChange(value.filter((item) => item !== entry))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="pref-chips__input"
          placeholder={labels.addListItem}
          value={draft}
          onChange={(event) => {
            const next = event.target.value;
            if (next.endsWith(",")) commit(next);
            else setDraft(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(draft);
            }
            if (event.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => commit(draft)}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit
}: {
  label: string;
  value: number;
  unit?: string;
}): JSX.Element {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">
        {value}
        {unit ? <small>{unit}</small> : null}
      </strong>
    </div>
  );
}

function dateFromKey(date: string): Date {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatTrendLabel(date: Date, language: Settings["language"]): string {
  return new Intl.DateTimeFormat(localeFor(language), {
    month: "numeric",
    day: "numeric"
  }).format(date);
}

function buildTrendPoints(
  statsByDate: Record<string, TodayStats>,
  currentDate: string,
  range: StatsRange,
  language: Settings["language"]
): StatsTrendPoint[] {
  if (range === "all") {
    const dates = Object.keys(statsByDate).sort();
    return dates.map((date) => ({
      ...statsByDate[date],
      label: formatTrendLabel(dateFromKey(date), language)
    }));
  }

  const days = range === "month" ? 30 : 7;
  const end = dateFromKey(currentDate);
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(end, index - days + 1);
    const key = dateKey(date);
    return {
      ...emptyStats(key),
      ...statsByDate[key],
      label: formatTrendLabel(date, language)
    };
  });
}

function StatsLineChart({
  title,
  unit,
  metric,
  points
}: {
  title: string;
  unit?: string;
  metric: StatsMetric;
  points: StatsTrendPoint[];
}): JSX.Element {
  const width = 320;
  const height = 132;
  const paddingX = 24;
  const paddingTop = 16;
  const paddingBottom = 24;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;
  const values = points.map((point) => point[metric]);
  const maxValue = Math.max(1, ...values);
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;
  const coordinates = values.map((value, index) => {
    const x = paddingX + stepX * index;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return { x, y, value };
  });
  const line = coordinates.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const latest = values.at(-1) ?? 0;
  const firstLabel = points[0]?.label ?? "";
  const lastLabel = points.at(-1)?.label ?? "";

  return (
    <article className="trend-card">
      <div className="trend-card__head">
        <span>{title}</span>
        <strong>
          {latest}
          {unit ? <small>{unit}</small> : null}
        </strong>
      </div>
      <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line className="trend-chart__grid" x1={paddingX} x2={width - paddingX} y1={paddingTop} y2={paddingTop} />
        <line
          className="trend-chart__grid"
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingTop + chartHeight / 2}
          y2={paddingTop + chartHeight / 2}
        />
        <line
          className="trend-chart__grid"
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingTop + chartHeight}
          y2={paddingTop + chartHeight}
        />
        <polyline className="trend-chart__line" points={line} />
        {coordinates.map((point, index) => (
          <circle
            className="trend-chart__dot"
            key={`${points[index]?.date}-${metric}`}
            cx={point.x}
            cy={point.y}
            r={point.value === latest && index === coordinates.length - 1 ? 3.2 : 2.2}
          />
        ))}
        <text className="trend-chart__axis" x={paddingX} y={height - 6}>
          {firstLabel}
        </text>
        <text className="trend-chart__axis trend-chart__axis--end" x={width - paddingX} y={height - 6}>
          {lastLabel}
        </text>
      </svg>
    </article>
  );
}

function addStats(left: TodayStats, right: TodayStats): TodayStats {
  return {
    date: left.date || right.date,
    breaksTaken: left.breaksTaken + right.breaksTaken,
    watersLogged: left.watersLogged + right.watersLogged,
    focusMinutes: left.focusMinutes + right.focusMinutes,
    focusWarnings: left.focusWarnings + right.focusWarnings
  };
}

function emptyStats(date: string): TodayStats {
  return {
    date,
    breaksTaken: 0,
    watersLogged: 0,
    focusMinutes: 0,
    focusWarnings: 0
  };
}

export function SettingsView(): JSX.Element {
  const snapshot = useSnapshot();
  const { settings, stats } = snapshot;
  const [draft, setDraft] = useState(settings);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [statsRange, setStatsRange] = useState<StatsRange>("day");
  const [page, setPage] = useState<PrefsPage>("stats");
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const now = useNow();
  const savedSettingsKey = JSON.stringify(settings);
  const language = resolveLanguage(draft.language);
  const labels = i18n(language).settings;
  const currentDate = stats.date || new Date(now).toISOString().slice(0, 10);
  const allStatsByDate = {
    ...snapshot.statsHistory,
    [currentDate]: stats
  };
  const monthPrefix = currentDate.slice(0, 7);
  const statsForRange = Object.values(allStatsByDate).reduce(
    (total, entry) => {
      if (statsRange === "day" && entry.date !== currentDate) return total;
      if (statsRange === "month" && !entry.date.startsWith(monthPrefix)) return total;
      return addStats(total, entry);
    },
    emptyStats(currentDate)
  );
  const trendPoints = useMemo(
    () => buildTrendPoints(allStatsByDate, currentDate, statsRange, language),
    [allStatsByDate, currentDate, language, statsRange]
  );
  useEffect(() => {
    setDraft(settings);
    setSettingsDirty(false);
  }, [savedSettingsKey, settings]);

  useEffect(() => {
    if (!settingsDirty) return;
    const timer = window.setTimeout(() => {
      window.pawpause.updateSettings(draft);
      setSettingsDirty(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, settingsDirty]);

  function updateDraft(partial: Partial<Settings>): void {
    setDraft((current) => ({ ...current, ...partial }));
    setSettingsDirty(true);
  }

  async function importPet(): Promise<void> {
    setImportStatus(null);
    const result = await window.pawpause.importPetPackage();
    if (!result.ok) {
      if (result.error !== "import_cancelled") {
        setImportStatus(`${labels.importPetError}: ${result.error}`);
      }
      return;
    }
    setImportStatus(`${labels.importPetSuccess}: ${result.pet.manifest.displayName}`);
  }

  const selectablePets = useMemo(() => allPets(draft.installedPets), [draft.installedPets]);
  const petOptions = selectablePets.map((pet) => ({
    value: pet.slug,
    label: pet.manifest.displayName
  }));
  const pageTitle =
    page === "stats"
      ? labels.statsHeading
      : page === "pets"
        ? labels.petAppearance
        : labels.title;

  return (
    <main className="prefs" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="prefs__topbar">
        <SegmentedControl
          value={page === "pets" ? "pets" : "stats"}
          options={[
            { value: "stats", label: labels.statsHeading },
            { value: "pets", label: labels.petAppearance }
          ]}
          onChange={(value) => setPage(value)}
        />
        <button
          type="button"
          className={`pref-button${page === "settings" ? " is-primary" : ""}`}
          onClick={() => setPage("settings")}
        >
          {labels.title}
        </button>
      </header>
      <h1 className="prefs__page-title">{pageTitle}</h1>

      {page === "stats" ? (
        <section className="prefs__stats-panel" aria-label={labels.statsHeading}>
          <div className="prefs__stats-head">
            <div>
              <h2>{labels.statsHeading}</h2>
            </div>
            <SegmentedControl
              value={statsRange}
              options={[
                { value: "day", label: labels.statsRangeDay },
                { value: "month", label: labels.statsRangeMonth },
                { value: "all", label: labels.statsRangeAll }
              ]}
              onChange={setStatsRange}
            />
          </div>
          <div className="prefs__stats">
            <StatCard label={labels.breaks} value={statsForRange.breaksTaken} unit={labels.countUnit} />
            <StatCard label={labels.waters} value={statsForRange.watersLogged} unit={labels.countUnit} />
            <StatCard label={labels.focusMin} value={statsForRange.focusMinutes} unit={labels.minuteUnit} />
            <StatCard label={labels.warnings} value={statsForRange.focusWarnings} unit={labels.countUnit} />
          </div>
          <div className="prefs__trends">
            <StatsLineChart
              title={labels.breaks}
              metric="breaksTaken"
              points={trendPoints}
              unit={labels.countUnit}
            />
            <StatsLineChart
              title={labels.waters}
              metric="watersLogged"
              points={trendPoints}
              unit={labels.countUnit}
            />
            <StatsLineChart
              title={labels.focusMin}
              metric="focusMinutes"
              points={trendPoints}
              unit={labels.minuteUnit}
            />
            <StatsLineChart
              title={labels.warnings}
              metric="focusWarnings"
              points={trendPoints}
              unit={labels.countUnit}
            />
          </div>
        </section>
      ) : null}

      {page === "stats" && !draft.onboardingDismissed ? (
        <aside className="prefs__welcome">
          <p>
            <strong>{labels.welcomeTitle}.</strong> {labels.welcomeCopy}
          </p>
          <button
            type="button"
            className="text-link"
            onClick={() => updateDraft({ onboardingDismissed: true })}
          >
            {labels.dismissWelcome}
          </button>
        </aside>
      ) : null}

      {page === "pets" ? (
        <section className="prefs__group">
          <h2 className="prefs__group-title">{labels.petAppearance}</h2>
          <div className="pref-block">
            <span className="pref-block__label">{labels.petAppearance}</span>
            <div className="pet-picker">
              {petOptions.map((option) => (
                <PetCard
                  key={option.value}
                  pet={selectablePets.find((pet) => pet.slug === option.value)}
                  label={option.label}
                  selected={draft.selectedPetId === option.value}
                  onSelect={() => updateDraft({ selectedPetId: option.value })}
                />
              ))}
            </div>
          </div>
          <Row
            label={labels.importPet}
            hint={importStatus ?? labels.importPetHint}
            control={
              <button type="button" className="pref-action" onClick={() => void importPet()}>
                {labels.importPet}
              </button>
            }
          />
        </section>
      ) : null}

      {page === "settings" ? (
        <>
          <section className="prefs__group prefs__group--first">
            <h2 className="prefs__group-title">{labels.language}</h2>
            <Row
              label={labels.language}
              control={
                <SelectControl
                  value={language}
                  options={[...LANGUAGE_OPTIONS]}
                  onChange={(value) => updateDraft({ language: resolveLanguage(value) })}
                />
              }
            />
          </section>

          <section className="prefs__group">
            <h2 className="prefs__group-title">{labels.appearance}</h2>
            <Row
              label={labels.petSize}
              control={
                <NumberControl
                  value={Math.round(draft.petScale * 100)}
                  min={30}
                  max={150}
                  unit="%"
                  onChange={(value) => updateDraft({ petScale: value / 100 })}
                />
              }
            />
        <div className="pref-block">
            <span className="pref-block__label">{labels.petMotion}</span>
            <Row
              label={labels.enablePetRoam}
              control={
                <ToggleControl
                  checked={draft.petRoamEnabled}
                  onChange={(petRoamEnabled) => updateDraft({ petRoamEnabled })}
                  ariaLabel={labels.enablePetRoam}
                />
              }
            />
            <Row
              label={labels.petRoamDirection}
              control={
                <SelectControl
                  value={draft.petRoamDirection}
                  options={[
                    { value: "both", label: labels.petRoamDirectionBoth },
                    { value: "left", label: labels.petRoamDirectionLeft },
                    { value: "right", label: labels.petRoamDirectionRight }
                  ]}
                  onChange={(value) => updateDraft({ petRoamDirection: value as PetRoamDirection })}
                />
              }
            />
            <Row
              label={labels.petRoamFrequency}
              control={
                <NumberControl
                  value={draft.petRoamFrequencySeconds}
                  min={5}
                  max={180}
                  unit={labels.secondUnit}
                  onChange={(petRoamFrequencySeconds) => updateDraft({ petRoamFrequencySeconds })}
                />
              }
            />
            <Row
              label={labels.petRoamDuration}
              control={
                <NumberControl
                  value={draft.petRoamDurationSeconds}
                  min={1}
                  max={30}
                  unit={labels.secondUnit}
                  onChange={(petRoamDurationSeconds) => updateDraft({ petRoamDurationSeconds })}
                />
              }
            />
            <Row
              label={labels.petIdleMotionFrequency}
              control={
                <NumberControl
                  value={draft.petIdleMotionSeconds}
                  min={1}
                  max={12}
                  unit={labels.secondUnit}
                  onChange={(petIdleMotionSeconds) => updateDraft({ petIdleMotionSeconds })}
                />
              }
            />
          </div>
        </section>

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.reminders}</h2>
        <Row
          label={labels.enableBreakReminder}
          control={
            <ToggleControl
              checked={draft.breakReminderEnabled}
              onChange={(breakReminderEnabled) => updateDraft({ breakReminderEnabled })}
              ariaLabel={labels.enableBreakReminder}
            />
          }
        />
        <Row
          label={labels.breakInterval}
          control={
            <NumberControl
              value={draft.breakIntervalMinutes}
              min={1}
              max={180}
              unit={labels.minuteUnit}
              onChange={(breakIntervalMinutes) => updateDraft({ breakIntervalMinutes })}
            />
          }
        />
        <Row
          label={labels.enableScreenBlock}
          control={
            <ToggleControl
              checked={draft.screenBlockReminderEnabled}
              onChange={(screenBlockReminderEnabled) => updateDraft({ screenBlockReminderEnabled })}
              ariaLabel={labels.enableScreenBlock}
            />
          }
        />
        <Row
          label={labels.screenBlockDuration}
          control={
            <NumberControl
              value={draft.screenBlockDurationSeconds}
              min={15}
              max={600}
              unit={labels.secondUnit}
              onChange={(screenBlockDurationSeconds) => updateDraft({ screenBlockDurationSeconds })}
            />
          }
        />
        <Row
          label={labels.screenBlockCoverage}
          control={
            <NumberControl
              value={Math.round(draft.screenBlockCoverageRatio * 100)}
              min={35}
              max={100}
              unit="%"
              onChange={(value) => updateDraft({ screenBlockCoverageRatio: value / 100 })}
            />
          }
        />
        <Row
          label={labels.enableHydrationReminder}
          control={
            <ToggleControl
              checked={draft.hydrationReminderEnabled}
              onChange={(hydrationReminderEnabled) => updateDraft({ hydrationReminderEnabled })}
              ariaLabel={labels.enableHydrationReminder}
            />
          }
        />
        <Row
          label={labels.hydrationInterval}
          control={
            <NumberControl
              value={draft.hydrationIntervalMinutes}
              min={1}
              max={240}
              unit={labels.minuteUnit}
              onChange={(hydrationIntervalMinutes) => updateDraft({ hydrationIntervalMinutes })}
            />
          }
        />
      </section>

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.focus}</h2>
        <Row
          label={labels.focusDuration}
          control={
            <NumberControl
              value={draft.focusDurationMinutes}
              min={1}
              max={120}
              unit={labels.minuteUnit}
              onChange={(focusDurationMinutes) => updateDraft({ focusDurationMinutes })}
            />
          }
        />
        <Row
          label={labels.enableAgentActivity}
          hint={labels.agentActivityHelp}
          control={
            <ToggleControl
              checked={draft.agentActivityEnabled}
              onChange={(agentActivityEnabled) => updateDraft({ agentActivityEnabled })}
              ariaLabel={labels.enableAgentActivity}
            />
          }
        />
        <Row
          label={labels.enableDistractionDetection}
          hint={
            draft.distractionDetectionEnabled
              ? labels.detectionFocusHelp
              : labels.detectionOffHelp
          }
          control={
            <ToggleControl
              checked={draft.distractionDetectionEnabled}
              onChange={(distractionDetectionEnabled) => updateDraft({ distractionDetectionEnabled })}
              ariaLabel={labels.enableDistractionDetection}
            />
          }
        />
        {draft.distractionDetectionEnabled ? (
          <>
            <Row
              label={labels.detectionGrace}
              control={
                <NumberControl
                  value={draft.distractionGraceSeconds}
                  min={0}
                  max={120}
                  unit={labels.secondUnit}
                  onChange={(distractionGraceSeconds) => updateDraft({ distractionGraceSeconds })}
                />
              }
            />
            <Row
              label={labels.blockedApps}
              control={
                <ChipsControl
                  value={draft.distractionBlockedApps}
                  labels={labels}
                  onChange={(distractionBlockedApps) => updateDraft({ distractionBlockedApps })}
                />
              }
            />
            <Row
              label={labels.blockedKeywords}
              control={
                <ChipsControl
                  value={draft.distractionBlockedKeywords}
                  labels={labels}
                  onChange={(distractionBlockedKeywords) => updateDraft({ distractionBlockedKeywords })}
                />
              }
            />
          </>
        ) : null}
        <div className="prefs__inline-actions">
          {snapshot.focusActive ? (
            <button type="button" className="pref-button" onClick={window.pawpause.stopFocus}>
              {labels.stopFocus}
            </button>
          ) : (
            <button type="button" className="pref-button is-primary" onClick={window.pawpause.startFocus}>
              {labels.startFocus}
            </button>
          )}
        </div>
      </section>

      {!window.pawpause.isPackaged && (
        <section className="prefs__group">
          <h2 className="prefs__group-title">{labels.testTools}</h2>
          <div className="test-tools">
            <DemoChip trigger="break" label={labels.demoBreak} />
            <DemoChip trigger="hydration" label={labels.demoWater} />
            <DemoChip trigger="focusWarning" label={labels.demoFocusWarning} />
            <DemoChip trigger="happy" label={labels.demoHappy} />
            <button type="button" className="pref-chip-button" onClick={window.pawpause.resetToday}>
              {labels.resetToday}
            </button>
          </div>
        </section>
      )}

      <section className="prefs__group prefs__group--quiet">
        <button
          type="button"
          className="prefs__disclosure"
          onClick={() => setDiagnosticsOpen((open) => !open)}
          aria-expanded={diagnosticsOpen}
        >
          <span>{labels.diagnostics}</span>
          <span className="prefs__disclosure-caret">{diagnosticsOpen ? "▾" : "▸"}</span>
        </button>
        {diagnosticsOpen ? (
          <div className="prefs__diag">
            <DiagGroup title={labels.runtime}>
              <DiagCard label={labels.state} value={snapshot.petState} />
              <DiagCard
                label={labels.mode}
                value={
                  snapshot.focusActive
                    ? labels.focus
                    : labels.idle
                }
              />
              <DiagCard label={labels.reminder} value={snapshot.blockingMode ?? labels.none} />
              <DiagCard
                label={labels.dog}
                value={snapshot.dogVisible ? labels.visible : labels.hidden}
              />
            </DiagGroup>

            <DiagGroup title={labels.distraction}>
              <DiagCard
                label={labels.status}
                value={formatDistractionState(snapshot.distraction.state, labels)}
              />
              <DiagCard
                label={labels.matched}
                value={snapshot.distraction.matchedRule ?? labels.none}
              />
              <DiagCard
                label={labels.app}
                value={snapshot.distraction.activeApp || labels.none}
              />
              <DiagCard
                label={labels.checked}
                value={formatTimestamp(snapshot.distraction.lastCheckedAt, language, labels)}
              />
            </DiagGroup>

            {snapshot.distraction.activeWindowTitle ? (
              <p className="prefs__diag-note">{snapshot.distraction.activeWindowTitle}</p>
            ) : null}
            <p className="prefs__diag-hint">{distractionHelp(snapshot, labels)}</p>

            <DiagGroup title={labels.timers}>
              <DiagCard
                label={labels.break}
                value={formatTimer(snapshot.timers.breakDueAt, now, language, labels)}
              />
              <DiagCard
                label={labels.water}
                value={formatTimer(snapshot.timers.hydrationDueAt, now, language, labels)}
              />
              <DiagCard
                label={labels.focusEnd}
                value={formatTimer(snapshot.timers.focusEndsAt, now, language, labels)}
              />
              <DiagCard
                label={labels.updated}
                value={new Intl.DateTimeFormat(localeFor(language), {
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(now)}
              />
            </DiagGroup>
          </div>
        ) : null}
      </section>

        </>
      ) : null}
    </main>
  );
}

function PetCard({
  pet,
  label,
  selected,
  onSelect
}: {
  pet?: InstalledPet;
  label: string;
  selected: boolean;
  onSelect: () => void;
}): JSX.Element {
  const asset = useMemo(
    () => getSelectedPetAsset(pet?.slug ?? "boxcat", pet ? [pet] : [], "idle"),
    [pet]
  );
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`pet-card${selected ? " is-selected" : ""}`}
      onClick={onSelect}
    >
      <span className="pet-card__preview">
        {asset.kind === "sprite" ? (
          <span
            className="sprite-pet sprite-pet--preview"
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
          <span className="fallback-pet fallback-pet--preview" aria-hidden="true">
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
      </span>
      <span className="pet-card__name">{label}</span>
    </button>
  );
}

function DemoChip({ trigger, label }: { trigger: DemoTrigger; label: string }): JSX.Element {
  return (
    <button
      type="button"
      className="pref-chip-button"
      onClick={() => window.pawpause.triggerDemo(trigger)}
    >
      {label}
    </button>
  );
}

function DiagGroup({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="diag-group">
      <h3 className="diag-group__title">{title}</h3>
      <div className="diag-group__grid">{children}</div>
    </section>
  );
}

function DiagCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="diag-card">
      <span className="diag-card__label">{label}</span>
      <span className="diag-card__value">{value}</span>
    </div>
  );
}
