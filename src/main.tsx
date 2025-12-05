import { WebSocketProvider } from "./context/ws.provider";
import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./layout";
import { Home } from "./pages/Home";
import RoomPage from "./pages/Room";
import { WhatIsThisPage } from "./pages/Whatisthis";
import RoomSpectatePage from "./pages/RoomSpectate";

const Main = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            
            <Route path="/about" element={<WhatIsThisPage />} />

            <Route index path="/" element={<Home />} />
            <Route path="/:roomId" element={<RoomPage />} />
            <Route path="/:roomId/spectate" element={<RoomSpectatePage />} />
      
          </Routes>
    </Layout>
      </BrowserRouter>
        </WebSocketProvider>
  );
};

export { Main };
