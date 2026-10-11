import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { sendSms, smsProvider, type Sms } from '../../clients/sms';
import { env } from '../../config/env';
import { decrypt, encrypt } from '../../lib/crypto';
import { logger } from '../../lib/logger';
import { maskPhone } from '../../lib/phone';
import { notifyRepo } from './notify.repository';

const QUEUE = 'sms';
const ATTEMPTS = 3;

/** Job payload: the number and text are AES-GCM encrypted, so Redis never holds them in clear. */
type JobData = { logId: number; sealed: string };

let queueConn: IORedis | null = null;
let workerConn: IORedis | null = null;
let queue: Queue<JobData> | null = null;
let worker: Worker<JobData> | null = null;

const useQueue = () => !env.isTest && process.env.SMS_QUEUE !== 'inline';

/**
 * Producer connection fails fast while Redis is down (no offline buffering), so a message we send
 * directly instead is never also replayed from the buffer later. The worker keeps reconnecting.
 */
function connect(failFast: boolean) {
  const c = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null, enableOfflineQueue: !failFast });
  c.on('error', () => undefined);
  return c;
}

function getQueue() {
  queue ??= new Queue<JobData>(QUEUE, {
    connection: (queueConn ??= connect(true)),
    defaultJobOptions: { attempts: ATTEMPTS, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true, removeOnFail: 1000 },
  });
  return queue;
}

async function deliver(logId: number, sms: Sms, attempt: number) {
  try {
    const r = await sendSms(sms);
    await notifyRepo.markSent(logId, r.providerId, attempt);
  } catch (err) {
    await notifyRepo.markFailed(logId, (err as Error).message, attempt, attempt >= ATTEMPTS);
    throw err;
  }
}

/** Without a queue (tests, or Redis down): send now, retrying with backoff, without blocking the caller. */
async function deliverInline(logId: number, sms: Sms) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return await deliver(logId, sms, attempt);
    } catch {
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
    }
  }
}

const withTimeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('queue timeout')), ms))]);

/**
 * Queue one SMS per recipient. Returns the delivery-log ids. Never throws because of the queue:
 * if Redis is unreachable the messages are sent directly, so an SOS still goes out.
 */
export async function enqueueSms(userId: number | null, messages: Sms[]): Promise<number[]> {
  const provider = smsProvider();
  const logs = await Promise.all(messages.map((m) => notifyRepo.createLog({ userId, kind: m.kind, toMasked: maskPhone(m.to), provider })));
  const jobs = messages.map((m, i) => ({ logId: logs[i].id, sms: m }));

  if (useQueue()) {
    try {
      await withTimeout(
        getQueue().addBulk(jobs.map((j) => ({ name: j.sms.kind, data: { logId: j.logId, sealed: encrypt(JSON.stringify(j.sms)) } }))),
        2500
      );
      return logs.map((l) => l.id);
    } catch {
      logger.error('sms queue unavailable, sending directly');
    }
  }
  const inline = Promise.all(jobs.map((j) => deliverInline(j.logId, j.sms)));
  if (env.isTest) await inline; // deterministic in tests
  else void inline;
  return logs.map((l) => l.id);
}

/** Start the SMS worker in this process (API by default; or a dedicated `npm run worker`). */
export function startSmsWorker() {
  if (!useQueue() || worker) return;
  worker = new Worker<JobData>(
    QUEUE,
    async (job: Job<JobData>) => {
      const sms = JSON.parse(decrypt(job.data.sealed)) as Sms;
      await deliver(job.data.logId, sms, job.attemptsMade + 1);
    },
    { connection: (workerConn ??= connect(false)), concurrency: 10 }
  );
  worker.on('error', () => undefined);
}

export async function closeSmsQueue() {
  await Promise.allSettled([worker?.close(), queue?.close()]);
  queueConn?.disconnect();
  workerConn?.disconnect();
}
