import { User, UserReport, ReportReason, ReportStatus, BlockedUserEntry } from '../types';
import { getAllUserProfiles, saveUserProfile } from './userProfiles';

const REPORTS_STORAGE_KEY = 'fasalflow_user_reports';
const BLOCKED_USERS_PREFIX = 'fasalflow_blocked_users_';
const SAFETY_TIPS_SEEN_PREFIX = 'fasalflow_safety_tips_seen_';

// Moderation word filter list (English, Hindi transliteration)
const INAPPROPRIATE_PATTERNS: Array<{ pattern: RegExp; reason: string; label: string }> = [
  // Threats and abuse
  { pattern: /\b(abuse|idiot|stupid|bastard|cheat|scam|scammer|thief|chor|fraud|harami|kutta|kamina|chutiya|fraudster)\b/i, reason: 'Abusive language or defamatory accusation', label: 'Abuse/Harassment' },
  { pattern: /\b(threat|kill|beat you|maar dunga|dekh lunga|harm|destroy)\b/i, reason: 'Threat of harm or violent intimidation', label: 'Violent Threat' },
  // Off-platform and financial evasion
  { pattern: /\b(outside payment|direct cash without mandi|bypass escrow|send me otp|give pin|share otp|upi pin)\b/i, reason: 'Attempt to bypass safe Mandi escrow or extract confidential credentials', label: 'Financial Hazard' },
  // Fake guarantees
  { pattern: /\b(100% free money|double your cash|guaranteed double|lottery)\b/i, reason: 'Deceptive investment or spam claim', label: 'Spam/Fraud' },
];

/**
 * Checks message text for inappropriate or policy-violating language
 */
export function checkInappropriateContent(text: string): {
  isFlagged: boolean;
  reason?: string;
  matchedTerms: string[];
} {
  const clean = text.trim();
  if (!clean) return { isFlagged: false, matchedTerms: [] };

  const matchedTerms: string[] = [];
  let primaryReason = '';

  for (const item of INAPPROPRIATE_PATTERNS) {
    const match = clean.match(item.pattern);
    if (match) {
      matchedTerms.push(match[0]);
      if (!primaryReason) {
        primaryReason = item.reason;
      }
    }
  }

  return {
    isFlagged: matchedTerms.length > 0,
    reason: primaryReason,
    matchedTerms,
  };
}

/**
 * Initial mock reports for demo/moderation review
 */
const SEED_REPORTS: UserReport[] = [
  {
    id: 'rep-seed-1',
    reportedUserId: 'user-buyer-fake',
    reportedUserName: 'Apex Commodity Traders (Unverified)',
    reportedUserPhone: '+91 91234 00012',
    reporterId: 'user-farmer-1',
    reporterName: 'Ramesh Patil',
    reporterPhone: '+91 98220 12345',
    reason: 'Fraud',
    description: 'Offered ₹6,500/q for soybean which is ₹1,600 above market, but insisted on cash delivery without weighbridge slip.',
    timestamp: 'Yesterday at 04:15 PM',
    status: 'pending',
  },
  {
    id: 'rep-seed-2',
    reportedUserId: 'trans-rogue-1',
    reportedUserName: 'FastTrack Transport Logistics',
    reportedUserPhone: '+91 99881 22334',
    reporterId: 'user-buyer-1',
    reporterName: 'Shree Ganesh Agro Processing',
    reporterPhone: '+91 94220 88990',
    reason: 'Inappropriate Language',
    description: 'Driver demanded extra ₹3,000 cash surcharge at unloading and used abusive language with the warehouse manager.',
    timestamp: '2 days ago',
    status: 'reviewed',
    adminActionTaken: 'First warning issued. Logged on carrier profile.',
  },
  {
    id: 'rep-seed-3',
    reportedUserId: 'user-spammer-9',
    reportedUserName: 'Bulk Fertilizer Deals Online',
    reportedUserPhone: '+91 98230 99881',
    reporterId: 'fpo-lead-1',
    reporterName: 'Kisan Vikas FPO',
    reporterPhone: '+91 98230 45678',
    reason: 'Spam',
    description: 'Sent repetitive unsolicited promotional broadcast links for imported chemicals in the direct crop chat.',
    timestamp: '3 days ago',
    status: 'resolved',
    adminActionTaken: 'User suspended for 7 days.',
    resolvedAt: '2 days ago',
  },
];

/**
 * Retrieve all reports from localStorage
 */
