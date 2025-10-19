import React from "react";
import { TunnelList } from "./components/TunnelList";
import { CreateTunnel } from "./components/CreateTunnelModal";

const page = () => {
  return (
    <div className="w-full ">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold mb-2">Your Tunnels</h1>
        <CreateTunnel />
      </div>
      <p className="text-gray-500 mb-4">You can manage up to 3 tunnels here.</p>
      <TunnelList />
    </div>
  );
};

export default page;
