import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import {Audio} from "@remotion/media";
import {SceneSequence} from "./SceneView";
import type {EpisodeProps} from "../types";

/** Écran de fin : « À suivre… » pendant 1 seconde. */
const Cliffhanger: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "#05050a",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        color: "#00E5FF",
        fontSize: 72,
        fontWeight: 800,
        fontFamily: "Arial, Helvetica, sans-serif",
        textShadow: "0 0 30px rgba(0,229,255,0.6)",
      }}
    >
      À suivre…
    </div>
  </AbsoluteFill>
);

/** Composant épisode réutilisable, piloté par le JSON + métadonnées calculées. */
export const Episode: React.FC<EpisodeProps> = ({
  data,
  scenes,
  hasMusic,
  hasRain,
}) => {
  const {fps} = useVideoConfig();
  const scenesDuration = scenes.reduce((s, sc) => s + sc.durationInFrames, 0);

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <SceneSequence scenes={scenes} />

      {data.cliffhanger ? (
        <Sequence
          from={scenesDuration}
          durationInFrames={1 * fps}
          premountFor={fps}
        >
          <Cliffhanger />
        </Sequence>
      ) : null}

      {/* Musique de fond en boucle à 15 % si présente */}
      {hasMusic ? (
        <Audio src={staticFile("audio/music.mp3")} volume={0.15} loop />
      ) : null}

      {/* Pluie en fond à 10 % si présente */}
      {hasRain ? (
        <Audio src={staticFile("audio/rain.mp3")} volume={0.1} loop />
      ) : null}
    </AbsoluteFill>
  );
};
