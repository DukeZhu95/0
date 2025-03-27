import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colours';
import { useTheme } from '@/context/theme-context';
import { useFont } from '@/context/font-context';

interface SoundModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocalSound: () => void;
}

const SoundModal: React.FC<SoundModalProps> = ({
  visible,
  onClose,
  onSelectLocalSound,
}) => {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          style={{
            backgroundColor: colors[colorScheme]?.primary,
            padding: 20,
            borderRadius: 10,
            width: '80%',
          }}
        >
          <Text
            style={{
              color: colors[colorScheme]?.foreground,
              fontSize: 18,
              marginBottom: 10,
              fontFamily: selectedFont,
            }}
          >
            Select Sound
          </Text>
          <Text
            style={{
              color: colors[colorScheme]?.foreground,
              fontSize: 14,
              marginBottom: 20,
              fontFamily: selectedFont,
            }}
          >
            Choose a sound from local storage or online library
          </Text>

          <TouchableOpacity
            onPress={onSelectLocalSound}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Ionicons
              name="folder-open-outline"
              size={24}
              color={colors[colorScheme]?.foreground}
            />
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 16,
                marginLeft: 10,
                fontFamily: selectedFont,
              }}
            >
              Select from Local Storage
            </Text>
          </TouchableOpacity>

          <View
            style={{
              height: 1,
              backgroundColor: colors[colorScheme]?.foreground,
              marginVertical: 10,
            }}
          />

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#1f5c71',
              padding: 10,
              borderRadius: 5,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 16,
                fontFamily: selectedFont,
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SoundModal;