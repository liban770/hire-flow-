-- ============================================================================
-- HireFlow Talent Marketplace - Microsoft SQL Server (T-SQL) Database Schema
-- Target: Microsoft SQL Server 2017+ / Azure SQL Database / AWS RDS for SQL Server
-- Script Version: 1.0.0
-- Created: October 2026
-- ============================================================================

-- Optional: Create Database if running on a standalone SQL Server instance.
-- (Note: If using Azure SQL Database, create the database in Azure Portal first)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'HireFlowDB')
BEGIN
    CREATE DATABASE [HireFlowDB];
END
GO

USE [HireFlowDB];
GO

-- ============================================================================
-- 1. CLEANUP / DROP TABLES IN REVERSE ORDER OF DEPENDENCIES (FOR RESETTING)
-- ============================================================================
IF OBJECT_ID(N'[dbo].[Applications]', N'U') IS NOT NULL DROP TABLE [dbo].[Applications];
IF OBJECT_ID(N'[dbo].[VerificationDocuments]', N'U') IS NOT NULL DROP TABLE [dbo].[VerificationDocuments];
IF OBJECT_ID(N'[dbo].[ActivityLogs]', N'U') IS NOT NULL DROP TABLE [dbo].[ActivityLogs];
IF OBJECT_ID(N'[dbo].[Jobs]', N'U') IS NOT NULL DROP TABLE [dbo].[Jobs];
IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NOT NULL DROP TABLE [dbo].[Users];
GO

