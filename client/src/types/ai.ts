/**
 * AI Integration Types and Interfaces
 */

// AI Provider types
export type AIProvider = "openai" | "anthropic" | "gemini" | "local";

// Chat message types
export interface IChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    sources?: string[];
    codeBlocks?: ICodeBlock[];
    suggestions?: string[];
    relatedTopics?: string[];
    originalError?: string;
    retryable?: boolean;
  };
  streaming?: boolean;
  edited?: boolean;
  reactions?: IChatReaction[];
  attachments?: IChatAttachment[];
}

export interface ICodeBlock {
  language: string;
  code: string;
  filename?: string;
  lineNumbers?: boolean;
  highlighted?: boolean;
}

export interface IChatReaction {
  type: "helpful" | "unhelpful" | "copy" | "share" | "bookmark";
  count: number;
  userReacted: boolean;
}

export interface IChatAttachment {
  id: string;
  type: "image" | "code" | "document" | "link";
  url?: string;
  content?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
}

// Chat session types
export interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: IChatContext;
  status: "active" | "archived" | "deleted";
  model?: string;
  tags?: string[];
  sharedWith?: string[];
  pinned?: boolean;
}

export interface IChatContext {
  topic?: string;
  difficulty?: "junior" | "intermediate" | "senior";
  framework?: string;
  questionId?: string;
  lessonId?: string;
  customContext?: string;
  learningObjectives?: string[];
  previousTopics?: string[];
}

// AI Configuration
export interface IAIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  streamResponses?: boolean;
  enableVoice?: boolean;
  voiceLanguage?: string;
  autoSave?: boolean;
  codeExecutionEnabled?: boolean;
}

// Smart Explanations
export interface ISmartExplanation {
  id: string;
  questionId: string;
  concept: string;
  explanation: string;
  definition?: string; // Short definition of the concept
  importance?: string; // Why this concept matters
  pitfalls?: string[]; // Common mistakes
  difficulty: "beginner" | "intermediate" | "advanced";
  examples?: ICodeExample[];
  visualAids?: IVisualAid[];
  relatedConcepts?: string[];
  prerequisites?: string[];
  practiceProblems?: IPracticeProblem[];
  resources?: ILearningResource[];
  metadata?: {
    generatedAt: Date;
    model: string;
    confidence: number;
    readingTime: number;
  };
}

export interface ICodeExample {
  title: string;
  description?: string;
  code: string;
  language: string;
  output?: string;
  explanation?: string;
  antiPattern?: boolean;
}

export interface IVisualAid {
  type: "diagram" | "flowchart" | "animation" | "infographic";
  url?: string;
  svg?: string;
  description: string;
  interactive?: boolean;
}

export interface IPracticeProblem {
  id: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  hints?: string[];
  solution?: string;
  explanation?: string;
}

export interface ILearningResource {
  type: "article" | "video" | "documentation" | "tutorial" | "course";
  title: string;
  url: string;
  description?: string;
  duration?: string;
  free?: boolean;
  recommended?: boolean;
}

// Personalized Study Plans
export interface IStudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goal: string;
  duration: IStudyDuration;
  schedule: IStudySchedule;
  curriculum: ICurriculumModule[];
  progress: IStudyProgress;
  adaptiveSettings: IAdaptiveSettings;
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  status: "draft" | "active" | "paused" | "completed";
}

export interface IStudyDuration {
  weeks: number;
  hoursPerWeek: number;
  totalHours: number;
  startDate: Date;
  targetEndDate: Date;
}

export interface IStudySchedule {
  preferredDays: string[];
  preferredTimes: {
    start: string;
    end: string;
  };
  reminderSettings: {
    enabled: boolean;
    email?: boolean;
    push?: boolean;
    frequency: "daily" | "weekly" | "custom";
  };
  flexibility: "strict" | "moderate" | "flexible";
}

export interface ICurriculumModule {
  id: string;
  title: string;
  description: string;
  topics: ITopic[];
  estimatedHours: number;
  order: number;
  status: "locked" | "available" | "in-progress" | "completed";
  completedAt?: Date;
  quiz?: {
    id: string;
    passingScore: number;
    attempts: number;
    bestScore?: number;
  };
}

