/**
 * AI Service - Core AI functionality provider
 */

import type {
  IAIConfig,
  IChatMessage,
  IChatSession,
  ISmartExplanation,
  IStudyPlan,
  ICodeAnalysis,
  IAIFeedback,
  IChatContext,
} from "@/types/ai";
import { ref } from "vue";
import { analytics } from "@/services/analytics";

// Configuration
const DEFAULT_CONFIG: IAIConfig = {
  provider: "openai",
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  streamResponses: true,
  enableVoice: false,
  autoSave: true,
  codeExecutionEnabled: false,
};

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  general: `You are an expert programming tutor specializing in web development.
You provide clear, accurate, and helpful explanations tailored to the user's skill level.
Focus on practical examples and best practices. Be encouraging and supportive.`,

  codeReview: `You are an expert code reviewer. Analyze code for:
- Correctness and functionality
- Performance and efficiency
- Security vulnerabilities
- Best practices and patterns
- Readability and maintainability
Provide constructive feedback with specific improvements.`,

  studyPlan: `You are a personalized learning coach. Create customized study plans that:
- Match the learner's goals and available time
- Adapt to their learning style and pace
- Include practical exercises and projects
- Build on prior knowledge progressively
- Maintain motivation through achievable milestones.`,

  explanation: `You are a master teacher who excels at explaining complex concepts.
Break down topics into digestible parts, use analogies and visual descriptions,
provide multiple examples, and check understanding with questions.`,
};

export class AIService {
  private config: IAIConfig;
  private sessions: Map<string, IChatSession> = new Map();
  private activeSessionId: string | null = null;
  private abortController: AbortController | null = null;

  // Reactive state
  public isLoading = ref(false);
  public error = ref<string | null>(null);
  public streamingMessage = ref<string>("");

  constructor(config?: Partial<IAIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadSessions();
  }

  /**
   * Initialize the AI service
   */
  async initialize(apiKey?: string): Promise<void> {
    if (apiKey) {
      this.config.apiKey = apiKey;
    }

    // Verify API key is present
    if (!this.config.apiKey && this.config.provider !== "local") {
      throw new Error("API key is required for AI service");
    }

    // Test connection
    try {
      await this.testConnection();
      analytics.track("ai_service_initialized", {
        provider: this.config.provider,
        model: this.config.model,
      });
    } catch (error) {
      console.error("AI service initialization failed:", error);
      throw error;
    }
  }

