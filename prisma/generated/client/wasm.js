
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.3.1
 * Query Engine version: acc0b9dd43eb689cbd20c9470515d719db10d0b0
 */
Prisma.prismaVersion = {
  client: "6.3.1",
  engine: "acc0b9dd43eb689cbd20c9470515d719db10d0b0"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  bio: 'bio',
  avatarUrl: 'avatarUrl',
  password: 'password',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  xp: 'xp',
  level: 'level',
  streak: 'streak',
  lastStreakUpdate: 'lastStreakUpdate',
  lastLoginDate: 'lastLoginDate',
  isAdmin: 'isAdmin',
  role: 'role',
  interests: 'interests',
  learningStyle: 'learningStyle',
  cramMode: 'cramMode'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state',
  oauth_token_secret: 'oauth_token_secret',
  oauth_token: 'oauth_token'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.LearningPreferencesScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  visualLearning: 'visualLearning',
  auditoryLearning: 'auditoryLearning',
  kinestheticLearning: 'kinestheticLearning'
};

exports.Prisma.TopicScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  userId: 'userId'
};

exports.Prisma.ProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  topicId: 'topicId',
  completed: 'completed'
};

exports.Prisma.BadgeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  imageUrl: 'imageUrl',
  userId: 'userId',
  earnedAt: 'earnedAt'
};

exports.Prisma.UpcomingReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  topicId: 'topicId',
  dueDate: 'dueDate'
};

exports.Prisma.LearningPathScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  userId: 'userId',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  shareId: 'shareId',
  sharedAt: 'sharedAt'
};

exports.Prisma.LearningPathItemScalarFieldEnum = {
  id: 'id',
  order: 'order',
  learningPathId: 'learningPathId',
  topicId: 'topicId',
  confidence: 'confidence'
};

exports.Prisma.ContentItemScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  content: 'content',
  type: 'type',
  difficulty: 'difficulty',
  topicId: 'topicId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  version: 'version'
};

exports.Prisma.ContentRatingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  contentItemId: 'contentItemId',
  rating: 'rating',
  createdAt: 'createdAt'
};

exports.Prisma.BookmarkScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  contentItemId: 'contentItemId',
  createdAt: 'createdAt'
};

exports.Prisma.QuizAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  contentItemId: 'contentItemId',
  score: 'score',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  answers: 'answers'
};

exports.Prisma.KnowledgeNodeScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  userId: 'userId',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaderboardEntryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  score: 'score',
  type: 'type',
  startDate: 'startDate',
  endDate: 'endDate'
};

exports.Prisma.ReviewSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  dueDate: 'dueDate',
  completed: 'completed',
  isUrgent: 'isUrgent'
};

exports.Prisma.ReviewItemScalarFieldEnum = {
  id: 'id',
  reviewSessionId: 'reviewSessionId',
  contentItemId: 'contentItemId',
  type: 'type',
  question: 'question',
  answer: 'answer',
  userAnswer: 'userAnswer',
  isCorrect: 'isCorrect',
  answeredAt: 'answeredAt'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ownerId: 'ownerId'
};

exports.Prisma.WorkspaceMemberScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  workspaceId: 'workspaceId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.WhiteboardScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WhiteboardVersionScalarFieldEnum = {
  id: 'id',
  whiteboardId: 'whiteboardId',
  content: 'content',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  versionNumber: 'versionNumber'
};

exports.Prisma.BreakoutRoomScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  name: 'name',
  createdAt: 'createdAt',
  endedAt: 'endedAt'
};

exports.Prisma.LivePollScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  question: 'question',
  options: 'options',
  createdAt: 'createdAt',
  endedAt: 'endedAt'
};

exports.Prisma.PollVoteScalarFieldEnum = {
  id: 'id',
  livePoolId: 'livePoolId',
  userId: 'userId',
  option: 'option',
  createdAt: 'createdAt'
};

exports.Prisma.SessionSummaryScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  content: 'content',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
};

exports.Prisma.ChatScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  chatId: 'chatId',
  userId: 'userId',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.UserSettingsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  notificationPreferences: 'notificationPreferences',
  voiceSettings: 'voiceSettings',
  privacySettings: 'privacySettings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnalyticsEntryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  topicId: 'topicId',
  timeSpent: 'timeSpent',
  score: 'score',
  date: 'date'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  message: 'message',
  read: 'read',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordlessTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  expiresAt: 'expiresAt',
  userId: 'userId'
};