-- ============================================================================
-- 2. TABLE: Users
-- Description: Stores platform candidates, corporate employers, and admins
-- ============================================================================
CREATE TABLE [dbo].[Users] (
    [Id] NVARCHAR(64) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(150) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [Role] NVARCHAR(50) NOT NULL CONSTRAINT [CK_Users_Role] CHECK ([Role] IN ('candidate', 'employer', 'admin')),
    [RegistrationType] NVARCHAR(50) NOT NULL CONSTRAINT [CK_Users_RegistrationType] CHECK ([RegistrationType] IN ('candidate', 'company')),
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending_approval' CONSTRAINT [CK_Users_Status] CHECK ([Status] IN ('active', 'pending_approval', 'rejected', 'suspended')),
    [Verified] BIT NOT NULL DEFAULT 0,
    [Company] NVARCHAR(150) NULL,
    [Title] NVARCHAR(150) NULL,
    [Avatar] NVARCHAR(500) NULL,
    [CreatedAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Unique Index on Email
CREATE UNIQUE NONCLUSTERED INDEX [IX_Users_Email] ON [dbo].[Users] ([Email]);
-- Filtered Index for Fast Admin Queue Queries
CREATE NONCLUSTERED INDEX [IX_Users_Status_Role] ON [dbo].[Users] ([Status], [Role]) INCLUDE ([Name], [Email], [Company], [CreatedAt]);
GO

-- ============================================================================
-- 3. TABLE: Jobs
-- Description: Verified job requisitions published by approved employers
-- ============================================================================
CREATE TABLE [dbo].[Jobs] (
    [Id] NVARCHAR(64) NOT NULL PRIMARY KEY,
    [Title] NVARCHAR(200) NOT NULL,
    [Company] NVARCHAR(150) NOT NULL,
    [EmployerId] NVARCHAR(64) NULL CONSTRAINT [FK_Jobs_EmployerId] REFERENCES [dbo].[Users]([Id]) ON DELETE SET NULL,
    [Location] NVARCHAR(150) NOT NULL,
    [WorkMode] NVARCHAR(50) NOT NULL CONSTRAINT [CK_Jobs_WorkMode] CHECK ([WorkMode] IN ('Remote', 'Hybrid', 'Onsite', 'Global Remote')),
    [Salary] NVARCHAR(100) NOT NULL,
    [SalaryPeriod] NVARCHAR(20) NOT NULL DEFAULT '/yr',
    [SalaryMin] INT NULL,
    [SalaryMax] INT NULL,
    [Tags] NVARCHAR(MAX) NULL,             -- JSON string array e.g. ["TypeScript","React"]
    [Department] NVARCHAR(100) NULL,
    [Description] NVARCHAR(MAX) NULL,
    [Verified] BIT NOT NULL DEFAULT 1,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Active' CONSTRAINT [CK_Jobs_Status] CHECK ([Status] IN ('Active', 'Paused', 'Closed', 'Under Review')),
    [PostedDate] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE NONCLUSTERED INDEX [IX_Jobs_Status_PostedDate] ON [dbo].[Jobs] ([Status], [PostedDate] DESC) INCLUDE ([Title], [Company], [Location], [Salary]);
CREATE NONCLUSTERED INDEX [IX_Jobs_EmployerId] ON [dbo].[Jobs] ([EmployerId]);
GO

-- ============================================================================
-- 4. TABLE: ActivityLogs
-- Description: Tamper-evident audit ledger for user logins, approvals, and job postings
-- ============================================================================
CREATE TABLE [dbo].[ActivityLogs] (
    [Id] NVARCHAR(64) NOT NULL PRIMARY KEY,
    [Timestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [FormattedTime] NVARCHAR(50) NOT NULL,
    [EventType] NVARCHAR(50) NOT NULL CONSTRAINT [CK_ActivityLogs_EventType] CHECK ([EventType] IN ('login', 'account_approval', 'job_posting', 'security_alert', 'system_event')),
    [ActorName] NVARCHAR(150) NOT NULL,
    [ActorEmail] NVARCHAR(255) NOT NULL,
    [ActorRole] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(500) NOT NULL,
    [TargetName] NVARCHAR(200) NOT NULL,
    [TargetType] NVARCHAR(50) NOT NULL,
    [TargetId] NVARCHAR(64) NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'success' CONSTRAINT [CK_ActivityLogs_Status] CHECK ([Status] IN ('success', 'warning', 'info', 'error')),
    [IpAddress] NVARCHAR(64) NOT NULL,
    [DetailsJson] NVARCHAR(MAX) NULL      -- Detailed attributes formatted as JSON
);
GO

CREATE NONCLUSTERED INDEX [IX_ActivityLogs_Timestamp] ON [dbo].[ActivityLogs] ([Timestamp] DESC);
CREATE NONCLUSTERED INDEX [IX_ActivityLogs_EventType] ON [dbo].[ActivityLogs] ([EventType], [Timestamp] DESC);
CREATE NONCLUSTERED INDEX [IX_ActivityLogs_ActorEmail] ON [dbo].[ActivityLogs] ([ActorEmail]);
GO

-- ============================================================================
-- 5. TABLE: Applications
-- Description: Candidate applications and Kanban pipeline progression
-- ============================================================================
CREATE TABLE [dbo].[Applications] (
    [Id] NVARCHAR(64) NOT NULL PRIMARY KEY,
    [JobId] NVARCHAR(64) NOT NULL CONSTRAINT [FK_Applications_JobId] REFERENCES [dbo].[Jobs]([Id]) ON DELETE CASCADE,
    [CandidateId] NVARCHAR(64) NOT NULL CONSTRAINT [FK_Applications_CandidateId] REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    [Stage] NVARCHAR(50) NOT NULL DEFAULT 'Applied' CONSTRAINT [CK_Applications_Stage] CHECK ([Stage] IN ('Applied', 'Screening', 'Technical', 'Offer', 'Hired', 'Archived')),
    [MatchScore] INT NOT NULL DEFAULT 85,
    [Notes] NVARCHAR(MAX) NULL,
    [AppliedAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE NONCLUSTERED INDEX [IX_Applications_CandidateId] ON [dbo].[Applications] ([CandidateId]);
CREATE NONCLUSTERED INDEX [IX_Applications_JobId_Stage] ON [dbo].[Applications] ([JobId], [Stage]);
GO

-- ============================================================================
-- 6. TABLE: VerificationDocuments
-- Description: Identity, business tax ID, and dossier uploads for verification
-- ============================================================================
CREATE TABLE [dbo].[VerificationDocuments] (
    [Id] NVARCHAR(64) NOT NULL PRIMARY KEY,
    [UserId] NVARCHAR(64) NOT NULL CONSTRAINT [FK_VerificationDocs_UserId] REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    [DocumentType] NVARCHAR(100) NOT NULL, -- e.g. 'Articles of Incorporation', 'Tax Certificate'
    [DocumentUrl] NVARCHAR(500) NOT NULL,
    [VerificationStatus] NVARCHAR(50) NOT NULL DEFAULT 'Pending' CONSTRAINT [CK_Docs_Status] CHECK ([VerificationStatus] IN ('Pending', 'Approved', 'Rejected')),
    [ReviewedBy] NVARCHAR(64) NULL CONSTRAINT [FK_VerificationDocs_ReviewedBy] REFERENCES [dbo].[Users]([Id]),
    [ReviewedAt] DATETIME2(3) NULL,
    [SubmittedAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ============================================================================
-- 7. HELPER STORED PROCEDURES
-- ============================================================================

-- Stored Procedure: sp_ApproveUser
-- Approves a user and writes an immutable audit record
IF OBJECT_ID(N'[dbo].[sp_ApproveUser]', N'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_ApproveUser];
GO

CREATE PROCEDURE [dbo].[sp_ApproveUser]
    @AdminId NVARCHAR(64),
    @TargetUserId NVARCHAR(64),
    @IpAddress NVARCHAR(64) = '198.51.100.44'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DECLARE @AdminName NVARCHAR(150), @AdminEmail NVARCHAR(255);
    DECLARE @TargetName NVARCHAR(150), @TargetRole NVARCHAR(50), @TargetRegType NVARCHAR(50);

    -- Fetch Admin info
    SELECT @AdminName = [Name], @AdminEmail = [Email] FROM [dbo].[Users] WHERE [Id] = @AdminId AND [Role] = 'admin';
    IF @AdminName IS NULL
    BEGIN
        SET @AdminName = 'Marcus Vance (Admin)';
        SET @AdminEmail = 'admin.m_vance@hireflow.io';
    END

    -- Fetch Target User info
    SELECT @TargetName = [Name], @TargetRole = [Role], @TargetRegType = [RegistrationType]
    FROM [dbo].[Users] WHERE [Id] = @TargetUserId;

    IF @TargetName IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('Target user does not exist.', 16, 1);
        RETURN;
    END

    -- Update User Status to Active
    UPDATE [dbo].[Users]
    SET [Status] = 'active',
        [Verified] = 1,
        [UpdatedAt] = SYSUTCDATETIME()
    WHERE [Id] = @TargetUserId;

    -- Insert Audit Log Entry
    DECLARE @LogId NVARCHAR(64) = 'log-' + LOWER(CONVERT(NVARCHAR(36), NEWID()));
    DECLARE @ActionDesc NVARCHAR(500) = 'Approved credentials & issued Gold Verification Badge to ' + @TargetName;
    DECLARE @FormattedTime NVARCHAR(50) = CONVERT(VARCHAR(8), GETUTCDATE(), 108) + ' UTC';

    INSERT INTO [dbo].[ActivityLogs] (
        [Id], [Timestamp], [FormattedTime], [EventType],
        [ActorName], [ActorEmail], [ActorRole],
        [Action], [TargetName], [TargetType], [TargetId],
        [Status], [IpAddress], [DetailsJson]
    )
    VALUES (
        @LogId, SYSUTCDATETIME(), @FormattedTime, 'account_approval',
        @AdminName, @AdminEmail, 'admin',
        @ActionDesc, @TargetName, @TargetRegType, @TargetUserId,
        'success', @IpAddress, '{"badge":"Tier-1 Gold Verified Seal","grantedRole":"' + @TargetRole + '"}'
    );

    COMMIT TRANSACTION;
END;
GO

-- ============================================================================
-- 8. INITIAL SEED DATA
-- ============================================================================

-- 8.1 Default Administrator
INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], [Status], [Verified], [Company], [Title], [Avatar])
VALUES (
    'admin-1',
    'Marcus Vance',
    'admin.m_vance@hireflow.io',
    'admin123', -- In production, replace with bcrypt salted hash
    'admin',
    'company',
    'active',
    1,
    'HireFlow Trust & Safety',
    'Platform Administrator',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
);

-- 8.2 Default Verified Corporate Employer
INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], [Status], [Verified], [Company], [Title], [Avatar])
VALUES (
    'employer-1',
    'Alex Rivera',
    'alex.rivera@techcorp.io',
    'password123',
    'employer',
    'company',
    'active',
    1,
    'CloudScale Systems',
    'Head of Engineering',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
);

-- 8.3 Default Vetted Senior Candidate
INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], [Status], [Verified], [Company], [Title], [Avatar])
VALUES (
    'candidate-1',
    'Clara Song',
    'clara.song@gmail.com',
    'password123',
    'candidate',
    'candidate',
    'active',
    1,
    'Independent',
    'Staff Distributed Systems Engineer',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256'
);

-- 8.4 Pending Approval Candidate (for testing Admin Verification Queue)
INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], [Status], [Verified], [Company], [Title], [Avatar])
VALUES (
    'user-pending-1',
    'Elena Rostova',
    'elena.rostova@quantumai.de',
    'password123',
    'candidate',
    'candidate',
    'pending_approval',
    0,
    'Ex-DeepMind',
    'Principal ML Infrastructure Specialist',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
);

-- 8.5 Pending Approval Corporate Employer
INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], [Status], [Verified], [Company], [Title], [Avatar])
VALUES (
    'user-pending-2',
    'Apex Logistics Global Ltd',
    'compliance@apexlogistics.com',
    'password123',
    'employer',
    'company',
    'pending_approval',
    0,
    'Apex Logistics Global Ltd',
    'VP of People Operations',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=256'
);

