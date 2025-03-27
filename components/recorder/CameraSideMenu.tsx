import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";

type SoundType = {
    id: string;
    name: string;
    artist: string;
    uri: string;
    year: number;
    isLocal: boolean;
  };

interface CameraSideMenuProps {
  expanded: boolean;
  showLabels: boolean;
  facing: "front" | "back";
  flashMode: "off" | "torch";
  selectedSound: SoundType | null;
  isPlaying: boolean;
  timerSet: boolean;
  recordingTime: number;
  isDirectorMode: boolean;
  showGrid: boolean;
  onToggleMenu: () => void;
  onToggleCameraFacing: () => void;
  onToggleFlash: () => void;
  onOpenSoundModal: () => void;
  onPlaySound: (sound: SoundType) => void;
  onRemoveSound: () => void;
  onOpenTimerModal: () => void;
  onToggleDirectorMode: () => void;
  onToggleGrid: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const CameraSideMenu: React.FC<CameraSideMenuProps> = ({
  expanded,
  showLabels,
  facing,
  flashMode,
  selectedSound,
  isPlaying,
  timerSet,
  recordingTime,
  isDirectorMode,
  showGrid,
  onToggleMenu,
  onToggleCameraFacing,
  onToggleFlash,
  onOpenSoundModal,
  onPlaySound,
  onRemoveSound,
  onOpenTimerModal,
  onToggleDirectorMode,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
}) => {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  return (
    <View
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        padding: 10,
      }}
    >
      <TouchableOpacity
        onPress={onToggleCameraFacing}
        style={{ marginBottom: 10 }}
      >
        <Ionicons
          name="camera-outline"
          size={24}
          color={colors[colorScheme]?.foreground}
        />
        {showLabels && (
          <Text
            style={{ color: colors[colorScheme]?.foreground, fontSize: 12 }}
          >
            Camera
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleFlash} style={{ marginBottom: 10 }}>
        <Ionicons
          name={flashMode === "off" ? "flash-off-outline" : "flash-outline"}
          size={24}
          color={colors[colorScheme]?.foreground}
        />
        {showLabels && (
          <Text
            style={{ color: colors[colorScheme]?.foreground, fontSize: 12 }}
          >
            Flash
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onOpenSoundModal} style={{ marginBottom: 10 }}>
        {!selectedSound ? (
          <>
            <MaterialCommunityIcons
              name="music-note-outline"
              size={24}
              color={colors[colorScheme]?.foreground}
            />
            {showLabels && (
              <Text
                style={{ color: colors[colorScheme]?.foreground, fontSize: 12 }}
              >
                Sounds
              </Text>
            )}
          </>
        ) : (
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: colors[colorScheme]?.background,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {selectedSound.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onPlaySound(selectedSound)}
              style={{ marginLeft: 5 }}
            >
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={24}
                color={colors[colorScheme]?.foreground}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemoveSound} style={{ marginLeft: 3 }}>
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      {expanded && (
        <>
          <TouchableOpacity
            onPress={onOpenTimerModal}
            style={{ marginBottom: 10 }}
          >
            <Ionicons
              name="timer-outline"
              size={24}
              color={timerSet ? "yellow" : "white"}
            />
            {showLabels && (
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 12,
                  fontFamily: selectedFont,
                }}
              >
                Timer: {timerSet ? `${recordingTime}s` : "Off"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggleDirectorMode}
            style={{ marginBottom: 10 }}
            disabled
          >
            <FontAwesome
              name="video-camera"
              size={24}
              color={
                isDirectorMode ? "yellow" : colors[colorScheme]?.mutedForeground
              }
            />
            {showLabels && (
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 12,
                  fontFamily: selectedFont,
                }}
              >
                {isDirectorMode ? "Director Mode: ON" : "Director Mode"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleGrid} style={{ marginBottom: 10 }}>
            <Ionicons
              name="grid-outline"
              size={24}
              color={showGrid ? "yellow" : colors[colorScheme]?.foreground}
            />
            {showLabels && (
              <Text
                style={{ color: colors[colorScheme]?.foreground, fontSize: 12 }}
              >
                {showGrid ? "Grid: ON" : "Grid"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onZoomIn} style={{ marginBottom: 10 }}>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors[colorScheme]?.foreground}
            />
            {showLabels && (
              <Text
                style={{ color: colors[colorScheme]?.foreground, fontSize: 12 }}
              >
                Zoom In
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onZoomOut} style={{ marginBottom: 10 }}>
            <Ionicons
              name="remove-circle-outline"
              size={24}
              color={colors[colorScheme]?.foreground}
            />
            {showLabels && (
              <Text
                style={{ color: colors[colorScheme]?.foreground, fontSize: 12 }}
              >
                Zoom Out
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={onToggleMenu}>
        <Ionicons
          name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={24}
          color={colors[colorScheme]?.foreground}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CameraSideMenu;
