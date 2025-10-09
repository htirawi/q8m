/* eslint-disable no-console */

import { Question } from "@models/Question.js";

/**
 * Migration 002: Seed Questions Database
 *
 * Creates initial question data for all frameworks and difficulty levels
 *
 * Run: npm run migrate:002
 */

interface SeedResult {
  success: boolean;
  message: string;
  questionsCreated: number;
  error?: string;
}

const sampleQuestions = [
  // Angular Questions
  {
    framework: "angular",
    level: "junior",
    type: "multiple-choice",
    category: "Components",
    difficulty: "easy",
    tags: ["components", "basics", "angular"],
    points: 1,
    content: {
      en: {
        question: "What is a component in Angular?",
        options: [
          { id: "a", text: "A class decorated with @Component", isCorrect: true },
          { id: "b", text: "A function that returns JSX", isCorrect: false },
          { id: "c", text: "A service for data management", isCorrect: false },
          { id: "d", text: "A directive for DOM manipulation", isCorrect: false },
        ],
        explanation:
          "A component in Angular is a class decorated with @Component decorator that defines the view and behavior of a part of the UI.",
      },
      ar: {
        question: "ما هو المكون في Angular؟",
        options: [
          { id: "a", text: "فئة مزخرفة بـ @Component", isCorrect: true },
          { id: "b", text: "دالة تُرجع JSX", isCorrect: false },
          { id: "c", text: "خدمة لإدارة البيانات", isCorrect: false },
          { id: "d", text: "توجيه لمعالجة DOM", isCorrect: false },
        ],
        explanation:
          "المكون في Angular هو فئة مزخرفة بـ @Component decorator تحدد العرض والسلوك لجزء من واجهة المستخدم.",
      },
    },
    isActive: true,
  },
  {
    framework: "angular",
    level: "junior",
    type: "multiple-choice",
    category: "Services",
    difficulty: "easy",
    tags: ["services", "dependency-injection", "angular"],
    points: 1,
    content: {
      en: {
        question: "How do you inject a service in Angular?",
        options: [
          { id: "a", text: "Using @Injectable() decorator", isCorrect: false },
          { id: "b", text: "Using constructor injection", isCorrect: true },
          { id: "c", text: "Using @Inject() decorator", isCorrect: false },
          { id: "d", text: "Using provideIn: 'root'", isCorrect: false },
        ],
        explanation:
          "Services are injected through constructor injection in Angular. The @Injectable() decorator marks the service as injectable, but injection happens in the constructor.",
      },
      ar: {
        question: "كيف تقوم بحقن خدمة في Angular؟",
        options: [
          { id: "a", text: "باستخدام @Injectable() decorator", isCorrect: false },
          { id: "b", text: "باستخدام حقن المنشئ (constructor injection)", isCorrect: true },
          { id: "c", text: "باستخدام @Inject() decorator", isCorrect: false },
          { id: "d", text: "باستخدام provideIn: 'root'", isCorrect: false },
        ],
        explanation:
          "يتم حقن الخدمات من خلال حقن المنشئ في Angular. decorator @Injectable() يحدد الخدمة كقابلة للحقن، لكن الحقن يحدث في المنشئ.",
      },
    },
    isActive: true,
  },
  {
    framework: "angular",
    level: "intermediate",
    type: "multiple-choice",
    category: "Routing",
    difficulty: "medium",
    tags: ["routing", "navigation", "angular"],
    points: 2,
    content: {
      en: {
        question: "What is the purpose of RouterModule in Angular?",
        options: [
          { id: "a", text: "To handle HTTP requests", isCorrect: false },
          { id: "b", text: "To manage application routing", isCorrect: true },
          { id: "c", text: "To handle forms", isCorrect: false },
          { id: "d", text: "To manage state", isCorrect: false },
        ],
        explanation:
          "RouterModule is used for configuring and managing application routing in Angular applications.",
      },
      ar: {
        question: "ما هو الغرض من RouterModule في Angular؟",
        options: [
          { id: "a", text: "للتعامل مع طلبات HTTP", isCorrect: false },
          { id: "b", text: "لإدارة توجيه التطبيق", isCorrect: true },
          { id: "c", text: "للتعامل مع النماذج", isCorrect: false },
          { id: "d", text: "لإدارة الحالة", isCorrect: false },
        ],
        explanation: "يستخدم RouterModule لتكوين وإدارة توجيه التطبيق في تطبيقات Angular.",
      },
    },
    isActive: true,
  },
  // Vue Questions
  {
    framework: "vue",
    level: "junior",
    type: "multiple-choice",
    category: "Components",
    difficulty: "easy",
    tags: ["components", "basics", "vue"],
    points: 1,
    content: {
      en: {
        question: "What is the main building block of a Vue.js application?",
        options: [
          { id: "a", text: "Components", isCorrect: true },
          { id: "b", text: "Services", isCorrect: false },
          { id: "c", text: "Modules", isCorrect: false },
          { id: "d", text: "Controllers", isCorrect: false },
        ],
        explanation:
          "Components are the main building blocks of Vue.js applications. They are reusable Vue instances with a name.",
      },
      ar: {
        question: "ما هو اللبنة الأساسية لتطبيق Vue.js؟",
        options: [
          { id: "a", text: "المكونات (Components)", isCorrect: true },
          { id: "b", text: "الخدمات (Services)", isCorrect: false },
          { id: "c", text: "الوحدات (Modules)", isCorrect: false },
          { id: "d", text: "المتحكمات (Controllers)", isCorrect: false },
        ],
        explanation:
          "المكونات هي اللبنات الأساسية لتطبيقات Vue.js. إنها مثيلات Vue قابلة لإعادة الاستخدام مع اسم.",
      },
    },
    isActive: true,
  },
  // Next.js Questions
  {
    framework: "nextjs",
    level: "junior",
    type: "multiple-choice",
    category: "Routing",
    difficulty: "easy",
    tags: ["routing", "pages", "nextjs"],
    points: 1,
    content: {
      en: {
        question: "How does Next.js handle routing?",
        options: [
          { id: "a", text: "File-based routing", isCorrect: true },
          { id: "b", text: "Configuration-based routing", isCorrect: false },
          { id: "c", text: "Component-based routing", isCorrect: false },
          { id: "d", text: "Manual route definition", isCorrect: false },
        ],
        explanation:
          "Next.js uses file-based routing where the file structure in the pages directory determines the routes.",
      },
      ar: {
        question: "كيف يتعامل Next.js مع التوجيه؟",
        options: [
          { id: "a", text: "توجيه قائم على الملفات", isCorrect: true },
          { id: "b", text: "توجيه قائم على التكوين", isCorrect: false },
          { id: "c", text: "توجيه قائم على المكونات", isCorrect: false },
          { id: "d", text: "تعريف المسارات يدوياً", isCorrect: false },
        ],
        explanation:
          "يستخدم Next.js توجيهاً قائماً على الملفات حيث يحدد هيكل الملفات في مجلد pages المسارات.",
      },
    },
    isActive: true,
  },
  // Redux Questions
  {
    framework: "redux",
    level: "junior",
    type: "multiple-choice",
    category: "State Management",
    difficulty: "easy",
    tags: ["state", "redux", "basics"],
    points: 1,
    content: {
      en: {
        question: "What is Redux used for?",
        options: [
          { id: "a", text: "HTTP requests", isCorrect: false },
          { id: "b", text: "State management", isCorrect: true },
          { id: "c", text: "Routing", isCorrect: false },
          { id: "d", text: "Styling", isCorrect: false },
        ],
        explanation:
          "Redux is a predictable state container for JavaScript applications, primarily used for state management.",
      },
      ar: {
        question: "ما هو الغرض من Redux؟",
        options: [
          { id: "a", text: "طلبات HTTP", isCorrect: false },
          { id: "b", text: "إدارة الحالة", isCorrect: true },
          { id: "c", text: "التوجيه", isCorrect: false },
          { id: "d", text: "التنسيق", isCorrect: false },
        ],
        explanation:
          "Redux هو حاوي حالة قابل للتنبؤ لتطبيقات JavaScript، يُستخدم أساساً لإدارة الحالة.",
      },
    },
    isActive: true,
  },
];

