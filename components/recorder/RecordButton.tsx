import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colours';
import { useTheme } from '@/context/theme-context';

interface RecordButtonProps {
  isRecording: boolean;
  animationProgress: Animated.Value;
  onPress: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, animationProgress, onPress }) => {
  const { colorScheme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={['#fff', '#1f5c71', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}
      >
        <Animated.View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isRecording
              ? animationProgress.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,0,0,1)', 'rgba(255,0,0,1)'] })
              : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'videocam-sharp'}
            size={24}
            color={colors[colorScheme]?.foreground}
          />
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default RecordButton;