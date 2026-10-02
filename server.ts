import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getMssqlPool, query, sql } from './src/lib/mssql.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// ============================================================================
// RESILIENT MSSQL API ROUTES WITH AUTOMATIC LOCAL FALLBACK
// ============================================================================

// 1. Health & Connection Status
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const result = await query<{ currentTime: Date; serverName: string }>(
      'SELECT SYSUTCDATETIME() AS currentTime, @@SERVERNAME AS serverName'
    );
    res.json({
      connected: true,
      mode: 'mssql_live',
      server: result.recordset[0]?.serverName || process.env.MSSQL_SERVER || 'DESKTOP-PK86AT',
      currentTime: result.recordset[0]?.currentTime,
      database: process.env.MSSQL_DATABASE || 'HireFlowDB',
    });
  } catch (error: any) {
    res.json({
      connected: false,
      mode: 'local_storage',
      server: process.env.MSSQL_SERVER || 'DESKTOP-PK86AT',
      message: 'Running in LocalStorage mode. Microsoft SQL Server will sync when host is connected.',
    });
  }
});

// 2. GET All Users
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT [Id] AS id, [Name] AS name, [Email] AS email, [Role] AS role, [RegistrationType] AS registrationType, [Status] AS status, [Verified] AS verified, [Company] AS company, [Title] AS title, [Avatar] AS avatar, [CreatedAt] AS createdAt FROM [dbo].[Users] ORDER BY [CreatedAt] DESC'
    );
    res.json({ success: true, connected: true, data: result.recordset });
  } catch {
    res.json({ success: true, connected: false, data: [] });
  }
});

// 3. POST Register User
app.post('/api/users/register', async (req: Request, res: Response) => {
  const { id, name, email, password, role, registrationType, status, verified, company, title, avatar } = req.body;
  const userId = id || `user-${Date.now()}`;
  const userStatus = status || 'pending_approval';

  try {
    await query(
      `INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], [Status], [Verified], [Company], [Title], [Avatar])
       VALUES (@id, @name, @email, @password, @role, @regType, @status, @verified, @company, @title, @avatar)`,
      {
        id: { value: userId },
        name: { value: name },
        email: { value: email },
        password: { value: password || 'default123' },
        role: { value: role || 'candidate' },
        regType: { value: registrationType || 'candidate' },
        status: { value: userStatus },
        verified: { value: verified ? 1 : 0 },
        company: { value: company || null },
        title: { value: title || null },
        avatar: { value: avatar || null },
      }
    );

    res.json({
      success: true,
      connected: true,
      user: { id: userId, name, email, role, registrationType, status: userStatus, verified: !!verified, company, title, avatar },
    });
  } catch {
    // Graceful fallback to client persistence
    res.json({
      success: true,
      connected: false,
      mode: 'local_storage',
      user: { id: userId, name, email, role, registrationType, status: userStatus, verified: !!verified, company, title, avatar },
    });
  }
});

// 4. POST Approve User
app.post('/api/users/approve', async (req: Request, res: Response) => {
  const { adminId, targetUserId, ipAddress } = req.body;

  try {
    const pool = await getMssqlPool();
    const request = pool.request();
    request.input('AdminId', sql.NVarChar, adminId || 'admin-1');
    request.input('TargetUserId', sql.NVarChar, targetUserId);
    request.input('IpAddress', sql.NVarChar, ipAddress || '127.0.0.1');

    await request.execute('[dbo].[sp_ApproveUser]');

    res.json({ success: true, connected: true });
  } catch {
    res.json({ success: true, connected: false, mode: 'local_storage' });
  }
});

// 5. GET All Jobs
app.get('/api/jobs', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT [Id] AS id, [Title] AS title, [Company] AS company, [EmployerId] AS employerId, [Location] AS location, [WorkMode] AS workMode, [Salary] AS salary, [SalaryPeriod] AS salaryPeriod, [SalaryMin] AS salaryMin, [SalaryMax] AS salaryMax, [Tags] AS tags, [Department] AS department, [Description] AS description, [Verified] AS verified, [Status] AS status, [PostedDate] AS postedDate FROM [dbo].[Jobs] ORDER BY [PostedDate] DESC'
    );

    const jobs = result.recordset.map((j: any) => ({
      ...j,
      tags: typeof j.tags === 'string' ? JSON.parse(j.tags || '[]') : j.tags,
    }));

    res.json({ success: true, connected: true, data: jobs });
  } catch {
    res.json({ success: true, connected: false, data: [] });
  }
});

