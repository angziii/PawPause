/// <reference types="vite/client" />

import type { PawPauseApi } from "../preload";

declare global {
  interface Window {
    pawpause: PawPauseApi;
    pawpal?: PawPauseApi;
  }
}
