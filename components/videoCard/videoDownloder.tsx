// VideoDownloader.tsx - Desktop-compatible version
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/config/supabase'; // Adjust path as needed

interface VideoDownloaderProps {
  videoUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

const VideoDownloader: React.FC<VideoDownloaderProps> = ({
  videoUrl,
  isVisible,
  onClose,
}) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);

  // Detect if running on desktop (web) or mobile
  useEffect(() => {
    const checkPlatform = async () => {
      // Check if running on web
      if (Platform.OS === 'web') {
        setIsDesktop(true);
        return;
      }

      // For mobile platforms, check if media library permissions are available
      try {
        const { status } = await MediaLibrary.getPermissionsAsync();
        // If we can't get permissions status, assume we're on desktop/web
        if (status === null) {
          setIsDesktop(true);
        }
      } catch (error) {
        console.log('Error checking permissions, assuming desktop:', error);
        setIsDesktop(true);
      }
    };

    checkPlatform();
  }, []);

  // Reset state when modal is opened
  useEffect(() => {
    if (isVisible) {
      setDownloadProgress(0);
      setDownloadState('idle');
      setErrorMessage(null);
      setDownloadedUri(null);
    }
  }, [isVisible]);

  // Function to refresh Supabase Storage URL
  const refreshVideoUrl = async (url: string): Promise<string> => {
    try {
      // Extract the path from the URL
      // This assumes a URL format like: https://[supabase-project].supabase.co/storage/v1/object/public/videos/filename.mp4
      const urlParts = url.split('/');
      const bucketIndex = urlParts.indexOf('public');
      
      if (bucketIndex === -1) {
        console.log('Could not parse bucket path from URL, using original URL');
        return url;
      }
      
      // The bucket name should be the part after 'public'
      const bucketName = urlParts[bucketIndex + 1];
      // The path is everything after the bucket name joined by '/'
      const videoPath = urlParts.slice(bucketIndex + 2).join('/');
      
      console.log(`Refreshing URL for bucket: ${bucketName}, path: ${videoPath}`);
      
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(videoPath, 60); // Create a URL valid for 60 seconds
        
      if (error) {
        console.error('Error refreshing video URL:', error);
        return url; // Fall back to existing URL
      }
      
      console.log('Successfully refreshed signed URL');
      return data.signedUrl;
    } catch (error) {
      console.error('Exception in refreshVideoUrl:', error);
      return url; // Fall back to existing URL in case of any error
    }
  };

  // Special handling for desktop or web platforms
  const handleDesktopDownload = async () => {
    try {
      setDownloadState('downloading');
      setDownloadProgress(0.5); // Indeterminate progress for desktop

      // Refresh the URL if it's from Supabase storage
      const refreshedUrl = await refreshVideoUrl(videoUrl);
      console.log('Desktop: Opening URL in browser:', refreshedUrl);
      
      // For desktop/web, we'll open the URL in a new browser tab
      // This will allow the browser's native download functionality to take over
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(refreshedUrl, '_blank');
        setDownloadState('success');
      } else {
        // For other platforms where media library isn't available
        // Use WebBrowser or Linking to open the URL
        try {
          await WebBrowser.openBrowserAsync(refreshedUrl);
          setDownloadState('success');
        } catch (webBrowserError) {
          // Fallback to Linking if WebBrowser fails
          const canOpen = await Linking.canOpenURL(refreshedUrl);
          if (canOpen) {
            await Linking.openURL(refreshedUrl);
            setDownloadState('success');
          } else {
            throw new Error('Cannot open URL');
          }
        }
      }
    } catch (error: any) {
      console.error('Desktop download error:', error);
      setDownloadState('error');
      setErrorMessage(error.message || 'Failed to open video URL');
    }
  };

  // Mobile download process
  const handleMobileDownload = async () => {
    try {
      setDownloadState('downloading');
      setDownloadProgress(0);
      
      // Request permission first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        // If permission denied but sharing is available, offer that instead
        if (await Sharing.isAvailableAsync()) {
          setDownloadState('idle'); // Reset state
          handleDesktopDownload(); // Use desktop flow which will use Sharing
          return;
        }
        
        setDownloadState('error');
        setErrorMessage('Permission to access media library was denied');
        return;
      }
      
      console.log('Starting download from:', videoUrl);
      
      // Refresh the URL if it's from Supabase storage
      const refreshedUrl = await refreshVideoUrl(videoUrl);
      
      // Generate a unique filename
      const fileName = `video-${Date.now()}.mp4`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Download the file with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        refreshedUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      setDownloadedUri(uri);
      
      // Save to media library based on platform
      if (Platform.OS === 'ios') {
        const asset = await MediaLibrary.createAssetAsync(uri);
        console.log('iOS: Saved to media library', asset);
      } else {
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('Challenz Videos', asset, false);
        console.log('Android: Saved to Challenz Videos album');
      }
      
      setDownloadState('success');
    } catch (error: any) {
      console.error('Download error:', error);
      setDownloadState('error');
      setErrorMessage(error.message || 'An unknown error occurred');
    }
  };

  // Start appropriate download process based on platform
  const startDownload = async () => {
    if (isDesktop) {
      await handleDesktopDownload();
    } else {
      await handleMobileDownload();
    }
  };

  // Handle sharing downloaded file
  const handleShareFile = async () => {
    if (!downloadedUri) return;
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedUri);
      } else {
        setErrorMessage('Sharing is not available on this device');
      }
    } catch (error: any) {
      console.error('Sharing error:', error);
      setErrorMessage(error.message || 'Failed to share file');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {downloadState === 'idle' ? (isDesktop ? 'Download Video' : 'Save Video') :
             downloadState === 'downloading' ? 'Downloading...' :
             downloadState === 'success' ? 'Download Complete' :
             'Download Failed'}
          </Text>
          
          {downloadState === 'idle' && (
            <Text style={styles.message}>
              {isDesktop 
                ? 'This will open the video in a new browser tab where you can download it.'
                : `Save this video to your ${Platform.OS === 'ios' ? 'Photos app' : 'Gallery'}?`
              }
            </Text>
          )}
          
          {downloadState === 'downloading' && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#1e90ff" />
              <Text style={styles.progressText}>
                {isDesktop ? 'Opening...' : `${Math.floor(downloadProgress * 100)}%`}
              </Text>
              {!isDesktop && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${downloadProgress * 100}%` }
                    ]} 
                  />
                </View>
              )}
            </View>
          )}
          
          {downloadState === 'success' && (
            <View style={styles.successContainer}>
              <FontAwesome name="check-circle" size={50} color="green" />
              <Text style={styles.successText}>
                {isDesktop 
                  ? 'Video opened in browser' 
                  : `Video saved to your ${Platform.OS === 'ios' ? 'Photos app' : 'Gallery'}`}
              </Text>
            </View>
          )}
          
          {downloadState === 'error' && (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={50} color="red" />
              <Text style={styles.errorText}>
                {errorMessage || 'Failed to download video'}
              </Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {downloadState === 'idle' && (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.downloadButton]} 
                  onPress={startDownload}
                >
                  <Text style={styles.buttonText}>
                    {isDesktop ? 'Open in Browser' : (Platform.OS === 'ios' ? 'Save to Photos' : 'Save to Gallery')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
            
            {downloadState === 'success' && (
              <>
                {!isDesktop && downloadedUri && (
                  <TouchableOpacity 
                    style={[styles.button, styles.shareButton]} 
                    onPress={handleShareFile}
                  >
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.button, styles.doneButton]} 
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
            
            {downloadState === 'error' && (
              <TouchableOpacity 
                style={[styles.button, styles.doneButton]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1e90ff',
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  successText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  downloadButton: {
    backgroundColor: '#1e90ff',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  doneButton: {
    backgroundColor: '#1e90ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#1e90ff',
    fontSize: 16,
  },
});

export default VideoDownloader;