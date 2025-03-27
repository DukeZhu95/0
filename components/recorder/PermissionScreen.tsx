import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colours';
import { useTheme } from '@/context/theme-context';
import { useFont } from '@/context/font-context';

interface PermissionScreenProps {
  onGrantPermissions: () => Promise<void>;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({ onGrantPermissions }) => {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors[colorScheme]?.primary,
      }}
    >
      <Text
        style={{
          color: colors[colorScheme]?.foreground,
          fontSize: 16,
          marginBottom: 20,
          fontFamily: selectedFont,
        }}
      >
        We need your permission to use the camera and microphone
      </Text>
      <TouchableOpacity
        onPress={onGrantPermissions}
        style={{
          backgroundColor: colors[colorScheme]?.background,
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text
          style={{
            color: colors[colorScheme]?.foreground,
            fontFamily: selectedFont,
            fontSize: 16,
          }}
        >
          Grant Permissions
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PermissionScreen;