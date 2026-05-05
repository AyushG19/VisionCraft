import axios from "axios";
import { env } from "@/config";

async function ping(URL: string) {
  await axios.get(URL, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
  });
}

async function pingHttp() {
  await ping(`${env.HTTP_BACKEND_URL}/api/health/ping`);
}

async function pingWs() {
  await ping(env.WS_BACKEND_URL);
}

async function pingWorker() {
  await ping(env.WORKER_BACKEND_URL);
}

export async function pingAllBackend() {
  await pingHttp();
  await pingWorker();
}
