import subprocess
import time
import re
import os

URL_FILE = os.path.join(os.path.dirname(__file__), "current_live_url.txt")

def run_tunnel():
    cmd = [
        "ssh",
        "-o", "StrictHostKeyChecking=no",
        "-o", "ServerAliveInterval=10",
        "-o", "ServerAliveCountMax=3",
        "-R", "80:localhost:8000",
        "nokey@localhost.run"
    ]
    while True:
        try:
            print("Starting localhost.run tunnel...", flush=True)
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in proc.stdout:
                print(line, end="", flush=True)
                match = re.search(r'https://[a-zA-Z0-9.-]+\.lhr\.life', line)
                if match:
                    url = match.group(0)
                    with open(URL_FILE, "w") as f:
                        f.write(url + "\n")
                    print(f"\n==========================================", flush=True)
                    print(f"  ACTIVE LIVE URL: {url}", flush=True)
                    print(f"==========================================\n", flush=True)
            proc.wait()
            print("Tunnel connection dropped. Reconnecting in 3 seconds...", flush=True)
            time.sleep(3)
        except Exception as e:
            print(f"Error in tunnel supervisor: {e}", flush=True)
            time.sleep(5)

if __name__ == "__main__":
    run_tunnel()
