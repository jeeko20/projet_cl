// Types partagés de la série

/** Une scène décrite dans le JSON d'épisode */
export type Scene = {
  id: number;
  speaker: "narrateur" | "nova" | "kai";
  text: string;
  image: string;
  audio: string;
  /** Description visuelle de la scène, pour générer l'image soi-même */
  imagePrompt?: string;
};

/** Un épisode complet (format de src/episodes/ep{N}.json) */
export type EpisodeData = {
  episode: number;
  title: string;
  cliffhanger: boolean;
  scenes: Scene[];
};

/** Métadonnées calculées d'une scène (durée réelle de l'audio + respiration) */
export type SceneMeta = Scene & {
  durationInFrames: number;
  imageOk: boolean;
  audioOk: boolean;
};

/** Props injectées dans <Episode /> par calculateMetadata */
export type EpisodeProps = {
  data: EpisodeData;
  scenes: SceneMeta[];
  hasMusic: boolean;
  hasRain: boolean;
};
