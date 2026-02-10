export const versionHistory = [
    {
        version: '0.2.8',
        date: '2026-02-10',
        changes: [
            { type: 'new', description: 'Implemented Google AdSense verification (meta, script, ads.txt)' }
        ]
    },
    {
        version: '0.2.7',
        date: '2026-02-10',
        changes: [
            { type: 'improvement', description: 'UX/UI Improvements: Quick Start button and Mobile Cookie Banner' }
        ]
    },
    {
        version: '0.2.6',
        date: '2026-02-09',
        changes: [
            { type: 'new', description: 'Implemented Microsoft Clarity tracking' }
        ]
    },
    {
        version: '0.2.5',
        date: '2026-02-09',
        changes: [
            { type: 'fix', description: 'Fixed duplicate exam history on user profiles' },
            { type: 'new', description: 'Added backend support for fetching specific user exam history' }
        ]
    },
    {
        version: '0.2.4',
        date: '2026-02-09',
        changes: [
            { type: 'new', description: 'Enhanced Member Management (Last Active, Pagination, History)' },
            { type: 'fix', description: 'Fixed Public Profile loading issue' }
        ]
    },
    {
        version: '0.2.3',
        date: '2026-02-04',
        changes: [
            { type: 'new', description: 'Added version logging to System Backups' },
            { type: 'improvement', description: 'Moved Save Changes button in System Settings' }
        ]
    },
    {
        version: "0.2.2",
        date: "2026-02-04",
        changes: [
            { type: "new", description: "Added Version History in System Settings" },
            { type: "fix", description: "Fixed rebase and git sync issues" }
        ]
    },
    {
        version: "0.2.1",
        date: "2026-01-30",
        changes: [
            { type: "fix", description: "Fixed HTML rendering issue in Exam interface" }
        ]
    },
    {
        version: "0.2.0",
        date: "2026-01-20",
        changes: [
            { type: "new", description: "Global Page Load Timer" },
            { type: "fix", description: "News Edit and Icon updates" }
        ]
    },
    {
        version: "0.1.9",
        date: "2026-01-16",
        changes: [
            { type: "fix", description: "Admin Dashboard Revenue calculation" },
            { type: "new", description: "Thai translations for Exam Config" }
        ]
    },
    {
        version: "0.0.7",
        date: "2026-01-14",
        changes: [
            { type: "fix", description: "Google Login Redirection" },
            { type: "new", description: "Geolocation and Rich Text Editor" }
        ]
    }
];

export const getCurrentVersion = () => versionHistory[0].version;
export const currentVersion = getCurrentVersion(); // For backward compatibility if needed, but we aim to replace usage.
