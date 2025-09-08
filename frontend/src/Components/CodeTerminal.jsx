import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { io } from "socket.io-client";

export default function CodeTerminal() {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      rows: 20,
      theme: {
        background: "#111827", // Tailwind gray-900
        foreground: "#f9fafb", // Tailwind gray-50
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // connect socket.io
    const socket = io(); // 👈 change when deploying

    // handle output from backend
    socket.on("output", (data) => {
      term.write(data);
    });

    // handle typing: echo locally + send to backend
    term.onData((data) => {
      term.write(data); // local echo
      socket.emit("input", data);
    });

    socketRef.current = socket;

    return () => {
      term.dispose();
      socket.disconnect();
    };
  }, []);

  const runCode = () => {
    if (socketRef.current) {
      socketRef.current.emit("run", { command: "node", args: ["code.js"] });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between bg-gray-700 p-2">
        <button
          onClick={runCode}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Run
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 bg-gray-900" />
    </div>
  );
}