exports.Prisma.DailyChallengeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  reward: 'reward',
  completed: 'completed',
  createdAt: 'createdAt',
  completedAt: 'completedAt'
};

exports.Prisma.ExternalGoalScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  platform: 'platform',
  title: 'title',
  progress: 'progress',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PrerequisiteScalarFieldEnum = {
  id: 'id',
  learningPathId: 'learningPathId',
  topicId: 'topicId',
  completed: 'completed'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  userId: 'userId',
  topicId: 'topicId',
  createdAt: 'createdAt'
};

exports.Prisma.AIPlaylistScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AIPlaylistItemScalarFieldEnum = {
  id: 'id',
  playlistId: 'playlistId',
  contentItemId: 'contentItemId',
  order: 'order'
};

exports.Prisma.ChallengeScoreScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  score: 'score',
  createdAt: 'createdAt'
};

exports.Prisma.AIRecommendationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.AIModuleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  content: 'content',
  tags: 'tags',
  difficulty: 'difficulty',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  topicId: 'topicId'
};

exports.Prisma.AIModuleLearningPathItemScalarFieldEnum = {
  id: 'id',
  order: 'order',
  learningPathId: 'learningPathId',
  aiModuleId: 'aiModuleId',
  confidence: 'confidence'
};

exports.Prisma.AIModuleQuizAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  aiModuleId: 'aiModuleId',
  topicId: 'topicId',
  score: 'score',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  answers: 'answers'
};

exports.Prisma.AIModuleRatingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  aiModuleId: 'aiModuleId',
  topicId: 'topicId',
  rating: 'rating',
  feedback: 'feedback',
  createdAt: 'createdAt'
};

exports.Prisma.UserProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  learningPathId: 'learningPathId',
  moduleId: 'moduleId',
  status: 'status',
  updatedAt: 'updatedAt'
};

exports.Prisma.AIChatScalarFieldEnum = {
  id: 'id',
  title: 'title',
  createdAt: 'createdAt',
  userId: 'userId'
};

exports.Prisma.AIChatMessageScalarFieldEnum = {
  id: 'id',
  chatId: 'chatId',
  display: 'display',
  role: 'role',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.PracticeAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  aiModuleId: 'aiModuleId',
  questions: 'questions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  score: 'score',
  averageEase: 'averageEase',
  completedAt: 'completedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Activity: 'Activity',
  LearningPreferences: 'LearningPreferences',
  Topic: 'Topic',
  Progress: 'Progress',
  Badge: 'Badge',
  UpcomingReview: 'UpcomingReview',
  LearningPath: 'LearningPath',
  LearningPathItem: 'LearningPathItem',
  ContentItem: 'ContentItem',
  ContentRating: 'ContentRating',
  Bookmark: 'Bookmark',
  QuizAttempt: 'QuizAttempt',
  KnowledgeNode: 'KnowledgeNode',
  LeaderboardEntry: 'LeaderboardEntry',
  ReviewSession: 'ReviewSession',
  ReviewItem: 'ReviewItem',
  Workspace: 'Workspace',
  WorkspaceMember: 'WorkspaceMember',
  Whiteboard: 'Whiteboard',
  WhiteboardVersion: 'WhiteboardVersion',
  BreakoutRoom: 'BreakoutRoom',
  LivePoll: 'LivePoll',
  PollVote: 'PollVote',
  SessionSummary: 'SessionSummary',
  Chat: 'Chat',
  ChatMessage: 'ChatMessage',
  UserSettings: 'UserSettings',
  AnalyticsEntry: 'AnalyticsEntry',
  Notification: 'Notification',
  PasswordlessToken: 'PasswordlessToken',
  DailyChallenge: 'DailyChallenge',
  ExternalGoal: 'ExternalGoal',
  Prerequisite: 'Prerequisite',
  Comment: 'Comment',
  AIPlaylist: 'AIPlaylist',
  AIPlaylistItem: 'AIPlaylistItem',
  ChallengeScore: 'ChallengeScore',
  AIRecommendation: 'AIRecommendation',
  AIModule: 'AIModule',
  AIModuleLearningPathItem: 'AIModuleLearningPathItem',
  AIModuleQuizAttempt: 'AIModuleQuizAttempt',
  AIModuleRating: 'AIModuleRating',
  UserProgress: 'UserProgress',
  AIChat: 'AIChat',
  AIChatMessage: 'AIChatMessage',
  PracticeAttempt: 'PracticeAttempt'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
