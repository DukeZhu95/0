import React from 'react';
import { 
  Modal as RNModal, 
  View, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/theme-context';
import { colors } from '@/constants/colors';

type ColorScheme = keyof typeof colors;

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  showOverlay?: boolean;
  animationType?: "none" | "slide" | "fade";
  position?: "center" | "bottom";
  overlayOpacity?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  children,
  showOverlay = true,
  animationType = "slide",
  position = "center",
  overlayOpacity = 0.5,
}) => {
  const { colorScheme } = useTheme();
  const currentColors = colors[colorScheme as ColorScheme];

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onDismiss}
      animationType={animationType}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={[
          styles.overlay,
          showOverlay && { 
            backgroundColor: currentColors?.muted,
            opacity: overlayOpacity,
          }
        ]}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.content,
              position === "bottom" && styles.bottomPosition,
              position === "center" && styles.centerPosition,
              { backgroundColor: currentColors?.background }
            ]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: height * 0.9,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  centerPosition: {
    // Center position styles are handled by default overlay styles
  },
});

export default Modal;