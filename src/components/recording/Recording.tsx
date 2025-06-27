"use client";

import {
  Circle,
  Loader2,
  Pause,
  Play,
  StopCircle,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecordingStore } from "@/lib/store/audio-recording.store";
import { useCallback, useEffect, useRef, useState } from "react";
import { AssemblyAI } from "assemblyai";
import { floatTo16BitPCM } from "@/utils/audio.helper";
import { AUDIO_RECORDING_STATE } from "@/constants/audio-recording.constants";
import { convertSecondsToTime } from "@/utils/dateFormats";
import { AudioRecordingState } from "@/types/audio-recording.types";

export default function Recording() {
  const transcriberRef = useRef<ReturnType<
    AssemblyAI["realtime"]["transcriber"]
  > | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);

  const [recordingTime, setRecordingTime] = useState<number>(0);

  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const {
    recordingState,
    setRecordingState,
    isMuted,
    setIsMuted,
    mediaRecorder,
    setMediaRecorder,
    audioChunks,
    setAudioChunks,
  } = useAudioRecordingStore();

  const startRecording = useCallback(async () => {
    console.log("startRecording function called"); // Log start of function
    let currentStep = "Checking mediaDevices support";
    try {
      currentStep = "Checking mediaDevices support";
      console.log(`[1/9] ${currentStep}`);
      // Detailed debug information
      console.log("navigator defined:", typeof navigator !== "undefined");
      console.log(
        "navigator.mediaDevices:",
        navigator?.mediaDevices ? "exists" : "does not exist"
      );
      console.log(
        "navigator.mediaDevices.getUserMedia:",
        typeof navigator?.mediaDevices?.getUserMedia === "function"
          ? "exists"
          : "does not exist"
      );

      // More graceful detection that works around some browser quirks
      if (typeof navigator === "undefined") {
        console.error("Navigator is undefined - not in a browser environment");
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Microphone API not available. Please check:");
        console.error(
          "• Browser permissions (look for camera/mic icon in address bar)"
        );
        console.error("• Privacy extensions or settings blocking media access");
        console.error("• Try a different browser (Chrome or Edge recommended)");

        // toast({
        //   variant: "destructive",
        //   title: "Microphone Access API Unavailable",
        //   description:
        //     "Please check browser permissions and try again. Look for camera/mic icon in your address bar.",
        // });
        return;
      }
      currentStep = "Starting new session";
      console.log(`[2/9] ${currentStep}`);

      currentStep = "Requesting microphone access";
      console.log(`[3/9] ${currentStep}`);
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentStep = "Microphone access granted";
      console.log(`[4/9] ${currentStep}`);
      audioStreamRef.current = stream;

      currentStep = "Creating MediaRecorder";
      console.log(`[5/9] ${currentStep}`);
      const recorder = new MediaRecorder(stream);

      currentStep = "Setting up MediaRecorder event handlers";
      console.log(`[6/9] ${currentStep}`);
      // Set up event handlers
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          // Store chunk for session recording; transcription is handled via Web Audio pipeline
          setAudioChunks([...audioChunks, e.data]);
        }
      };

      currentStep = "Starting MediaRecorder";
      console.log(`[7/9] ${currentStep}`);
      // Start recording
      recorder.start(500);
      currentStep = "Updating component state (pre-async)";
      console.log(`[8/9] ${currentStep}`);
      setMediaRecorder(recorder);
      setRecordingTime(0);
      setAudioChunks([]);

      currentStep = "Initializing AssemblyAI transcription";
      console.log(`[9/9] ${currentStep}`);
      // Initialize AssemblyAI transcription
      //   await initializeTranscription();

      // Set up Web Audio pipeline using AudioWorklet
      // Explicitly set sample rate to match AssemblyAI expectation
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      // Load the processor
      try {
        await audioCtx.audioWorklet.addModule("/audio-processor.js");
      } catch (e) {
        console.error("Error loading audio worklet module:", e);
        // Attempt cleanup before returning
        stream.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        setRecordingState("idle");
        return;
      }

      // Create nodes
      const sourceNode = audioCtx.createMediaStreamSource(
        audioStreamRef.current!
      );
      audioSourceRef.current = sourceNode;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      audioAnalyzerRef.current = analyser;
      const workletNode = new AudioWorkletNode(audioCtx, "audio-processor");
      audioWorkletNodeRef.current = workletNode;

      // Handle messages from the worklet (audio data)
      workletNode.port.onmessage = (event) => {
        // event.data is the Float32Array from the processor
        if (transcriberRef.current && !isMuted) {
          // Use the correct helper function name
          const pcmData = floatTo16BitPCM(event.data);
          // Send the audio data to the transcriber
          transcriberRef.current.sendAudio(pcmData.buffer);
        }
      };

      // Connect the nodes: Mic Source -> Analyser -> Worklet -> Destination (optional, for hearing audio)
      sourceNode.connect(analyser);
      sourceNode.connect(workletNode);
      // workletNode.connect(audioCtx.destination) // Uncomment to hear mic input

      // toast({
      //   title: "Recording Started & Transcribing",
      //   description: "Your session is now being recorded and transcribed.",
      // });

      // Set recording state *after* everything is initialized
      setRecordingState("recording");

      console.log("startRecording finished successfully.");
    } catch (error) {
      console.error(
        `Error during startRecording at step: ${currentStep}`,
        error
      );

      // Ensure state is reset on error
      setRecordingState("idle");
    }
  }, [isMuted]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
    }

    setRecordingState("paused");

    // toast({
    //   title: "Recording Paused",
    //   description: "Your recording has been paused. Press play to continue.",
    // })
  }, [mediaRecorder]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
    }

    setRecordingState("recording");

    // toast({
    //   title: "Recording Resumed",
    //   description: "Your recording has been resumed.",
    // })
  }, [mediaRecorder]);

  const stopRecording = useCallback(() => {
    if (recordingState === AUDIO_RECORDING_STATE.idle) return;

    // Stop media recorder
    if (mediaRecorder) {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      setMediaRecorder(null);
    }

    // // Show initial processing toast
    // toast({
    //   title: "Processing Recording",
    //   description: "Your recording is being processed. It will appear in your library in a few moments.",
    // })

    // Disconnect and clean up
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (transcriberRef.current) {
      transcriberRef.current.close().catch(console.error);
      transcriberRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    // Cleanup Web Audio resources
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.close();
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.disconnect();
      audioAnalyzerRef.current = null;
    }

    setRecordingState(AUDIO_RECORDING_STATE.idle as AudioRecordingState);
  }, [recordingState, mediaRecorder, audioChunks, recordingTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recordingState === AUDIO_RECORDING_STATE.recording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [recordingState]);

  return (
    <div className="flex border p-2">
      <div className="flex items-center gap-2">
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : recordingState === AUDIO_RECORDING_STATE.idle ? (
          <Button variant="ghost" size="icon" onClick={startRecording}>
            <CircleDot className="!h-4 !w-4 stroke-red-500" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Circle
              className={`!h-4 !w-4 fill-current  animate-ping ${
                recordingState === AUDIO_RECORDING_STATE.recording
                  ? "text-red-500"
                  : "text-yellow-500"
              }`}
            />
            <span className="text-grey-500 capitalize">{recordingState}</span>

            <div className="text-muted-foreground">
              {convertSecondsToTime(recordingTime)}
            </div>

            <div className="flex">
              {recordingState === AUDIO_RECORDING_STATE.recording && (
                <Button variant="ghost" size="icon" onClick={pauseRecording}>
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              {recordingState === AUDIO_RECORDING_STATE.paused && (
                <Button variant="ghost" size="icon" onClick={resumeRecording}>
                  <Play className="h-4 w-4 stroke-green-400" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={stopRecording}>
                <StopCircle className="h-8 w-8 stroke-red-500" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
