type PawPauseWindow = Window & {
  pawpause?: Window["pawpause"];
  pawpal?: Window["pawpause"];
};

export function pawpauseApi(): Window["pawpause"] | undefined {
  const api = (window as PawPauseWindow).pawpause ?? (window as PawPauseWindow).pawpal;
  if (api && !(window as PawPauseWindow).pawpause) {
    (window as PawPauseWindow).pawpause = api;
  }
  return api;
}