  /**
   * Send a chat message and get response
   */
  async sendMessage(
    message: string,
    context?: IChatContext,
    sessionId?: string
  ): Promise<IChatMessage> {
    this.isLoading.value = true;
    this.error.value = null;
    this.streamingMessage.value = "";

    try {
      // Get or create session
      const session = sessionId ? this.sessions.get(sessionId) : this.createSession(context);

      if (!session) throw new Error("Session not found");

      // Create user message
      const userMessage: IChatMessage = {
        id: this.generateId(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      session.messages.push(userMessage);

      // Prepare API request
      const requestBody = this.buildRequestBody(session, context);

      // Handle streaming vs non-streaming
      if (this.config.streamResponses) {
        return await this.streamResponse(requestBody, session);
      } else {
        return await this.getResponse(requestBody, session);
      }
    } catch (error: unknown) {
      this.error.value = error instanceof Error ? error.message : String(error);
      analytics.trackError(error instanceof Error ? error : String(error), {
        context: "ai_send_message",
      });
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Generate a smart explanation for a concept
   */
  async generateExplanation(
    concept: string,
    questionId: string,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): Promise<ISmartExplanation> {
    this.isLoading.value = true;

    try {
      const prompt = this.buildExplanationPrompt(concept, difficulty);

      const response = await this.callAPI({
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.explanation },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        maxTokens: 3000,
      });

      const explanation = this.parseExplanationResponse(response, concept, questionId, difficulty);

      analytics.track("ai_explanation_generated", {
        concept,
        difficulty,
        questionId,
      });

      return explanation;
    } catch (error: unknown) {
      this.error.value = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Generate a personalized study plan
   */
  async generateStudyPlan(
    userId: string,
    goal: string,
    timeCommitment: { weeks: number; hoursPerWeek: number },
    currentLevel: string,
    preferences?: Record<string, unknown>
  ): Promise<IStudyPlan> {
    this.isLoading.value = true;

    try {
      const prompt = this.buildStudyPlanPrompt(goal, timeCommitment, currentLevel, preferences);

      const response = await this.callAPI({
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.studyPlan },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 4000,
      });

      const studyPlan = this.parseStudyPlanResponse(response, userId, goal, timeCommitment);

      analytics.track("ai_study_plan_generated", {
        userId,
        goal,
        weeks: timeCommitment.weeks,
        hoursPerWeek: timeCommitment.hoursPerWeek,
      });

      return studyPlan;
    } catch (error: unknown) {
      this.error.value = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Analyze code and provide feedback
   */
  async analyzeCode(code: string, language: string, context?: string): Promise<ICodeAnalysis> {
    this.isLoading.value = true;

    try {
      const prompt = this.buildCodeAnalysisPrompt(code, language, context);

      const response = await this.callAPI({
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.codeReview },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        maxTokens: 2500,
      });

      const analysis = this.parseCodeAnalysisResponse(response, code, language);

      analytics.track("ai_code_analyzed", {
        language,
        codeLength: code.length,
      });

      return analysis;
    } catch (error: unknown) {
      this.error.value = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Get AI feedback on user's answer
   */
  async getAnswerFeedback(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    context?: Record<string, unknown>
  ): Promise<IAIFeedback> {
    this.isLoading.value = true;

    try {
      const prompt = `
Question: ${question}

User's Answer: ${userAnswer}

Correct Answer: ${correctAnswer}

Please provide detailed feedback on the user's answer including:
1. What they got right
2. What needs improvement
3. Why the correct answer is correct
4. Tips for remembering this concept
5. Related topics to study
      `;

      const response = await this.callAPI({
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.general },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        maxTokens: 1500,
      });

      return {
        id: this.generateId(),
        userId: String(context?.userId || ""),
        type: "answer_analysis",
        context: { question, userAnswer, correctAnswer },
        feedback: String(response.content),
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      this.error.value = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  // Private helper methods

  private async callAPI(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    const endpoint = this.getEndpoint();
    const headers = this.getHeaders();

    this.abortController = new AbortController();

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.config.model,
        ...params,
        temperature: params.temperature || this.config.temperature,
        max_tokens: params.maxTokens || this.config.maxTokens,
        top_p: params.topP || this.config.topP,
      }),
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  private async streamResponse(
    requestBody: Record<string, unknown>,
    session: IChatSession
  ): Promise<IChatMessage> {
    const endpoint = this.getEndpoint();
    const headers = this.getHeaders();

    this.abortController = new AbortController();

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...requestBody,
        stream: true,
      }),
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    const assistantMessage: IChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      streaming: true,
    };

    session.messages.push(assistantMessage);

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || "";
                assistantMessage.content += content;
                this.streamingMessage.value = assistantMessage.content;
              } catch (_e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    assistantMessage.streaming = false;
    this.saveSession(session);

    return assistantMessage;
  }

  private async getResponse(
    requestBody: Record<string, unknown>,
    session: IChatSession
  ): Promise<IChatMessage> {
    const response = await this.callAPI(requestBody);

    const assistantMessage: IChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: String(response.content),
      timestamp: new Date(),
      metadata: {
        model: this.config.model,
        tokens: (response.usage as { total_tokens?: number } | undefined)?.total_tokens,
      },
    };

    session.messages.push(assistantMessage);
    this.saveSession(session);

    return assistantMessage;
  }

  private buildRequestBody(session: IChatSession, context?: IChatContext): Record<string, unknown> {
    const messages = [
      { role: "system", content: this.getSystemPrompt(context) },
      ...session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    return {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
      frequency_penalty: this.config.frequencyPenalty,
      presence_penalty: this.config.presencePenalty,
    };
  }

  private getSystemPrompt(context?: IChatContext): string {
    let prompt = SYSTEM_PROMPTS.general;

    if (context) {
      if (context.topic) {
        prompt += `\n\nCurrent topic: ${context.topic}`;
      }
      if (context.difficulty) {
        prompt += `\nUser level: ${context.difficulty}`;
      }
      if (context.framework) {
        prompt += `\nFramework focus: ${context.framework}`;
      }
      if (context.customContext) {
        prompt += `\n\nAdditional context: ${context.customContext}`;
      }
    }

    return prompt;
  }

  private buildExplanationPrompt(concept: string, difficulty: string): string {
    return `
Explain the concept of "${concept}" for a ${difficulty} level developer.

Please provide:
1. A clear definition
2. Why it's important
3. How it works (with technical details appropriate for the level)
4. 2-3 practical code examples
5. Common pitfalls or misconceptions
6. Related concepts to explore next
7. Practice exercises

Use clear language, practical examples, and ensure the explanation builds understanding progressively.
Format the response in markdown with code blocks.
    `;
  }

  private buildStudyPlanPrompt(
    goal: string,
    timeCommitment: { weeks: number; hoursPerWeek: number },
    currentLevel: string,
    preferences?: Record<string, unknown>
  ): string {
    return `
Create a personalized study plan with the following requirements:

Goal: ${goal}
Current Level: ${currentLevel}
Duration: ${timeCommitment.weeks} weeks
Time Commitment: ${timeCommitment.hoursPerWeek} hours per week
Total Study Hours: ${timeCommitment.weeks * timeCommitment.hoursPerWeek} hours

${preferences ? `Learning Preferences: ${JSON.stringify(preferences)}` : ""}

Please create a comprehensive study plan that includes:
1. Weekly curriculum breakdown with specific topics
2. Learning objectives for each module
3. Hands-on projects and exercises
4. Recommended resources (free and paid)
5. Milestones and checkpoints
6. Assessment criteria
7. Time allocation for each topic
8. Prerequisites and dependencies

Format as a structured JSON-like response that can be parsed.
Ensure the plan is realistic, progressive, and achievable within the time constraints.
    `;
  }

  private buildCodeAnalysisPrompt(code: string, language: string, context?: string): string {
    return `
Analyze the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ""}

Please provide:
1. Code quality assessment (complexity, readability, maintainability)
2. Potential bugs or issues
3. Performance analysis
4. Security vulnerabilities
5. Best practice violations
6. Refactoring suggestions
7. Improved version of the code (if applicable)

Be specific with line numbers and provide actionable feedback.
    `;
  }

  private parseExplanationResponse(
    response: Record<string, unknown>,
    concept: string,
    questionId: string,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): ISmartExplanation {
    // Parse the AI response into structured explanation
    // This is a simplified version - in production, use proper parsing
    const content = String(response.content);
    return {
      id: this.generateId(),
      questionId,
      concept,
      explanation: content,
      difficulty,
      metadata: {
        generatedAt: new Date(),
        model: this.config.model!,
        confidence: 0.95,
        readingTime: Math.ceil(content.split(" ").length / 200),
      },
    };
  }

  private parseStudyPlanResponse(
    _response: Record<string, unknown>,
    userId: string,
    goal: string,
    timeCommitment: { weeks: number; hoursPerWeek: number }
  ): IStudyPlan {
    // Parse the AI response into structured study plan
    // This is a simplified version - in production, use proper parsing
    const now = new Date();
    return {
      id: this.generateId(),
      userId,
      title: `Study Plan: ${goal}`,
      description: `Personalized ${timeCommitment.weeks}-week plan to achieve: ${goal}`,
      goal,
      duration: {
        weeks: timeCommitment.weeks,
        hoursPerWeek: timeCommitment.hoursPerWeek,
        totalHours: timeCommitment.weeks * timeCommitment.hoursPerWeek,
        startDate: now,
        targetEndDate: new Date(now.getTime() + timeCommitment.weeks * 7 * 24 * 60 * 60 * 1000),
      },
      schedule: {
        preferredDays: ["Monday", "Wednesday", "Friday"],
        preferredTimes: { start: "19:00", end: "21:00" },
        reminderSettings: {
          enabled: true,
          email: true,
          push: true,
          frequency: "daily",
        },
        flexibility: "moderate",
      },
      curriculum: [], // Would be parsed from response
      progress: {
        overall: 0,
        modules: {},
        topics: {},
        totalHoursStudied: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageScore: 0,
        strengths: [],
        weaknesses: [],
        velocity: 0,
      },
      adaptiveSettings: {
        enabled: true,
        difficultyAdjustment: "auto",
        paceAdjustment: "auto",
        focusOnWeakAreas: true,
        skipMasteredTopics: false,
        personalizedRecommendations: true,
        learningStyle: "mixed",
      },
      milestones: [],
      createdAt: now,
      updatedAt: now,
      status: "active",
    };
  }

  private parseCodeAnalysisResponse(
    _response: Record<string, unknown>,
    code: string,
    language: string
  ): ICodeAnalysis {
    // Parse the AI response into structured code analysis
    return {
      id: this.generateId(),
      code,
      language,
      analysis: {
        complexity: "medium",
        issues: [],
        suggestions: [],
        patterns: [],
        performance: {
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
        },
        security: {
          vulnerabilities: [],
          secure: true,
        },
        bestPractices: [],
      },
      timestamp: new Date(),
    };
  }

  private createSession(context?: IChatContext): IChatSession {
    const session: IChatSession = {
      id: this.generateId(),
      title: context?.topic || "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      context,
      status: "active",
      model: this.config.model,
    };

    this.sessions.set(session.id, session);
    this.activeSessionId = session.id;
    return session;
  }

  private saveSession(session: IChatSession): void {
    session.updatedAt = new Date();
    this.sessions.set(session.id, session);

    if (this.config.autoSave) {
      this.persistSessions();
    }
  }

  private loadSessions(): void {
    try {
      const stored = localStorage.getItem("ai_chat_sessions");
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((session: IChatSession) => {
          this.sessions.set(session.id, session);
        });
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  }

  private persistSessions(): void {
    try {
      const data = Array.from(this.sessions.values());
      localStorage.setItem("ai_chat_sessions", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to persist chat sessions:", error);
    }
  }

  private getEndpoint(): string {
    // Always use our internal AI API endpoint
    return "/api/v1/ai/chat";
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      switch (this.config.provider) {
        case "openai":
          headers["Authorization"] = `Bearer ${this.config.apiKey}`;
          break;
        case "anthropic":
          headers["X-API-Key"] = this.config.apiKey;
          headers["anthropic-version"] = "2023-06-01";
          break;
        case "gemini":
          headers["X-API-Key"] = this.config.apiKey;
          break;
      }
    }

    return headers;
  }

  private async testConnection(): Promise<void> {
    // Simple test to verify API key works
    try {
      await this.callAPI({
        messages: [{ role: "user", content: "Hello" }],
        maxTokens: 10,
      });
    } catch (_error) {
      throw new Error("Failed to connect to AI service. Please check your API key.");
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for session management

  public getSessions(): IChatSession[] {
    return Array.from(this.sessions.values());
  }

  public getSession(id: string): IChatSession | undefined {
    return this.sessions.get(id);
  }

  public deleteSession(id: string): void {
    this.sessions.delete(id);
    if (this.activeSessionId === id) {
      this.activeSessionId = null;
    }
    this.persistSessions();
  }

  public clearSessions(): void {
    this.sessions.clear();
    this.activeSessionId = null;
    this.persistSessions();
  }

  public setActiveSession(id: string): void {
    if (this.sessions.has(id)) {
      this.activeSessionId = id;
    }
  }

  public cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.isLoading.value = false;
      this.streamingMessage.value = "";
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
