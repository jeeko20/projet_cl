import {staticFile} from "remotion";
import {Input, ALL_FORMATS, UrlSource} from "mediabunny";
import type {EpisodeData, SceneMeta} from "../types";

// Durée de respiration ajoutée à chaque scène (en secondes)
const RESPIRATION_S = 0.3;
// Durée utilisée quand le fichier audio est introuvable (écran d'erreur)
const FALLBACK_S = 4;

/** Vérifie l'existence d'un fichier dans public/ (HEAD request). */
const exists = async (path: string): Promise<boolean> => {
  try {
    const res = await fetch(staticFile(path), {method: "HEAD"});
    return res.ok;
  } catch {
    return false;
  }
};

/** Durée d'un fichier audio en secondes, via mediabunny (voir skill get-audio-duration). */
export const getAudioDuration = async (path: string): Promise<number> => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(staticFile(path)),
  });
  try {
    return await input.computeDuration();
  } finally {
    input.dispose();
  }
};

/** Calcule les métadonnées de toutes les scènes d'un épisode. */
export const computeScenes = async (
  data: EpisodeData,
  fps = 30,
): Promise<SceneMeta[]> => {
  return Promise.all(
    data.scenes.map(async (scene) => {
      const [imageOk, audioOkFile] = await Promise.all([
        exists(scene.image),
        exists(scene.audio),
      ]);
      let durationS = FALLBACK_S;
      let audioOk = false;
      if (audioOkFile) {
        try {
          durationS = (await getAudioDuration(scene.audio)) + RESPIRATION_S;
          audioOk = true;
        } catch {
          durationS = FALLBACK_S;
        }
      }
      return {
        ...scene,
        imageOk,
        audioOk,
        durationInFrames: Math.max(1, Math.round(durationS * fps)),
      };
    }),
  );
};