export interface ITopic {
  id: string;
  title: string;
  type: "lesson" | "practice" | "quiz" | "project";
  content: ITopicContent;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  completed: boolean;
  completedAt?: Date;
  score?: number;
  notes?: string;
}

export interface ITopicContent {
  theory?: string;
  examples?: ICodeExample[];
  exercises?: IPracticeProblem[];
  resources?: ILearningResource[];
  assessment?: {
    questions: number;
    passingScore: number;
  };
}

export interface IStudyProgress {
  overall: number;
  modules: Record<string, number>;
  topics: Record<string, boolean>;
  totalHoursStudied: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  velocity: number; // topics per week
}

export interface IAdaptiveSettings {
  enabled: boolean;
  difficultyAdjustment: "auto" | "manual";
  paceAdjustment: "auto" | "manual";
  focusOnWeakAreas: boolean;
  skipMasteredTopics: boolean;
  personalizedRecommendations: boolean;
  learningStyle: "visual" | "reading" | "practice" | "mixed";
}

export interface IMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
  reward?: {
    type: "badge" | "certificate" | "discount" | "feature";
    value: string;
  };
  criteria: {
    type: "modules_completed" | "hours_studied" | "score_achieved" | "streak_maintained";
    value: number;
  };
}

// AI Feedback and Analysis
export interface IAIFeedback {
  id: string;
  userId: string;
  type: "code_review" | "answer_analysis" | "concept_explanation" | "improvement_suggestion";
  context: Record<string, unknown>;
  feedback: string;
  suggestions?: string[];
  score?: number;
  strengths?: string[];
  improvements?: string[];
  nextSteps?: string[];
  timestamp: Date;
}

// AI Learning Analytics
export interface ILearningAnalytics {
  userId: string;
  period: "daily" | "weekly" | "monthly" | "all-time";
  metrics: {
    studyTime: number;
    topicsCompleted: number;
    questionsAnswered: number;
    accuracy: number;
    improvement: number;
    engagement: number;
    consistency: number;
  };
  insights: ILearningInsight[];
  recommendations: ILearningRecommendation[];
  predictedOutcomes: IPredictedOutcome[];
}

export interface ILearningInsight {
  type: "strength" | "weakness" | "trend" | "milestone" | "warning";
  title: string;
  description: string;
  importance: "low" | "medium" | "high";
  actionable: boolean;
  action?: {
    label: string;
    type: "navigate" | "study" | "practice" | "review";
    target?: string;
  };
}

export interface ILearningRecommendation {
  id: string;
  type: "topic" | "practice" | "review" | "challenge" | "break";
  title: string;
  description: string;
  reason: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedTime: number;
  deadline?: Date;
  resources?: ILearningResource[];
}

export interface IPredictedOutcome {
  metric: string;
  current: number;
  predicted: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

// Voice and Speech
export interface IVoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlayResponses: boolean;
  enableWakeWord: boolean;
  wakeWord?: string;
}

export interface ISpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

// AI Code Analysis
export interface ICodeAnalysis {
  id: string;
  code: string;
  language: string;
  analysis: {
    complexity: "low" | "medium" | "high";
    issues: ICodeIssue[];
    suggestions: ICodeSuggestion[];
    patterns: ICodePattern[];
    performance: IPerformanceAnalysis;
    security: ISecurityAnalysis;
    bestPractices: IBestPracticeViolation[];
    testCoverage?: number;
  };
  refactored?: {
    code: string;
    explanation: string;
    improvements: string[];
  };
  timestamp: Date;
}

export interface ICodeIssue {
  severity: "error" | "warning" | "info";
  line: number;
  column?: number;
  message: string;
  rule?: string;
  fixable: boolean;
  fix?: string;
}

export interface ICodeSuggestion {
  type: "optimization" | "refactor" | "style" | "pattern";
  description: string;
  before: string;
  after: string;
  impact: "low" | "medium" | "high";
}

export interface ICodePattern {
  name: string;
  detected: boolean;
  location?: { start: number; end: number };
  recommendation?: string;
}

export interface IPerformanceAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  bottlenecks?: string[];
  optimizations?: string[];
}

export interface ISecurityAnalysis {
  vulnerabilities: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    fix?: string;
  }>;
  secure: boolean;
}

export interface IBestPracticeViolation {
  rule: string;
  description: string;
  line?: number;
  suggestion: string;
}
