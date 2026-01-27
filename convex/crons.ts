import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expired subscriptions every hour and stop their VMs
crons.hourly(
  "stop-expired-vms",
  { minuteUTC: 0 },
  internal.subscriptions.stopExpiredVMs
);

export default crons;
