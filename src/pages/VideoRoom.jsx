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
import { useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

export default function VideoRoom() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const token = state?.token;
  const serverUrl = state?.livekitUrl;
  const [room] = useState(
    () => new Room({ adaptiveStream: true, dynacast: true })
  );
  // eslint-disable-next-line
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("🎤 Permission granted", stream);

      await room.connect(serverUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      await room.localParticipant.setCameraEnabled(true);
    } catch (err) {
      console.error("❌ Error accessing media:", err);
      alert("Please allow mic/camera permissions in your browser settings.");
    }
  };

  const handleLeave = () => {
    room.disconnect();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white">
      {!joined ? (
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-semibold">Ready to Join the Call??</h1>
          <button
            onClick={handleJoin}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
          >
            Join Now
          </button>
        </div>
      ) : (
        <RoomContext.Provider value={room}>
          <div className="flex flex-col h-screen w-screen">
            {/* CONTROL BAR */}
            <div className="flex items-center justify-between p-3 bg-neutral-800">
              <h1 className="text-lg font-semibold">Live Call</h1>
              <div className="flex items-center gap-3">
                <ControlBar />
                <button
                  onClick={handleLeave}
                  className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg transition"
                >
                  <MdCallEnd size={22} />
                </button>
              </div>
            </div>

            {/* VIDEO GRID */}
            <div className="flex-1 p-3 overflow-hidden">
              <VideoGrid />
            </div>

            <RoomAudioRenderer />
          </div>
        </RoomContext.Provider>
      )}
    </div>
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
      {tracks.map((trackRef) => (
        <ParticipantTile key={trackRef.publication.sid} trackRef={trackRef} />
      ))}
    </GridLayout>
  );
}