export function getAllReports(): UserReport[] {
  try {
    const data = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read reports:', err);
  }

  // Pre-seed
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(SEED_REPORTS));
  } catch (err) {
    console.error('Failed to seed reports:', err);
  }
  return SEED_REPORTS;
}

/**
 * Save reports back to localStorage
 */
export function saveAllReports(reports: UserReport[]): void {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports:', err);
  }
}

/**
 * Submits a new report and applies auto-block if user reaches 5+ reports
 */
export function submitUserReport(data: {
  reportedUserId: string;
  reportedUserName: string;
  reportedUserPhone?: string;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  reason: ReportReason;
  description?: string;
  screenshotUrl?: string;
}): { report: UserReport; autoBlocked: boolean; totalReportsForUser: number } {
  const reports = getAllReports();

  const newReport: UserReport = {
    id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    reportedUserId: data.reportedUserId,
    reportedUserName: data.reportedUserName,
    reportedUserPhone: data.reportedUserPhone,
    reporterId: data.reporterId,
    reporterName: data.reporterName,
    reporterPhone: data.reporterPhone,
    reason: data.reason,
    description: data.description?.trim(),
    screenshotUrl: data.screenshotUrl,
    timestamp: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'pending',
  };

  const updatedReports = [newReport, ...reports];
  saveAllReports(updatedReports);

  // Count total reports for this user
  const userReports = updatedReports.filter(r => r.reportedUserId === data.reportedUserId);
  const totalReportsForUser = userReports.length;

  let autoBlocked = false;

  // Auto-block threshold: 5+ reports
  if (totalReportsForUser >= 5) {
    autoBlocked = true;
    // Mark in user profiles if found
    const allProfiles = getAllUserProfiles();
    for (const phone of Object.keys(allProfiles)) {
      const u = allProfiles[phone];
      if (u.id === data.reportedUserId || u.name === data.reportedUserName) {
        u.moderationStatus = 'banned';
        u.strikes = 3;
        saveUserProfile(u);
        break;
      }
    }
  }

  return {
    report: newReport,
    autoBlocked,
    totalReportsForUser,
  };
}

/**
 * Updates status of a report (for Admin / Moderator)
 */
export function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  actionTaken?: string
): UserReport | null {
  const reports = getAllReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index === -1) return null;

  reports[index].status = status;
  if (actionTaken) {
    reports[index].adminActionTaken = actionTaken;
  }
  if (status === 'resolved') {
    reports[index].resolvedAt = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  saveAllReports(reports);
  return reports[index];
}

/**
 * Admin action on a user (Warn, Suspend 7 days, Ban, Clear warnings)
 */
export function adminTakeAction(
  userId: string,
  userName: string,
  action: 'warn' | 'suspend_7d' | 'ban' | 'clear_warnings'
): {
  success: boolean;
  message: string;
  notificationMessage: string;
  newStrikes?: number;
  newStatus?: 'active' | 'warned' | 'suspended' | 'banned';
} {
  const allProfiles = getAllUserProfiles();
  let foundUser: User | null = null;
  let userPhoneKey = '';

  for (const phone of Object.keys(allProfiles)) {
    const u = allProfiles[phone];
    if (u.id === userId || u.name === userName) {
      foundUser = u;
      userPhoneKey = phone;
      break;
    }
  }

  // If user profile is not in full db, synthesize a lightweight state
  const target: User = foundUser || {
    id: userId,
    name: userName,
    phone: '+91 98220 00000',
    role: 'buyer',
    district: 'Maharashtra',
    state: 'Maharashtra',
    isKycVerified: false,
    rating: 4.0,
    memberSince: '2024',
    trustScore: 70,
    strikes: 0,
    moderationStatus: 'active',
  };

  let newStrikes = target.strikes || 0;
  let newStatus = target.moderationStatus || 'active';
  let message = '';
  let notificationMessage = '';

  if (action === 'warn') {
    newStrikes += 1;
    if (newStrikes >= 3) {
      newStatus = 'banned';
      message = `${userName} has reached 3 strikes and has been permanently banned.`;
      notificationMessage = 'SMS & Email sent: "Your account has been permanently suspended due to accumulating 3 policy strikes."';
    } else {
      newStatus = 'warned';
      message = `Official warning issued to ${userName} (Strike ${newStrikes}/3).`;
      notificationMessage = `SMS & Email sent: "Notice: You received a formal report. Review our community guidelines. Strike ${newStrikes}/3."`;
    }
  } else if (action === 'suspend_7d') {
    newStatus = 'suspended';
    const suspendDate = new Date();
    suspendDate.setDate(suspendDate.getDate() + 7);
    target.suspendedUntil = suspendDate.toISOString();
    message = `${userName} has been suspended for 7 days.`;
    notificationMessage = 'SMS & Email sent: "Your account has been temporarily suspended for 7 days pending compliance review."';
  } else if (action === 'ban') {
    newStatus = 'banned';
    newStrikes = 3;
    message = `${userName} has been permanently banned from FasalFlow.`;
    notificationMessage = 'SMS & Email sent: "Your account has been permanently banned due to severe community guideline violations."';
  } else if (action === 'clear_warnings') {
    newStrikes = 0;
    newStatus = 'active';
    delete target.suspendedUntil;
    message = `All warnings and strikes have been cleared for ${userName}.`;
    notificationMessage = 'SMS & Email sent: "Your account strikes have been cleared following administrative review."';
  }

  target.strikes = newStrikes;
  target.moderationStatus = newStatus;

  if (userPhoneKey) {
    saveUserProfile(target);
  }

  return {
    success: true,
    message,
    notificationMessage,
    newStrikes,
    newStatus,
  };
}

