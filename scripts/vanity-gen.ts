import { Keypair } from "@solana/web3.js";
import { writeFileSync } from "fs";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { cpus } from "os";
import { fileURLToPath } from "url";

const PREFIX = ""; // leave empty for no prefix
const SUFFIX = "Ordosh";
const CASE_SENSITIVE = true; // set to true for exact case matching

if (isMainThread) {
  const numWorkers = cpus().length;
  const searchDesc = [PREFIX && `starting with "${PREFIX}"`, SUFFIX && `ending with "${SUFFIX}"`].filter(Boolean).join(" and ");
  console.log(`🔍 Searching for Solana address ${searchDesc} (case-${CASE_SENSITIVE ? "sensitive" : "insensitive"})`);
  console.log(`⚡ Spawning ${numWorkers} worker threads\n`);

  const workers: Worker[] = [];
  let totalAttempts = 0;
  let found = false;
  const startTime = Date.now();

  const scriptPath = fileURLToPath(import.meta.url);

  // Progress logging every 30 seconds
  const progressInterval = setInterval(() => {
    if (!found) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = Math.floor(totalAttempts / (Date.now() - startTime) * 1000);
      console.log(`⏳ ${totalAttempts.toLocaleString()} attempts | ${elapsed}s | ${rate.toLocaleString()}/sec`);
    }
  }, 30_000);

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(scriptPath, {
      workerData: { prefix: PREFIX, suffix: SUFFIX, workerId: i, caseSensitive: CASE_SENSITIVE }
    });

    worker.on("message", (msg) => {
      if (msg.type === "progress") {
        totalAttempts += msg.attempts;
      } else if (msg.type === "found" && !found) {
        found = true;
        clearInterval(progressInterval);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ FOUND by worker ${msg.workerId} after ${totalAttempts.toLocaleString()} total attempts in ${elapsed}s!\n`);
        console.log(`📍 Address: ${msg.address}`);
        console.log(`🔑 Private Key: [${msg.secretKey}]`);

        const output = {
          address: msg.address,
          secretKey: msg.secretKey,
          attempts: totalAttempts,
          elapsed: `${elapsed}s`
        };

        const filename = `vanity-${msg.address.slice(0, 8)}.json`;
        writeFileSync(filename, JSON.stringify(output, null, 2));
        console.log(`\n💾 Saved to ${filename}`);

        const cliFilename = `vanity-${msg.address.slice(0, 8)}-keypair.json`;
        writeFileSync(cliFilename, JSON.stringify(msg.secretKey));
        console.log(`💾 Saved keypair (Solana CLI format) to ${cliFilename}`);

        // Terminate all workers
        workers.forEach(w => w.terminate());
        process.exit(0);
      }
    });

    workers.push(worker);
  }
} else {
  // Worker thread
  const { prefix, suffix, workerId, caseSensitive } = workerData;
  let attempts = 0;
  const reportInterval = 50_000;

  while (true) {
    const keypair = Keypair.generate();
    const address = keypair.publicKey.toBase58();
    attempts++;

    const addrToCheck = caseSensitive ? address : address.toLowerCase();
    const prefixToCheck = caseSensitive ? prefix : prefix.toLowerCase();
    const suffixToCheck = caseSensitive ? suffix : suffix.toLowerCase();

    const matchesPrefix = !prefix || addrToCheck.startsWith(prefixToCheck);
    const matchesSuffix = !suffix || addrToCheck.endsWith(suffixToCheck);
    if (matchesPrefix && matchesSuffix) {
      parentPort!.postMessage({
        type: "found",
        workerId,
        address,
        secretKey: Array.from(keypair.secretKey)
      });
      break;
    }

    if (attempts % reportInterval === 0) {
      parentPort!.postMessage({ type: "progress", attempts: reportInterval });
    }
  }
}
