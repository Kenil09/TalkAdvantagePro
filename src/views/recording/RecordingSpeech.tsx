import { useCallback, useEffect, useRef, useState } from "react";
import {
  AssemblyAI,
  RealtimeTranscript,
  SessionBeginsEventData,
} from "assemblyai";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAudioRecordingStore } from "@/lib/store/audio-recording.store";
import {
  CircleDot,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Squircle,
  Zap,
} from "lucide-react";
import { floatTo16BitPCM } from "@/utils/audio.helper";
import { AUDIO_RECORDING_STATE } from "@/constants/audio-recording.constants";
import { AudioRecordingState } from "@/types/audio-recording.types";
import { convertSecondsToTime } from "@/utils/dateFormats";
import { useTranscriptionStore } from "@/lib/store/transcription.store";

const RecordingSpeech = ({
  editMode,
  setHotLinkModal,
}: {
  editMode: boolean;
  setHotLinkModal: (modal: boolean) => void;
}) => {
  const transcriberRef = useRef<ReturnType<
    AssemblyAI["realtime"]["transcriber"]
  > | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);

  const [recordingTime, setRecordingTime] = useState<number>(0);

  // const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const {
    recordingState,
    setRecordingState,
    isMuted,
    toggleMute,
    mediaRecorder,
    setMediaRecorder,
    audioChunks,
    setAudioChunks,
  } = useAudioRecordingStore();

  const { isConnecting, setIsConnecting, setIsTranscribing, setLiveText } =
    useTranscriptionStore();

  // Initialize AssemblyAI transcription
  const initializeTranscription = useCallback(async () => {
    try {
      setIsConnecting(true);

      // Get token from your API endpoint
      const response = await fetch("/api/assemblyai/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to get token");
      }

      const { token } = await response.json();

      if (!token) {
        throw new Error("Temporary token missing from response");
      }

      // Create the AssemblyAI client using the SDK
      const client = new AssemblyAI({ apiKey: token });

      console.log("AssemblyAI client created");

      // Create a real-time transcriber with the correct sample rate
      const transcriber = client.realtime.transcriber({
        sampleRate: 16000,
        token,
      });

      // Set up transcriber event handlers
      transcriber.on("open", (data: SessionBeginsEventData) => {
        const { sessionId } = data;
        console.log(`AssemblyAI session opened with ID: ${sessionId}`);
        setIsTranscribing(true);
        setIsConnecting(false);
      });

      transcriber.on("transcript", (transcript: RealtimeTranscript) => {
        if (!transcript.text || transcript.message_type !== "FinalTranscript") {
          return;
        }
        console.log(`AssemblyAI FinalTranscript:`, transcript.text);
        // Append final transcript segment to live text and update word count
        setLiveText((prev) => {
          const newText = `${prev}${prev ? " " : ""}${transcript.text}`;

          // Update word count if needed
          // if (isIntervalEnabled && analysisInterval.startsWith("words-")) {
          //   const wordLimit = Number.parseInt(analysisInterval.split("-")[1]);
          //   const currentWordCount = newText.trim().split(/\s+/).length;

          //   if (currentWordCount >= wordLimit) {
          //     // Schedule the analysis and text trimming for the next tick
          //     setTimeout(() => {
          //       if (processContentRef.current) {
          //         processContentRef.current();
          //         // Reset word count by trimming the text to keep only the remainder
          //         const words = newText.trim().split(/\s+/);
          //         const remainingWords = words.slice(wordLimit).join(" ");
          //         setLiveText(remainingWords);
          //       }
          //     }, 0);
          //   }
          // }
          return newText;
        });

        // Store segment in session
        // sessionStore.addTranscriptSegment(transcript.text);
      });

      transcriber.on("error", (error: Error) => {
        console.error("AssemblyAI transcriber error:", error);
        // handleError(
        //   ErrorType.TRANSCRIPTION,
        //   error.message || "Transcription error",
        //   {
        //     details: "Error from transcription service",
        //   }
        // );
      });

      transcriber.on("close", (code: number, reason: string) => {
        console.log(`AssemblyAI session closed: ${code} ${reason}`);
        setIsTranscribing(false);
      });

      // Connect to the service
      console.log("Connecting to AssemblyAI real-time service...");
      await transcriber.connect();

      // Save references
      transcriberRef.current = transcriber;
    } catch (error) {
      console.error("Error initializing transcription:", error);
      setIsConnecting(false);
      // handleError(
      //   ErrorType.TRANSCRIPTION,
      //   error instanceof Error ? error.message : "Unknown error",
      //   {
      //     details: "Could not initialize transcription",
      //   }
      // );
    }
  }, [setIsConnecting, setIsTranscribing, setLiveText]);

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
      await initializeTranscription();

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
  }, [
    audioChunks,
    initializeTranscription,
    isMuted,
    setAudioChunks,
    setMediaRecorder,
    setRecordingState,
  ]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
    }

    setRecordingState("paused");

    // toast({
    //   title: "Recording Paused",
    //   description: "Your recording has been paused. Press play to continue.",
    // })
  }, [mediaRecorder, setRecordingState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
    }

    setRecordingState("recording");

    // toast({
    //   title: "Recording Resumed",
    //   description: "Your recording has been resumed.",
    // })
  }, [mediaRecorder, setRecordingState]);

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
  }, [recordingState, mediaRecorder, setRecordingState, setMediaRecorder]);

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
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : recordingState === AUDIO_RECORDING_STATE.idle ? (
          <div className="flex items-center space-x-2">
            <Button
              className="!px-2 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={startRecording}
            >
              <CircleDot className="!h-4 !w-4 stroke-red-500" />
            </Button>
            <p className="text-sm font-medium text-gray-700">Start Recording</p>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-gray-700 capitalize">
                {recordingState}
              </p>
              <p className="text-sm text-gray-500">
                {convertSecondsToTime(recordingTime)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                className="!px-2 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="size-4" />
                ) : (
                  <Mic className="size-4" />
                )}
              </Button>
              {recordingState === AUDIO_RECORDING_STATE.recording && (
                <Button
                  className="!px-2 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  onClick={pauseRecording}
                >
                  <Pause className="size-4" />
                </Button>
              )}
              {recordingState === AUDIO_RECORDING_STATE.paused && (
                <Button
                  className="!px-2 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  onClick={resumeRecording}
                >
                  <Play className="size-4 stroke-green-400" />
                </Button>
              )}
              <Button
                className="!px-2 py-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                onClick={stopRecording}
              >
                <Squircle />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Button
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-500 transition-colors cursor-pointer"
            onClick={() => setHotLinkModal(true)}
          >
            <Zap className="w-3 h-3 " />
            HotLink
          </Button>
          <div className="text-sm text-gray-800 space-x-4">
            <p>|</p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-800">Interval:</p>
            {editMode ? (
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Min</SelectItem>
                  <SelectItem value="10">10 Min</SelectItem>
                  <SelectItem value="15">15 Min</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-800">5 Min</p>
            )}
          </div>
          <div className="text-sm text-gray-800 space-x-4">
            <p>|</p>
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-800">Auto-process:</p>
            {editMode ? (
              <Switch />
            ) : (
              <p className="text-sm text-gray-800">On</p>
            )}
          </div>
          <Button className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-500 transition-colors cursor-pointer">
            Process Now
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
        <Progress value={50} color="#631bff" className="h-1.5" />
        <p className="whitespace-nowrap">Processing speech...</p>
      </div>
    </div>
  );
};

export default RecordingSpeech;