// 6. POST Insert Job
app.post('/api/jobs', async (req: Request, res: Response) => {
  const { id, title, company, employerId, location, workMode, salary, salaryPeriod, salaryMin, salaryMax, tags, department, description, verified, status } = req.body;
  const jobId = id || `job-${Date.now()}`;
  const tagsJson = JSON.stringify(tags || []);

  try {
    await query(
      `INSERT INTO [dbo].[Jobs] ([Id], [Title], [Company], [EmployerId], [Location], [WorkMode], [Salary], [SalaryPeriod], [SalaryMin], [SalaryMax], [Tags], [Department], [Description], [Verified], [Status])
       VALUES (@id, @title, @company, @empId, @location, @workMode, @salary, @period, @sMin, @sMax, @tags, @dept, @desc, @verified, @status)`,
      {
        id: { value: jobId },
        title: { value: title },
        company: { value: company },
        empId: { value: employerId || 'employer-1' },
        location: { value: location || 'Remote' },
        workMode: { value: workMode || 'Remote' },
        salary: { value: salary || '$150,000' },
        period: { value: salaryPeriod || '/yr' },
        sMin: { value: salaryMin || 150000 },
        sMax: { value: salaryMax || 200000 },
        tags: { value: tagsJson },
        dept: { value: department || 'Engineering' },
        desc: { value: description || '' },
        verified: { value: verified ? 1 : 1 },
        status: { value: status || 'Active' },
      }
    );

    res.json({ success: true, connected: true, jobId });
  } catch {
    res.json({ success: true, connected: false, mode: 'local_storage', jobId });
  }
});

// 7. GET Activity Logs
app.get('/api/activity-logs', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT TOP 100 [Id] AS id, [Timestamp] AS timestamp, [FormattedTime] AS formattedTime, [EventType] AS eventType, [ActorName] AS actorName, [ActorEmail] AS actorEmail, [ActorRole] AS actorRole, [Action] AS action, [TargetName] AS targetName, [TargetType] AS targetType, [TargetId] AS targetId, [Status] AS status, [IpAddress] AS ipAddress, [DetailsJson] AS detailsJson FROM [dbo].[ActivityLogs] ORDER BY [Timestamp] DESC'
    );

    const logs = result.recordset.map((l: any) => ({
      ...l,
      details: l.detailsJson ? JSON.parse(l.detailsJson) : undefined,
    }));

    res.json({ success: true, connected: true, data: logs });
  } catch {
    res.json({ success: true, connected: false, data: [] });
  }
});

// 8. POST Activity Log
app.post('/api/activity-logs', async (req: Request, res: Response) => {
  const { id, eventType, actorName, actorEmail, actorRole, action, targetName, targetType, targetId, status, ipAddress, details } = req.body;
  const logId = id || `log-${Date.now()}`;
  const formattedTime = new Date().toISOString().substring(11, 19) + ' UTC';

  try {
    await query(
      `INSERT INTO [dbo].[ActivityLogs] ([Id], [Timestamp], [FormattedTime], [EventType], [ActorName], [ActorEmail], [ActorRole], [Action], [TargetName], [TargetType], [TargetId], [Status], [IpAddress], [DetailsJson])
       VALUES (@id, SYSUTCDATETIME(), @time, @eventType, @actorName, @actorEmail, @actorRole, @action, @targetName, @targetType, @targetId, @status, @ip, @details)`,
      {
        id: { value: logId },
        time: { value: formattedTime },
        eventType: { value: eventType || 'system_event' },
        actorName: { value: actorName || 'System' },
        actorEmail: { value: actorEmail || 'system@hireflow.io' },
        actorRole: { value: actorRole || 'system' },
        action: { value: action },
        targetName: { value: targetName || 'System' },
        targetType: { value: targetType || 'system' },
        targetId: { value: targetId || null },
        status: { value: status || 'success' },
        ip: { value: ipAddress || '127.0.0.1' },
        details: { value: details ? JSON.stringify(details) : null },
      }
    );

    res.json({ success: true, connected: true, logId });
  } catch {
    res.json({ success: true, connected: false, mode: 'local_storage', logId });
  }
});

// ============================================================================
// MOUNT VITE MIDDLEWARE (DEV) OR STATIC DIST (PROD)
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HireFlow Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
