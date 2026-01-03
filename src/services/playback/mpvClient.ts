import net from "net";

type MpvResponse = {
  error?: string;
  data?: any;
  [key: string]: any;
};

export class MpvClient {
  constructor(private socketPath: string) {}

  send(command: any[]): Promise<MpvResponse> {
    return new Promise((resolve, reject) => {
      const client = net.createConnection({ path: this.socketPath });

      let buffer = "";

      client.on("connect", () => {
        const payload = JSON.stringify({ command }) + "\n";
        client.write(payload);
      });

      client.on("data", (chunk) => {
        buffer += chunk.toString("utf8");

        // mpv IPC = newline-delimited JSON
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);

          if (!line) continue;

          try {
            const msg: MpvResponse = JSON.parse(line);

            // mpv replies with {"error":"success"} or {"error":"<reason>"}
            if ("error" in msg) {
              client.end();
              resolve(msg);
              return;
            }
          } catch {
            // ignore malformed/partial lines
          }
        }
      });

      client.on("error", (err) => {
        reject(err);
      });

      client.on("end", () => {
        // If mpv closed without a proper JSON reply
        if (buffer.trim()) {
          resolve({ raw: buffer });
        }
      });
    });
  }
}
