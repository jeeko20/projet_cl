import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Audio} from "@remotion/media";
import type {SceneMeta} from "../types";

// Couleur du texte des sous-titres selon le locuteur
const SPEAKER_COLORS: Record<string, string> = {
  narrateur: "#FFFFFF",
  nova: "#00E5FF", // cyan
  kai: "#FF9800", // orange
};

/** Écran d'erreur lisible quand un fichier manque, affichant le nom attendu. */
const MissingFile: React.FC<{label: string; path: string; hint?: string}> = ({
  label,
  path,
  hint,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#0a0a12",
      justifyContent: "center",
      alignItems: "center",
      padding: 60,
      textAlign: "center",
    }}
  >
    <div style={{color: "#FF3B5C", fontSize: 48, fontWeight: 800}}>
      Fichier {label} manquant
    </div>
    <div style={{color: "#888", fontSize: 34, marginTop: 24}}>
      Attendu : {path}
    </div>
    {hint ? (
      <div
        style={{
          color: "#9aa",
          fontSize: 28,
          marginTop: 32,
          fontStyle: "italic",
          maxWidth: 800,
        }}
      >
        imagePrompt : {hint}
      </div>
    ) : null}
  </AbsoluteFill>
);

/** Une scène : image Ken Burns, crossfade, sous-titres, audio. */
export const SceneView: React.FC<{
  scene: SceneMeta;
  index: number;
  previous?: SceneMeta;
}> = ({scene, index, previous}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Zoom lent Ken Burns : 1.0 -> 1.08 sur toute la scène
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Petit déplacement alterné selon l'index de la scène
  const dir = index % 2 === 0 ? 1 : -1;
  const translateX = interpolate(frame, [0, durationInFrames], [0, 30 * dir], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, durationInFrames], [0, -18 * dir], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Crossfade d'entrée (9 frames) : l'image précédente s'efface, la nouvelle apparaît
  const incomingOpacity = interpolate(frame, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outgoingOpacity = interpolate(frame, [0, 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Glitch léger pendant les 9 premières frames : à-coups horizontaux discrets
  const glitching = frame < 9;
  const glitchX = glitching
    ? Math.sin(frame * 12.3) * (9 - frame) * 1.6
    : 0;

  const speakerColor = SPEAKER_COLORS[scene.speaker] ?? "#FFFFFF";

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {/* Image précédente qui s'efface (crossfade) */}
      {previous && previous.imageOk ? (
        <AbsoluteFill>
          <CanvasImage
            src={staticFile(previous.image)}
            premountFor={fps}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: outgoingOpacity,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {scene.imageOk ? (
        <AbsoluteFill
          style={{
            scale,
            translate: `${translateX + glitchX}px ${translateY}px`,
          }}
        >
          <CanvasImage
            src={staticFile(scene.image)}
            premountFor={fps}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: incomingOpacity,
            }}
          />
        </AbsoluteFill>
      ) : (
        <MissingFile label="image" path={scene.image} hint={scene.imagePrompt} />
      )}

      {/* Léger voile bas pour lisibilité des sous-titres */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 35%)",
        }}
      />

      {/* Sous-titres en bas */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 140,
          paddingLeft: 70,
          paddingRight: 70,
        }}
      >
        <div
          style={{
            color: speakerColor,
            fontSize: 44,
            fontWeight: 800,
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "center",
            lineHeight: 1.35,
            // Contour sombre pour la lisibilité
            textShadow:
              "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 12px rgba(0,0,0,0.8)",
          }}
        >
          {scene.text}
        </div>
      </AbsoluteFill>

      {scene.audioOk ? (
        <Audio src={staticFile(scene.audio)} premountFor={fps} />
      ) : (
        <MissingFile label="audio" path={scene.audio} />
      )}
    </AbsoluteFill>
  );
};

/** Séquence complète des scènes d'un épisode (crossfade de 9 frames). */
export const SceneSequence: React.FC<{scenes: SceneMeta[]}> = ({scenes}) => {
  let offset = 0;
  return (
    <>
      {scenes.map((scene, i) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationInFrames}
            premountFor={30}
          >
            <SceneView scene={scene} index={i} previous={i > 0 ? scenes[i - 1] : undefined} />
          </Sequence>
        );
      })}
    </>
  );
};
