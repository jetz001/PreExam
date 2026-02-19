export const versionHistory = [
    {
        version: 'v0.2.22',
        date: '2026-02-19',
        changes: [
            { type: 'feature', description: 'Added Activity Logging to all Navbar buttons' }
        ]
    },
    {
        version: '0.2.21',
        date: '2026-02-19',
        changes: [
            { type: 'feature', description: 'Expanded User Activity Logging (News, Community, Profile, Landing Page)' }
        ]
    },
    {
        version: '0.2.20',
        date: '2026-02-19',
        changes: [
            { type: 'feature', description: 'Admin: Added User Activity Log (View last 10 actions)' },
            { type: 'backend', description: 'Implemented system-wide logging for key user actions' }
        ]
    },
    {
        version: '0.2.19',
        date: '2026-02-18',
        changes: [
            { type: 'feature', description: 'Admin: Enable searching users by Public ID (UUID)' }
        ]
    },
    {
        version: '0.2.18',
        date: '2026-02-17',
        changes: [
            { type: 'fix', description: 'Fixed "Guest-guest-17" name collision issue for Facebook Browser users' }
        ]
    },
    {
        version: '0.2.17',
        date: '2026-02-17',
        changes: [
            { type: 'ui', description: 'Mobile UX: Moved Support button to avoid overlapping footer' },
            { type: 'ui', description: 'UX: Submit button now appears faded until exam completion is near' }
        ]
    },
    {
        version: '0.2.16',
        date: '2026-02-17',
        changes: [
            { type: 'ui', description: 'Mobile UX: Added sticky footer navigation and movable submit button' },
            { type: 'ui', description: 'Mobile UX: Changed font resizer to a toggleable menu to prevent overlap' }
        ]
    },
    {
        version: '0.2.15',
        date: '2026-02-17',
        changes: [
            { type: 'ui', description: 'Updated Quick Start button (removed icon)' },
            { type: 'ui', description: 'Added "All" (ทั้งหมด) option to Category dropdown' }
        ]
    },
    {
        version: '0.2.14',
        date: '2026-02-17',
        changes: [
            { type: 'fix', description: 'Room Creation: Fixed server error due to invalid database operator usage' },
            { type: 'fix', description: 'Quick Start: Enhanced stability by cleaning up query parameters' }
        ]
    },
    {
        version: '0.2.13',
        date: '2026-02-17',
        changes: [
            { type: 'fix', description: 'Room Creation: Fixed bug where rooms couldn\'t find questions with tags' },
            { type: 'fix', description: 'Quick Start: Changed to search ALL categories to prevent "No Questions" error' }
        ]
    },
    {
        version: '0.2.12',
        date: '2026-02-17',
        changes: [
            { type: 'fix', description: 'Quick Start: Changed default category to OCSC (G-Gov) to ensure questions' }
        ]
    },
    {
        version: '0.2.11',
        date: '2026-02-17',
        changes: [
            { type: 'feature', description: 'Advanced Filter: Quick Start button & hidden advanced settings' },
            { type: 'fix', description: 'Exam: Added validation for question list integrity' }
        ]
    },
    {
        version: '0.2.10',
        date: '2026-02-11',
        changes: [
            { type: 'improve', description: 'UX/UI Optimization (Clarity Feedback): Helper text, CLS fixes, Quick Test' }
        ]
    },
    {
        version: '0.2.9',
        date: '2026-02-10',
        changes: [
            { type: 'fix', description: 'Functional AdSense Slot ID configuration in Admin Panel' }
        ]
    },
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