export async function migrate002(): Promise<SeedResult> {
  try {
    console.log("🔄 Starting Migration 002: Seed Questions Database...");

    // Clear existing questions (optional - remove this line to keep existing data)
    // await Question.deleteMany({});
    // console.log("🗑️  Cleared existing questions");

    let questionsCreated = 0;

    for (const questionData of sampleQuestions) {
      try {
        // Check if question already exists
        const existingQuestion = await Question.findOne({
          framework: questionData.framework,
          level: questionData.level,
          category: questionData.category,
          "content.en.question": questionData.content.en.question,
        });

        if (!existingQuestion) {
          const question = new Question(questionData);
          await question.save();
          questionsCreated++;
          console.log(
            `✅ Created question: ${questionData.content.en.question.substring(0, 50)}...`
          );
        } else {
          console.log(
            `⏭️  Skipped existing question: ${questionData.content.en.question.substring(0, 50)}...`
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to create question: ${questionData.content.en.question.substring(0, 50)}...`,
          error
        );
      }
    }

    // Get statistics
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const byFramework = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$framework", count: { $sum: 1 } } },
    ]);
    const byLevel = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]);

    console.log("📊 Question Statistics:");
    console.log(`   Total questions: ${totalQuestions}`);
    console.log(
      "   By framework:",
      byFramework.map((f: { _id: string; count: number }) => `${f._id}: ${f.count}`).join(", ")
    );
    console.log(
      "   By level:",
      byLevel.map((l: { _id: string; count: number }) => `${l._id}: ${l.count}`).join(", ")
    );

    console.log("✅ Migration 002 completed successfully!");
    return {
      success: true,
      message: `Successfully seeded questions database`,
      questionsCreated,
    };
  } catch (error) {
    console.error("❌ Migration 002 failed:", error);
    return {
      success: false,
      message: "Questions seeding failed",
      questionsCreated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate002()
    .then((result) => {
      console.log("Migration Result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
