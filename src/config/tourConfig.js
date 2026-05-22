export const dashboardTourSteps = [
    {
        element: '#tour-welcome',
        popover: {
            title: 'Welcome to PreExam!',
            description: 'This is your dashboard. Let us show you around quickly.',
            side: "bottom",
            align: 'start'
        }
    },
    {
        element: '#tour-create-room',
        popover: {
            title: 'Create Exam Room',
            description: 'Click here to create a new room. You can make it Public for everyone or Private for friends.',
            side: "bottom"
        }
    },
    {
        element: '#tour-wallet',
        popover: {
            title: 'My Wallet',
            description: 'Check your balance here. You can top-up to buy ads, subscribe to VIP, or support creators.',
            side: "left"
        }
    },
    {
        element: '#tour-stats',
        popover: {
            title: 'Your Progress',
            description: 'Track your learning journey and exam scores here.',
            side: "top"
        }
    },
    {
        element: '#tour-help',
        popover: {
            title: 'Need Help?',
            description: 'Click this "?" button anytime to replay this tour or enter "Contextual Help" mode to point-and-ask.',
            side: "left"
        }
    }
];

export const examRoomTourSteps = [
    {
        element: '#tour-timer',
        popover: {
            title: 'Timer',
            description: 'Keep an eye on the time remaining!',
            side: "bottom"
        }
    },
    {
        element: '#tour-tools',
        popover: {
            title: 'Tools',
            description: 'Access Calculator, Notepad, and other helpers here.',
            side: "left"
        }
    },
    {
        element: '#tour-submit',
        popover: {
            title: 'Submit Exam',
            description: 'Once you are done, click here. Warning: You cannot change answers after submitting!',
            side: "top"
        }
    }
];
