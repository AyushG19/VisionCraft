import { env } from "../config";

async function ping(URL: string) {
  // await axios.get(URL, {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   timeout: 5000,
  // });
  await fetch(URL, { method: "GET", mode: "no-cors", keepalive: true });
}

async function pingHttp() {
  await ping(`${env.HTTP_BACKEND_URL}/api/health/ping`);
}

async function pingWs() {
  await ping(`${env.WS_BACKEND_URL}/ping`);
}

async function pingWorker() {
  await ping(`${env.WORKER_BACKEND_URL}/ping`);
}

export async function pingAllBackend() {
  await pingHttp();
  await pingWorker();
  await pingWs();
}