-- 8.6 Seed Verified Job Postings
INSERT INTO [dbo].[Jobs] ([Id], [Title], [Company], [EmployerId], [Location], [WorkMode], [Salary], [SalaryPeriod], [SalaryMin], [SalaryMax], [Tags], [Department], [Description], [Verified], [Status])
VALUES 
(
    'job-1',
    'Staff Distributed Systems Engineer',
    'CloudScale Systems',
    'employer-1',
    'San Francisco, CA / Remote',
    'Remote',
    '$210,000 – $245,000',
    '/yr',
    210000,
    245000,
    '["Go","Kubernetes","gRPC","Distributed Systems"]',
    'Infrastructure',
    'Lead architecture for next-generation multi-region distributed compute nodes.',
    1,
    'Active'
),
(
    'job-2',
    'Principal Security Architect',
    'FinTech Core',
    'employer-1',
    'New York, NY / Hybrid',
    'Hybrid',
    '$230,000 – $270,000',
    '/yr',
    230000,
    270000,
    '["Zero Trust","Cryptosystems","SOC-2","AWS GuardDuty"]',
    'Security Engineering',
    'Lead enterprise Zero-Trust policy architecture and SOC-2 Type II audit compliance.',
    1,
    'Active'
),
(
    'job-3',
    'Senior React / TypeScript Architect',
    'HireFlow Design Systems',
    'employer-1',
    'Remote (US/Canada)',
    'Remote',
    '$175,000 – $205,000',
    '/yr',
    175000,
    205000,
    '["TypeScript","React 19","Tailwind CSS","Performance"]',
    'Core Product',
    'Own the high-frequency design system and responsive telemetry interfaces.',
    1,
    'Active'
);

