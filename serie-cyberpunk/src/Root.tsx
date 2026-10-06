import React from "react";
import {CalculateMetadataFunction, Composition, staticFile} from "remotion";
import {Episode} from "./components/Episode";
import {computeScenes} from "./utils/episodeMetadata";
import type {EpisodeData, EpisodeProps} from "./types";
import ep1 from "./episodes/ep1.json";

const FPS = 30;

// Durée minimale d'un épisode, en secondes
const MIN_EPISODE_S = 30;

// Props par défaut : un épisode minimal, recalculé par calculateMetadata
const defaultPropsFor = (data: EpisodeData): EpisodeProps => ({
  data,
  scenes: [],
  hasMusic: false,
  hasRain: false,
});

// Calcule la durée totale : somme des durées de scènes + 1 s de cliffhanger
const makeCalculateMetadata = (
  data: EpisodeData,
): CalculateMetadataFunction<EpisodeProps> => {
  return async () => {
    let scenes = await computeScenes(data, FPS);
    let scenesFrames = scenes.reduce((s, sc) => s + sc.durationInFrames, 0);
    const cliffFrames = data.cliffhanger ? FPS : 0;

    // Durée minimale d'un épisode : 30 secondes.
    // Si trop court, on prolonge la dernière scène (plan figé de respiration).
    const minFrames = Math.ceil(MIN_EPISODE_S * FPS);
    if (scenesFrames + cliffFrames < minFrames) {
      const deficit = minFrames - (scenesFrames + cliffFrames);
      scenes = scenes.map((s, i) =>
        i === scenes.length - 1
          ? {...s, durationInFrames: s.durationInFrames + deficit}
          : s,
      );
      scenesFrames += deficit;
    }

    const hasMusic = await fileExists("audio/music.mp3");
    const hasRain = await fileExists("audio/rain.mp3");

    return {
      durationInFrames: Math.max(1, scenesFrames + cliffFrames),
      props: {data, scenes, hasMusic, hasRain},
    };
  };
};

const fileExists = async (path: string): Promise<boolean> => {
  try {
    const res = await fetch(staticFile(path), {method: "HEAD"});
    return res.ok;
  } catch {
    return false;
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Un épisode = une composition : ajouter src/episodes/ep{N}.json suffit */}
      <Composition
        id="Ep1"
        component={Episode}
        durationInFrames={FPS * 60}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultPropsFor(ep1 as EpisodeData)}
        calculateMetadata={makeCalculateMetadata(ep1 as EpisodeData)}
      />
    </>
  );
};
