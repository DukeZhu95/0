import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors } from '@/constants/colours';
import { useTheme } from '@/context/theme-context';
import { useFont } from '@/context/font-context';

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (time: number) => void;
  recordingTime: number;
}

const TimerModal: React.FC<TimerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  recordingTime,
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
            Select Timer Duration
          </Text>

          {/* Timer Options */}
          {[10, 30, 60, 120].map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => onConfirm(time)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
                padding: 10,
                borderRadius: 5,
                backgroundColor: recordingTime === time ? 'blue' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                {time} seconds
              </Text>
            </TouchableOpacity>
          ))}

          {/* Close Modal */}
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

export default TimerModal;