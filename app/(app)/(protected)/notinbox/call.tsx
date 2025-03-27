
import {
  StreamCall,
  RingingCallContent,
  useCalls,
} from "@stream-io/video-react-native-sdk";
import { router } from "expo-router";

export default function CallScreen() {
  
  const calls = useCalls();
  const call = calls[0];
  if (!call) {
    if (router.canGoBack) {
      router.back();
    } else {
      router.push("/");
    }
    return null;
  }
  return (
    <StreamCall call={call}>
      <RingingCallContent />
    </StreamCall>
  );
}
