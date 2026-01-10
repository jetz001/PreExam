// Suppress noisy warnings and errors from legacy dependencies and browser features
// This must be imported before any other libraries to ensure it captures the console methods.

const suppressedWarnings = [
    'componentWillReceiveProps has been renamed',
    'FedCM',
    'google.accounts.id.prompt',
    '[GSI_LOGGER]',
    'The given origin is not allowed',
    'Duplicate script ID' // Suppress the duplicate script error if we can't fix the source
];

const matchSuppression = (args) => {
    const msg = args[0];
    if (typeof msg !== 'string') return false;
    return suppressedWarnings.some(warning => msg.includes(warning));
};

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleLog = console.log;
const originalConsoleGroup = console.group;
const originalConsoleGroupCollapsed = console.groupCollapsed;

const consoleMethods = [
    { method: 'error', original: originalConsoleError },
    { method: 'warn', original: originalConsoleWarn },
    { method: 'info', original: originalConsoleInfo },
    { method: 'log', original: originalConsoleLog },
    { method: 'group', original: originalConsoleGroup },
    { method: 'groupCollapsed', original: originalConsoleGroupCollapsed }
];

consoleMethods.forEach(({ method, original }) => {
    console[method] = (...args) => {
        if (matchSuppression(args)) return;
        original.apply(console, args);
    };
});

if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason?.message || event.reason;
        if (typeof reason === 'string' && matchSuppression([reason])) {
            event.preventDefault(); // Stop it from being logged as an uncaught error
            return;
        }
    });
}