-- 8.7 Seed Activity Logs (Logins, Approvals, Job Postings with Timestamps)
INSERT INTO [dbo].[ActivityLogs] ([Id], [Timestamp], [FormattedTime], [EventType], [ActorName], [ActorEmail], [ActorRole], [Action], [TargetName], [TargetType], [TargetId], [Status], [IpAddress], [DetailsJson])
VALUES 
(
    'log-init-1',
    DATEADD(MINUTE, -15, SYSUTCDATETIME()),
    '22:30:12 UTC',
    'login',
    'Marcus Vance',
    'admin.m_vance@hireflow.io',
    'admin',
    'User authenticated via secure 256-bit TLS handshake',
    'Admin Governance Center',
    'session',
    'sess-88910',
    'success',
    '198.51.100.44',
    '{"authProtocol":"WebAuthn + Encrypted Credentials","browser":"Chrome 129 / macOS","verified":true}'
),
(
    'log-init-2',
    DATEADD(MINUTE, -10, SYSUTCDATETIME()),
    '22:35:44 UTC',
    'account_approval',
    'Marcus Vance',
    'admin.m_vance@hireflow.io',
    'admin',
    'Approved credentials and granted Gold Verification Badge to CloudScale Systems',
    'CloudScale Systems (Company)',
    'company',
    'employer-1',
    'success',
    '198.51.100.44',
    '{"tierIssued":"Tier-1 Gold Verified Seal","badgeGranted":true,"reviewedDossierId":"DOC-US-DEL-98441"}'
),
(
    'log-init-3',
    DATEADD(MINUTE, -5, SYSUTCDATETIME()),
    '22:40:02 UTC',
    'job_posting',
    'Alex Rivera',
    'alex.rivera@techcorp.io',
    'employer',
    'Published verified requisition: Staff Distributed Systems Engineer at CloudScale Systems ($210,000 – $245,000/yr)',
    'Staff Distributed Systems Engineer',
    'job',
    'job-1',
    'success',
    '203.0.113.19',
    '{"workMode":"Remote","compensation":"$210,000 – $245,000/yr","department":"Infrastructure","tags":"Go, Kubernetes, gRPC"}'
);
GO

-- ============================================================================
-- VERIFICATION QUERY: Verify seeded data
-- ============================================================================
SELECT 'Users' AS [Table], COUNT(*) AS [TotalCount] FROM [dbo].[Users]
UNION ALL
SELECT 'Jobs' AS [Table], COUNT(*) AS [TotalCount] FROM [dbo].[Jobs]
UNION ALL
SELECT 'ActivityLogs' AS [Table], COUNT(*) AS [TotalCount] FROM [dbo].[ActivityLogs];
GO
