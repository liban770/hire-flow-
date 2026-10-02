/**
 * HireFlow API Client
 * Interfaces directly with the Express backend connected to Microsoft SQL Server.
 */

export interface MssqlHealthStatus {
  connected: boolean;
  server: string;
  database?: string;
  currentTime?: string;
  error?: string;
  hint?: string;
}

export async function checkMssqlHealth(): Promise<MssqlHealthStatus> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      server: 'DESKTOP-PK86AT',
      error: err.message || 'Server offline',
    };
  }
}

export async function fetchUsersFromDb() {
  try {
    const res = await fetch('/api/users');
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function registerUserInDb(userData: any) {
  try {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function approveUserInDb(adminId: string, targetUserId: string) {
  try {
    const res = await fetch('/api/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, targetUserId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchJobsFromDb() {
  try {
    const res = await fetch('/api/jobs');
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function createJobInDb(jobData: any) {
  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchActivityLogsFromDb() {
  try {
    const res = await fetch('/api/activity-logs');
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function logActivityInDb(activityData: any) {
  try {
    const res = await fetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