// =========================================================================
// BLOCKED USERS MANAGEMENT
// =========================================================================

/**
 * Gets list of blocked users for a specific user ID
 */
export function getBlockedUsers(currentUserId: string): BlockedUserEntry[] {
  try {
    const key = `${BLOCKED_USERS_PREFIX}${currentUserId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read blocked users:', err);
  }
  return [];
}

/**
 * Saves blocked users list for a user
 */
export function saveBlockedUsers(currentUserId: string, list: BlockedUserEntry[]): void {
  try {
    const key = `${BLOCKED_USERS_PREFIX}${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save blocked users:', err);
  }
}

/**
 * Checks if currentUserId has blocked targetUserId
 */
export function isUserBlockedByMe(currentUserId: string, targetUserId: string): boolean {
  if (!currentUserId || !targetUserId) return false;
  const list = getBlockedUsers(currentUserId);
  return list.some(entry => entry.userId === targetUserId);
}

/**
 * Checks if targetUserId has blocked currentUserId
 */
export function hasTargetBlockedMe(currentUserId: string, targetUserId: string): boolean {
  if (!currentUserId || !targetUserId) return false;
  const list = getBlockedUsers(targetUserId);
  return list.some(entry => entry.userId === currentUserId);
}

/**
 * Block a target user
 */
export function blockUser(
  currentUserId: string,
  target: { id: string; name: string; role?: string; phone?: string; district?: string }
): BlockedUserEntry[] {
  const currentList = getBlockedUsers(currentUserId);
  if (currentList.some(e => e.userId === target.id)) {
    return currentList;
  }

  const newEntry: BlockedUserEntry = {
    userId: target.id,
    name: target.name,
    role: target.role,
    phone: target.phone,
    district: target.district,
    blockedAt: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };

  const updated = [newEntry, ...currentList];
  saveBlockedUsers(currentUserId, updated);

  // Also sync with user profile's blockedUserIds array
  const allProfiles = getAllUserProfiles();
  for (const phone of Object.keys(allProfiles)) {
    const u = allProfiles[phone];
    if (u.id === currentUserId) {
      u.blockedUserIds = updated.map(e => e.userId);
      saveUserProfile(u);
      break;
    }
  }

  return updated;
}

/**
 * Unblock a target user
 */
export function unblockUser(currentUserId: string, targetUserId: string): BlockedUserEntry[] {
  const currentList = getBlockedUsers(currentUserId);
  const updated = currentList.filter(e => e.userId !== targetUserId);
  saveBlockedUsers(currentUserId, updated);

  // Sync with user profile
  const allProfiles = getAllUserProfiles();
  for (const phone of Object.keys(allProfiles)) {
    const u = allProfiles[phone];
    if (u.id === currentUserId) {
      u.blockedUserIds = updated.map(e => e.userId);
      saveUserProfile(u);
      break;
    }
  }

  return updated;
}

// =========================================================================
// SAFETY TIPS HELPER
// =========================================================================

export function hasSeenSafetyTips(userId: string): boolean {
  try {
    return localStorage.getItem(`${SAFETY_TIPS_SEEN_PREFIX}${userId}`) === 'true';
  } catch {
    return false;
  }
}

export function markSafetyTipsAsSeen(userId: string): void {
  try {
    localStorage.setItem(`${SAFETY_TIPS_SEEN_PREFIX}${userId}`, 'true');
  } catch {}
}
