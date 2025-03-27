import React from 'react';
import { View, Text, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
import { colors } from '@/constants/colours';
import { useTheme } from '@/context/theme-context';
import { useFont } from '@/context/font-context';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  isStoreUpdate: boolean; // Indicates if a store update is required vs. an OTA update
}

const UpdateModal: React.FC<UpdateModalProps> = ({ visible, onClose, isStoreUpdate }) => {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  const handleUpdatePress = () => {
    if (isStoreUpdate) {
      // Replace with your app's store URLs
      const storeUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/6741070697'
        : 'https://play.google.com/store/apps/details?id=com.challenzsocialapp.app';
      Linking.openURL(storeUrl).catch((err) => console.error('Error opening store:', err));
    }
    onClose();
  };

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
            Update Available
          </Text>
          <Text
            style={{
              color: colors[colorScheme]?.foreground,
              fontSize: 16,
              marginBottom: 20,
              fontFamily: selectedFont,
            }}
          >
            {isStoreUpdate
              ? 'A new version of the app is available. Please update from the store for the best experience.'
              : 'A new update is available. Restart the app to apply it.'}
          </Text>
          <TouchableOpacity
            onPress={handleUpdatePress}
            style={{
              backgroundColor: '#1f5c71',
              padding: 10,
              borderRadius: 5,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 16,
                fontFamily: selectedFont,
              }}
            >
              {isStoreUpdate ? 'Update Now' : 'Restart Now'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 10,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.mutedForeground,
                fontSize: 14,
                fontFamily: selectedFont,
              }}
            >
              Not Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;