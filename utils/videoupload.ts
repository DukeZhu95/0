import axios from "axios";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/config/supabase";
import { sightengineModelsString } from "@/constants/helper";

// Sightengine API Config
const SIGHTENGINE_API_USER = process.env.EXPO_PUBLIC_SITE_ENGINE_API_USER;
const SIGHTENGINE_API_SECRET = process.env.EXPO_PUBLIC_SITE_ENGINE_API_SECRET;
const CALLBACK_URL = process.env.EXPO_PUBLIC_EDGE_FUNCTION_ENDPOINT;
const SIGHTENGINE_MODELS = sightengineModelsString
  
const SUPABASE_STORAGE_BUCKET = "social-challenges";

/**
 * Extracts a filename from the local file URI.
 */
const getFileName = (uri: string, prefix: string = "video"): string => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 100000);
  return `${prefix}_${timestamp}_${randomNum}.${uri.split(".").pop() || "mp4"}`;
};

/**
 * Uploads a video file to Supabase Storage and returns the public URL.
 */
const uploadToSupabase = async (uri: string, path: string): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists)
      throw new Error("Selected video file does not exist.");

    const fileData = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, Buffer.from(fileData, "base64"), {
        contentType: "video/mp4",
      });

    if (error) throw error;

    return `${supabase.storageUrl}/object/public/${SUPABASE_STORAGE_BUCKET}/${data.path}`;
  } catch (error: any) {
    console.error("Error Uploading Video:", error.message);
    throw error;
  }
};

/**
 * Uploads a general user video.
 */
export const uploadVideo = async (uri: string): Promise<string> => {
  const filePath = `videos/${getFileName(uri)}`;
  return uploadToSupabase(uri, filePath);
};

/**
 * Uploads a contest video.
 */
export const uploadContestVideo = async (
  uri: string,
  contestId: string
): Promise<string> => {
  const filePath = `contests/${contestId}/${getFileName(uri, "contest_video")}`;
  return uploadToSupabase(uri, filePath);
};

/**
 * Initiates video moderation using Sightengine.
 */
export const moderateVideo = async (videoUrl: string) => {
  try {
    const response = await axios.get(
      "https://api.sightengine.com/1.0/video/check.json",
      {
        params: {
          stream_url: videoUrl,
          callback_url: CALLBACK_URL,
          models: SIGHTENGINE_MODELS,
          api_user: SIGHTENGINE_API_USER,
          api_secret: SIGHTENGINE_API_SECRET,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Sightengine moderation error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Saves a video submission to Supabase.
 */
const saveSubmission = async (
  submissionData: Record<string, any>
): Promise<any> => {
  const { data, error } = await supabase
    .from("submissions")
    .insert([submissionData]);
  if (error) throw error;
  return data;
};

/**
 * Saves a regular video submission.
 */
export const saveToSupabase = async (
  userId: string,
  videoUrl: string,
  title: string,
  description: string,
  sightengineMediaId?: string
) => {
  return saveSubmission({
    user_id: userId,
    video_url: videoUrl,
    title,
    description,
    sightengine_media_id: sightengineMediaId,
    moderation_status: "pending",
  });
};

/**
 * Saves a contest video submission.
 */
export const saveContestSubmission = async (
  userId: string,
  contestId: string,
  videoUrl: string,
  title: string,
  description: string,
  sightengineMediaId?: string
) => {
  return saveSubmission({
    user_id: userId,
    contest_id: contestId,
    video_url: videoUrl,
    title,
    description,
    sightengine_media_id: sightengineMediaId,
    moderation_status: "pending",
    created_at: new Date().toISOString(),
    is_contest_submission: true,
  });
};
