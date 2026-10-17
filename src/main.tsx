import { WebSocketProvider } from "./context/ws.provider";
import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./layout";
import { Home } from "./pages/Home";
import { WhatIsThisPage } from "./pages/Whatisthis";
import { HowToPlayPage } from "./pages/HowToPlay";
import { PowersPage } from "./pages/Powers";
import { StreamerRedirect } from "./pages/StreamerRedirect";
import { STREAMER_PATH } from "./context/streamer.store";
import { lazy, Suspense } from "react";

// Split off the game screens (Chart.js, the trading UI) so Home, /about and /how-to-play load fast.
const RoomPage = lazy(() => import("./pages/Room"));
const RoomSpectatePage = lazy(() => import("./pages/RoomSpectate"));
const CastPage = lazy(() => import("./cast"));

const Main = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-dots loading-lg"></span></div>}>
          <Routes>
            <Route path="/cast" element={<CastPage />} />
            <Route path="/about" element={<WhatIsThisPage />} />
            <Route path="/how-to-play" element={<HowToPlayPage />} />
            <Route path="/powers" element={<PowersPage />} />
            <Route path={STREAMER_PATH} element={<StreamerRedirect />} />

            <Route index path="/" element={<Home />} />
            <Route path="/:roomId" element={<RoomPage />} />
            <Route path="/:roomId/spectate" element={<RoomSpectatePage />} />
      
          </Routes>
          </Suspense>
    </Layout>
      </BrowserRouter>
        </WebSocketProvider>
  );
};

export { Main };
