import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useState, useEffect } from "react";
import { MdCallEnd } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

export default function VideoRoom() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const token = state?.token;
  const serverUrl = state?.livekitUrl;

  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));

  useEffect(() => {
    if (!token || !serverUrl) {
      console.error("❌ Missing token or server URL");
      alert("Call session expired or invalid!");
      navigate("/");
      return;
    }

    let mounted = true;

    const connectRoom = async () => {
      try {
        if (mounted) {
          await room.connect(serverUrl, token);
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true);
        }
      } catch (err) {
        console.error("❌ LiveKit connection failed:", err);
      }
    };

    connectRoom();

    return () => {
      mounted = false;
      room.disconnect();
    };
  }, [token, serverUrl, room, navigate]);

  const handleLeave = () => {
    room.disconnect();
    navigate("/");
  };

  return (
    <RoomContext.Provider value={room}>
      <div className="fixed inset-0 bg-neutral-800 text-white flex flex-col h-screen w-screen pt-2">

        {/* CONTROL BAR */}
        <div className="max-w-[100dvw] px-2 flex h-[5dvh] mx-auto w-full items-center">
          <h1 className="text-lg font-semibold">POC Call</h1>
          <div className="flex-grow"></div>

          <ControlBar className="h-[5dvh]" />

          <button
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition ml-2"
            onClick={handleLeave}
          >
            <MdCallEnd size={22} />
          </button>
        </div>

        {/* Video Grid */}
        <div className="p-2 h-[95dvh]">
          <VideoGrid />
        </div>

        {/* Audio */}
        <RoomAudioRenderer />
      </div>
    </RoomContext.Provider>
  );
}

function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} className="grid gap-2 h-full w-full">
      <div className="rounded-xl overflow-hidden border border-neutral-700">
        <ParticipantTile className="rounded-xl" />
      </div>
    </GridLayout>
  );
}
