const { db: firestore } = require('../config/firebase');

const usersRef = firestore.collection('users');
const logsRef = firestore.collection('system_logs');

const GUEST_ACTIONS = new Set([
    'SYS_GUEST_CREATE',
    'SYS_GUEST_LOGIN',
    'BTN_LOGIN_GUEST',
]);

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const VERBOSE = args.includes('--verbose');
const LIMIT_ARG = args.find((arg) => arg.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : 0;

function parseJsonSafe(value) {
    if (!value) return null;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function parseDateSafe(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function lower(value) {
    return String(value || '').trim().toLowerCase();
}

function isGuestUser(user) {
    const email = lower(user.email);
    const displayName = String(user.display_name || '');
    return (email.startsWith('guest_') && (email.endsWith('@preexam.com') || email.endsWith('@guest.local')))
        || displayName.startsWith('Guest-');
}

function normalizeIp(value) {
    return String(value || '').split(',')[0].trim();
}

function getUserTimestamp(user, fieldNames) {
    for (const fieldName of fieldNames) {
        const parsed = parseDateSafe(user[fieldName]);
        if (parsed) return parsed;
    }
    return null;
}

function buildIndexes(users) {
    const usersByDocId = new Map();
    const usersByLegacyId = new Map();
    const usersByEmail = new Map();
    const guestUsers = [];

    for (const user of users) {
        usersByDocId.set(String(user.docId), user);

        if (user.fieldId !== undefined && user.fieldId !== null && String(user.fieldId).trim()) {
            const key = String(user.fieldId).trim();
            if (!usersByLegacyId.has(key)) {
                usersByLegacyId.set(key, []);
            }
            usersByLegacyId.get(key).push(user);
        }

        const emailKey = lower(user.email);
        if (emailKey) {
            if (!usersByEmail.has(emailKey)) {
                usersByEmail.set(emailKey, []);
            }
            usersByEmail.get(emailKey).push(user);
        }

        if (isGuestUser(user)) {
            guestUsers.push(user);
        }
    }

    return { usersByDocId, usersByLegacyId, usersByEmail, guestUsers };
}

function resolveByHeuristics(log, guestUsers, usersByEmail) {
    const details = parseJsonSafe(log.details);
    const logCreatedAt = parseDateSafe(log.created_at);
    const logIp = normalizeIp(log.ip_address);
    const logUa = String(log.user_agent || '').trim();

    if (details && details.deviceId) {
        const candidateEmails = [
            `guest_${details.deviceId}@preexam.com`,
            `guest_${details.deviceId}@guest.local`,
        ];

        for (const email of candidateEmails) {
            const matches = usersByEmail.get(lower(email)) || [];
            if (matches.length === 1) {
                return { user: matches[0], reason: 'device_id_email_match' };
            }
        }
    }

    if (!GUEST_ACTIONS.has(String(log.action || ''))) {
        return null;
    }

    let candidates = guestUsers;

    if (logIp) {
        const byIp = candidates.filter((user) => normalizeIp(user.ip_address) === logIp);
        if (byIp.length === 1) {
            return { user: byIp[0], reason: 'guest_ip_match' };
        }
        if (byIp.length > 0) {
            candidates = byIp;
        }
    }

    if (logUa) {
        const byUa = candidates.filter((user) => String(user.user_agent || '').trim() === logUa);
        if (byUa.length === 1) {
            return { user: byUa[0], reason: 'guest_user_agent_match' };
        }
        if (byUa.length > 0) {
            candidates = byUa;
        }
    }

    if (!logCreatedAt) {
        return candidates.length === 1 ? { user: candidates[0], reason: 'single_guest_candidate' } : null;
    }

    const scored = candidates
        .map((user) => {
            const compareDate = String(log.action) === 'SYS_GUEST_CREATE'
                ? getUserTimestamp(user, ['created_at', 'updated_at', 'last_active_at'])
                : getUserTimestamp(user, ['last_active_at', 'updated_at', 'created_at']);

            if (!compareDate) return null;

            return {
                user,
                diffMs: Math.abs(compareDate.getTime() - logCreatedAt.getTime()),
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.diffMs - b.diffMs);

    if (scored.length === 0) {
        return candidates.length === 1 ? { user: candidates[0], reason: 'single_guest_candidate' } : null;
    }

    const best = scored[0];
    const second = scored[1];
    const maxDiffMs = String(log.action) === 'SYS_GUEST_CREATE'
        ? 1000 * 60 * 15
        : 1000 * 60 * 60 * 24 * 7;

    if (best.diffMs > maxDiffMs) {
        return null;
    }

    if (second && second.diffMs === best.diffMs) {
        return null;
    }

    return { user: best.user, reason: `guest_time_match_${best.diffMs}ms` };
}

function resolveByTimeline(logs, index) {
    const currentLog = logs[index];
    if (currentLog.user_id !== undefined && currentLog.user_id !== null) {
        return null;
    }

    if (String(currentLog.action || '') !== 'BTN_LOGOUT') {
        return null;
    }

    const currentTime = parseDateSafe(currentLog.created_at);
    if (!currentTime) {
        return null;
    }

    let previousKnown = null;
    for (let i = index - 1; i >= 0; i -= 1) {
        const candidate = logs[i];
        if (candidate.user_id !== undefined && candidate.user_id !== null) {
            previousKnown = candidate;
            break;
        }
    }

    if (!previousKnown) {
        return null;
    }

    const previousTime = parseDateSafe(previousKnown.created_at);
    if (!previousTime) {
        return null;
    }

    const diffMs = currentTime.getTime() - previousTime.getTime();
    const maxGapMs = 1000 * 60 * 60 * 2;

    if (diffMs < 0 || diffMs > maxGapMs) {
        return null;
    }

    return {
        userId: String(previousKnown.user_id),
        reason: `timeline_previous_user_within_${Math.round(diffMs / 1000)}s`,
    };
}

async function loadUsers() {
    const snapshot = await usersRef.get();
    return snapshot.docs.map((doc) => {
        const data = doc.data() || {};
        return {
            docId: doc.id,
            fieldId: data.id ?? null,
            email: data.email || null,
            display_name: data.display_name || null,
            public_id: data.public_id || null,
            created_at: data.created_at || null,
            updated_at: data.updated_at || null,
            last_active_at: data.last_active_at || null,
            ip_address: data.ip_address || null,
            user_agent: data.user_agent || null,
            raw: data,
        };
    });
}

async function loadLogs() {
    const snapshot = await logsRef.get();
    let logs = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
    }));

    logs.sort((a, b) => {
        const aTime = parseDateSafe(a.created_at)?.getTime() || 0;
        const bTime = parseDateSafe(b.created_at)?.getTime() || 0;
        return aTime - bTime;
    });

    if (LIMIT > 0) {
        logs = logs.slice(0, LIMIT);
    }

    return logs;
}

async function main() {
    console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY_RUN'}`);
    if (LIMIT > 0) {
        console.log(`Limit: ${LIMIT}`);
    }

    const users = await loadUsers();
    const logs = await loadLogs();
    const { usersByDocId, usersByLegacyId, usersByEmail, guestUsers } = buildIndexes(users);

    const stats = {
        usersTotal: users.length,
        usersWithLegacyIdField: users.filter((user) => user.fieldId !== null && String(user.fieldId) !== String(user.docId)).length,
        logsTotal: logs.length,
        alreadyLinked: 0,
        relinkable: 0,
        applied: 0,
        ambiguous: 0,
        unmatched: 0,
        byLegacyId: 0,
        byDeviceId: 0,
        byHeuristic: 0,
    };

    const updates = [];
    const ambiguous = [];
    const unmatched = [];

    for (let index = 0; index < logs.length; index += 1) {
        const log = logs[index];
        const currentUserId = log.user_id === undefined || log.user_id === null ? null : String(log.user_id);
        if (!currentUserId) {
            const timelineMatch = resolveByTimeline(logs, index);
            if (timelineMatch && usersByDocId.has(timelineMatch.userId)) {
                stats.relinkable += 1;
                stats.byHeuristic += 1;
                updates.push({
                    logDocId: log.docId,
                    fromUserId: null,
                    toUserId: timelineMatch.userId,
                    reason: timelineMatch.reason,
                    action: log.action,
                });
                continue;
            }

            stats.unmatched += 1;
            unmatched.push({ logDocId: log.docId, reason: 'missing_user_id', action: log.action });
            continue;
        }

        if (usersByDocId.has(currentUserId)) {
            stats.alreadyLinked += 1;
            continue;
        }

        const legacyCandidates = usersByLegacyId.get(currentUserId) || [];
        if (legacyCandidates.length === 1) {
            stats.relinkable += 1;
            stats.byLegacyId += 1;
            updates.push({
                logDocId: log.docId,
                fromUserId: currentUserId,
                toUserId: legacyCandidates[0].docId,
                reason: 'legacy_field_id_match',
                action: log.action,
            });
            continue;
        }

        if (legacyCandidates.length > 1) {
            stats.ambiguous += 1;
            ambiguous.push({
                logDocId: log.docId,
                reason: 'multiple_legacy_id_matches',
                userId: currentUserId,
                candidates: legacyCandidates.map((user) => user.docId),
            });
            continue;
        }

        const heuristicMatch = resolveByHeuristics(log, guestUsers, usersByEmail);
        if (heuristicMatch) {
            stats.relinkable += 1;
            if (heuristicMatch.reason === 'device_id_email_match') {
                stats.byDeviceId += 1;
            } else {
                stats.byHeuristic += 1;
            }
            updates.push({
                logDocId: log.docId,
                fromUserId: currentUserId,
                toUserId: heuristicMatch.user.docId,
                reason: heuristicMatch.reason,
                action: log.action,
            });
            continue;
        }

        stats.unmatched += 1;
        unmatched.push({
            logDocId: log.docId,
            reason: 'no_match',
            userId: currentUserId,
            action: log.action,
            created_at: log.created_at || null,
        });
    }

    if (APPLY && updates.length > 0) {
        let batch = firestore.batch();
        let batchCount = 0;

        for (const update of updates) {
            const logRef = logsRef.doc(update.logDocId);
            batch.update(logRef, {
                user_id: update.toUserId,
                relinked_from_user_id: update.fromUserId,
                relinked_reason: update.reason,
                relinked_at: new Date().toISOString(),
            });
            batchCount += 1;

            if (batchCount === 400) {
                await batch.commit();
                stats.applied += batchCount;
                batch = firestore.batch();
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            stats.applied += batchCount;
        }
    }

    console.log('\nSummary');
    console.log(JSON.stringify(stats, null, 2));

    console.log('\nRelink candidates');
    console.log(JSON.stringify(updates.slice(0, 50), null, 2));

    if (ambiguous.length > 0) {
        console.log('\nAmbiguous matches');
        console.log(JSON.stringify(ambiguous.slice(0, 50), null, 2));
    }

    if (unmatched.length > 0) {
        console.log('\nUnmatched logs');
        console.log(JSON.stringify(unmatched.slice(0, 50), null, 2));
    }

    if (VERBOSE) {
        console.log('\nVerbose users with legacy id field');
        const legacyUsers = users
            .filter((user) => user.fieldId !== null && String(user.fieldId) !== String(user.docId))
            .slice(0, 50)
            .map((user) => ({
                docId: user.docId,
                fieldId: user.fieldId,
                email: user.email,
                public_id: user.public_id,
            }));
        console.log(JSON.stringify(legacyUsers, null, 2));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Relink script failed:', error);
        process.exit(1);
    });
