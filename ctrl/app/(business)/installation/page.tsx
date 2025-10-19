"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

export default function InstallPage() {
  const repo = "kariuki-george/tunnelicious"; // replace with your repo
  const latestRelease = `https://github.com/${repo}/releases/latest`;

  const commands = {
    mac: `curl -L ${latestRelease}/download/tunnelicious-darwin-amd64.zip -o tunnelicious.zip && unzip tunnelicious.zip && sudo mv tunnelicious /usr/local/bin/`,
    linux: `curl -L ${latestRelease}/download/tunnelicious-linux-amd64.zip -o tunnelicious.zip && unzip tunnelicious.zip && sudo mv tunnelicious /usr/local/bin/`,
    windows: `Invoke-WebRequest -Uri "${latestRelease}/download/tunnelicious-windows-amd64.zip" -OutFile "tunnelicious.zip"; Expand-Archive tunnelicious.zip; Move-Item tunnelicious.exe "C:\\Windows\\System32\\"`,
  };

  return (
    <div className="flex flex-col items-center  space-y-10 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight">
        Install Tunnelicious
      </h1>
      <p className=" text-center">
        Download and install the latest version of the Tunnelicious agent from
        our GitHub releases.
      </p>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>1. Download</CardTitle>
        </CardHeader>
        <CardContent className="flex  items-baseline gap-2 justify-between  space-y-2">
          <p className="text-sm ">
            Visit the latest release page and download the binary for your
            platform.
          </p>
          <a href={latestRelease} target="_blank" rel="noreferrer">
            <Button className="hover:cursor-pointer">View Releases</Button>
          </a>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>2. Install via Command Line</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(commands).map(([os, cmd]) => (
            <div key={os}>
              <h3 className="capitalize font-medium mb-1">{os}</h3>
              <div className="flex gap-2 bg-gray-800/80 rounded-md items-center ">
                <pre className=" text-white text-sm p-3 bg-gray-700/70  border-r  overflow-x-auto">
                  <code> {cmd}</code>
                </pre>
                <CopyButton value={cmd} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>3. Verify Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-700/70 text-white text-sm p-3 rounded-md overflow-x-auto">
            tunnelicious -h
          </pre>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>4. Run Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-700/70 text-white text-sm p-3 rounded-md overflow-x-auto">
            tunnelicious --token ... --target http://localhost:3000
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export function CopyButton({ value }: { value: string }) {
  const handleCopy = async () => await navigator.clipboard.writeText(value);

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}>
      <Copy className="w-4 h-4" />
    </Button>
  );
}
