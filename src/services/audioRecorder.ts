import { Audio } from "expo-av";
import type { AudioRecordingResult } from "../types/audio";

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
  isMeteringEnabled: true,
};

let currentRecording: Audio.Recording | null = null;

export async function requestPermissions(): Promise<boolean> {
  const { granted } = await Audio.requestPermissionsAsync();
  return granted;
}

export async function startRecording(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
  currentRecording = recording;
}

export async function pauseRecording(): Promise<void> {
  if (!currentRecording) return;
  await currentRecording.pauseAsync();
}

export async function resumeRecording(): Promise<void> {
  if (!currentRecording) return;
  await currentRecording.startAsync();
}

export async function stopRecording(): Promise<AudioRecordingResult | null> {
  if (!currentRecording) return null;

  const status = await currentRecording.getStatusAsync();
  await currentRecording.stopAndUnloadAsync();

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  const uri = currentRecording.getURI();
  currentRecording = null;

  if (!uri) return null;

  return {
    uri,
    durationMs: status.isRecording ? status.durationMillis : 0,
  };
}

export async function cancelRecording(): Promise<void> {
  if (!currentRecording) return;

  await currentRecording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });
  currentRecording = null;
}

export async function getStatus(): Promise<Audio.RecordingStatus | null> {
  if (!currentRecording) return null;
  return currentRecording.getStatusAsync();
}

export function getRecording(): Audio.Recording | null {
  return currentRecording;
}
