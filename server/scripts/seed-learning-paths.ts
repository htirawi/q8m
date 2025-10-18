/**
 * Seed Learning Paths
 * Creates 5 curated learning paths with modules
 */

import { LearningPath } from "../src/models/LearningPath";
import { User } from "../src/models/User";
import { Question } from "../src/models/Question";
import type { IQuestion } from "../src/models/Question";
import { connectDatabase } from "../src/config/database";

async function seedLearningPaths() {
  try {
    console.log("🌱 Starting learning paths seed...");

    // Connect to database
    await connectDatabase();
    console.log("✓ Connected to database");

    // Find or create admin user
    let admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      console.log("⚠️  Admin user not found, creating one...");
      admin = await User.create({
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
        role: "admin",
        isEmailVerified: true,
      });
      console.log("✓ Admin user created");
    }

    // Get some question IDs from the database
    const reactQuestions = await Question.find({ framework: "react", isActive: true }).limit(15);
    const angularQuestions = await Question.find({ framework: "angular", isActive: true }).limit(
      15
    );
    const nextjsQuestions = await Question.find({ framework: "nextjs", isActive: true }).limit(10);
    const reduxQuestions = await Question.find({ framework: "redux", isActive: true }).limit(10);
    const generalQuestions = await Question.find({ isActive: true }).limit(20);

    console.log(`✓ Found ${reactQuestions.length} React questions`);
    console.log(`✓ Found ${angularQuestions.length} Angular questions`);
    console.log(`✓ Found ${nextjsQuestions.length} Next.js questions`);
    console.log(`✓ Found ${reduxQuestions.length} Redux questions`);

    // Clear existing learning paths (optional - remove this line if you want to keep existing paths)
    await LearningPath.deleteMany({});
    console.log("✓ Cleared existing learning paths");

    // Learning Path 1: React Fundamentals to Advanced
    const reactPath = await LearningPath.create({
      title: {
        en: "React Fundamentals to Advanced",
        ar: "React من الأساسيات إلى المتقدم",
      },
      description: {
        en: "Master React from the ground up. Learn components, hooks, state management, and advanced patterns used in production applications.",
        ar: "احترف React من الصفر. تعلم المكونات والخطافات وإدارة الحالة والأنماط المتقدمة المستخدمة في التطبيقات الإنتاجية.",
      },
      slug: "react-fundamentals-to-advanced",
      category: "frontend",
      difficulty: "mixed",
      frameworks: ["react", "javascript"],
      modules: [
        {
          moduleId: "react-basics",
          title: {
            en: "React Basics",
            ar: "أساسيات React",
          },
          description: {
            en: "Learn JSX, components, and props",
            ar: "تعلم JSX والمكونات والخصائص",
          },
          order: 1,
          estimatedMinutes: 45,
          questionIds: reactQuestions.slice(0, 5).map((q: IQuestion) => q._id),
          prerequisites: [],
          isLocked: false,
        },
        {
          moduleId: "react-state-lifecycle",
          title: {
            en: "State and Lifecycle",
            ar: "الحالة ودورة الحياة",
          },
          description: {
            en: "Understanding state management and component lifecycle",
            ar: "فهم إدارة الحالة ودورة حياة المكونات",
          },
          order: 2,
          estimatedMinutes: 60,
          questionIds: reactQuestions.slice(5, 10).map((q: IQuestion) => q._id),
          prerequisites: ["react-basics"],
          isLocked: false,
        },
        {
          moduleId: "react-hooks",
          title: {
            en: "React Hooks",
            ar: "خطافات React",
          },
          description: {
            en: "Master useState, useEffect, and custom hooks",
            ar: "احترف useState و useEffect والخطافات المخصصة",
          },
          order: 3,
          estimatedMinutes: 90,
          questionIds: reactQuestions.slice(10, 15).map((q: IQuestion) => q._id),
          prerequisites: ["react-state-lifecycle"],
          isLocked: false,
        },
      ],
      totalQuestions: 15,
      estimatedHours: 3,
      prerequisites: [],
      tags: ["react", "frontend", "javascript", "spa"],
      isPremium: false,
      isPublished: true,
      enrollmentCount: 0,
      completionCount: 0,
      rating: 4.8,
      createdBy: admin._id,
    });

    console.log("✓ Created: React Fundamentals to Advanced");

    // Learning Path 2: Angular Enterprise Development
    const angularPath = await LearningPath.create({
      title: {
        en: "Angular Enterprise Development",
        ar: "تطوير تطبيقات Angular للشركات",
      },
      description: {
        en: "Build scalable enterprise applications with Angular. Learn modules, services, dependency injection, and best practices.",
        ar: "بناء تطبيقات قابلة للتوسع مع Angular. تعلم الوحدات والخدمات وحقن التبعية وأفضل الممارسات.",
      },
      slug: "angular-enterprise-development",
      category: "frontend",
      difficulty: "advanced",
      frameworks: ["angular", "typescript"],
      modules: [
        {
          moduleId: "angular-architecture",
          title: {
            en: "Angular Architecture",
            ar: "هندسة Angular",
          },
          description: {
            en: "Modules, components, and project structure",
            ar: "الوحدات والمكونات وبنية المشروع",
          },
          order: 1,
          estimatedMinutes: 60,
          questionIds: angularQuestions.slice(0, 5).map((q: IQuestion) => q._id),
          prerequisites: [],
          isLocked: false,
        },
        {
          moduleId: "angular-services-di",
          title: {
            en: "Services and Dependency Injection",
            ar: "الخدمات وحقن التبعية",
          },
          description: {
            en: "Master Angular services and DI patterns",
            ar: "احترف الخدمات وأنماط حقن التبعية",
          },
          order: 2,
          estimatedMinutes: 75,
          questionIds: angularQuestions.slice(5, 10).map((q: IQuestion) => q._id),
          prerequisites: ["angular-architecture"],
          isLocked: false,
        },
        {
          moduleId: "angular-advanced",
          title: {
            en: "Advanced Patterns",
            ar: "الأنماط المتقدمة",
          },
          description: {
            en: "RxJS, state management, and performance",
            ar: "RxJS وإدارة الحالة والأداء",
          },
          order: 3,
          estimatedMinutes: 90,
          questionIds: angularQuestions.slice(10, 15).map((q: IQuestion) => q._id),
          prerequisites: ["angular-services-di"],
          isLocked: false,
        },
      ],
      totalQuestions: 15,
      estimatedHours: 4,
      prerequisites: [],
      tags: ["angular", "typescript", "enterprise", "rxjs"],
      isPremium: true,
      isPublished: true,
      enrollmentCount: 0,
      completionCount: 0,
      rating: 4.7,
      createdBy: admin._id,
    });

    console.log("✓ Created: Angular Enterprise Development");

    // Learning Path 3: Full Stack Next.js
    const nextjsPath = await LearningPath.create({
      title: {
        en: "Full Stack Next.js Development",
        ar: "تطوير Full Stack مع Next.js",
      },
      description: {
        en: "Build modern full-stack applications with Next.js. Learn SSR, SSG, API routes, and deployment strategies.",
        ar: "بناء تطبيقات Full Stack حديثة مع Next.js. تعلم SSR و SSG ومسارات API واستراتيجيات النشر.",
      },
      slug: "fullstack-nextjs-development",
      category: "fullstack",
      difficulty: "intermediate",
      frameworks: ["nextjs", "react"],
      modules: [
        {
          moduleId: "nextjs-fundamentals",
          title: {
            en: "Next.js Fundamentals",
            ar: "أساسيات Next.js",
          },
          description: {
            en: "Pages, routing, and file-based routing",
            ar: "الصفحات والتوجيه والتوجيه القائم على الملفات",
          },
          order: 1,
          estimatedMinutes: 50,
          questionIds: nextjsQuestions.slice(0, 5).map((q: IQuestion) => q._id),
          prerequisites: [],
          isLocked: false,
        },
        {
          moduleId: "nextjs-rendering",
          title: {
            en: "Rendering Strategies",
            ar: "استراتيجيات العرض",
          },
          description: {
            en: "SSR, SSG, ISR, and client-side rendering",
            ar: "عرض الخادم والإنشاء الثابت والعرض من جانب العميل",
          },
          order: 2,
          estimatedMinutes: 70,
          questionIds: nextjsQuestions.slice(5, 10).map((q: IQuestion) => q._id),
          prerequisites: ["nextjs-fundamentals"],
          isLocked: false,
        },
      ],
      totalQuestions: 10,
      estimatedHours: 2,
      prerequisites: [],
      tags: ["nextjs", "react", "ssr", "fullstack"],
      isPremium: false,
      isPublished: true,
      enrollmentCount: 0,
      completionCount: 0,
      rating: 4.9,
      createdBy: admin._id,
    });

    console.log("✓ Created: Full Stack Next.js Development");

    // Learning Path 4: State Management Mastery
    const stateMgmtPath = await LearningPath.create({
      title: {
        en: "State Management Mastery",
        ar: "إتقان إدارة الحالة",
      },
      description: {
        en: "Master state management patterns with Redux, Context API, and modern solutions like Zustand and Jotai.",
        ar: "احترف أنماط إدارة الحالة مع Redux و Context API والحلول الحديثة مثل Zustand و Jotai.",
      },
      slug: "state-management-mastery",
      category: "framework-specific",
      difficulty: "intermediate",
      frameworks: ["redux", "react"],
      modules: [
        {
          moduleId: "redux-fundamentals",
          title: {
            en: "Redux Fundamentals",
            ar: "أساسيات Redux",
          },
          description: {
            en: "Actions, reducers, and store",
            ar: "الإجراءات والمخفضات والمتجر",
          },
          order: 1,
          estimatedMinutes: 60,
          questionIds: reduxQuestions.slice(0, 5).map((q: IQuestion) => q._id),
          prerequisites: [],
          isLocked: false,
        },
        {
          moduleId: "redux-advanced",
          title: {
            en: "Advanced Redux",
            ar: "Redux المتقدم",
          },
          description: {
            en: "Middleware, selectors, and Redux Toolkit",
            ar: "البرمجيات الوسيطة والمحددات و Redux Toolkit",
          },
          order: 2,
          estimatedMinutes: 75,
          questionIds: reduxQuestions.slice(5, 10).map((q: IQuestion) => q._id),
          prerequisites: ["redux-fundamentals"],
          isLocked: false,
        },
      ],
      totalQuestions: 10,
      estimatedHours: 2.5,
      prerequisites: [],
      tags: ["redux", "state-management", "react"],
      isPremium: true,
      isPublished: true,
      enrollmentCount: 0,
      completionCount: 0,
      rating: 4.6,
      createdBy: admin._id,
    });

    console.log("✓ Created: State Management Mastery");

    // Learning Path 5: Frontend Interview Preparation
    const interviewPath = await LearningPath.create({
      title: {
        en: "Frontend Interview Preparation",
        ar: "الإعداد لمقابلات Frontend",
      },
      description: {
        en: "Ace your frontend interviews. Comprehensive preparation covering algorithms, system design, and framework-specific questions.",
        ar: "انجح في مقابلات Frontend. إعداد شامل يغطي الخوارزميات وتصميم الأنظمة والأسئلة الخاصة بالأطر.",
      },
      slug: "frontend-interview-preparation",
      category: "interview",
      difficulty: "mixed",
      frameworks: ["react", "angular", "javascript"],
      modules: [
        {
          moduleId: "interview-fundamentals",
          title: {
            en: "JavaScript Fundamentals",
            ar: "أساسيات JavaScript",
          },
          description: {
            en: "Core JavaScript concepts for interviews",
            ar: "مفاهيم JavaScript الأساسية للمقابلات",
          },
          order: 1,
          estimatedMinutes: 60,
          questionIds: generalQuestions.slice(0, 7).map((q: IQuestion) => q._id),
          prerequisites: [],
          isLocked: false,
        },
        {
          moduleId: "interview-frameworks",
          title: {
            en: "Framework Questions",
            ar: "أسئلة الأطر",
          },
          description: {
            en: "Common React and Angular interview questions",
            ar: "أسئلة المقابلات الشائعة عن React و Angular",
          },
          order: 2,
          estimatedMinutes: 80,
          questionIds: generalQuestions.slice(7, 14).map((q: IQuestion) => q._id),
          prerequisites: ["interview-fundamentals"],
          isLocked: false,
        },
        {
          moduleId: "interview-system-design",
          title: {
            en: "System Design",
            ar: "تصميم الأنظمة",
          },
          description: {
            en: "Frontend system design and architecture",
            ar: "تصميم وهندسة أنظمة Frontend",
          },
          order: 3,
          estimatedMinutes: 90,
          questionIds: generalQuestions.slice(14, 20).map((q: IQuestion) => q._id),
          prerequisites: ["interview-frameworks"],
          isLocked: false,
        },
      ],
      totalQuestions: 20,
      estimatedHours: 4,
      prerequisites: [],
      tags: ["interview", "preparation", "algorithms", "system-design"],
      isPremium: false,
      isPublished: true,
      enrollmentCount: 0,
      completionCount: 0,
      rating: 5.0,
      createdBy: admin._id,
    });

    console.log("✓ Created: Frontend Interview Preparation");

    console.log("\n🎉 Successfully seeded 5 learning paths:");
    console.log(`  1. ${reactPath.slug}`);
    console.log(`  2. ${angularPath.slug}`);
    console.log(`  3. ${nextjsPath.slug}`);
    console.log(`  4. ${stateMgmtPath.slug}`);
    console.log(`  5. ${interviewPath.slug}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding learning paths:", error);
    process.exit(1);
  }
}

// Run the seed function
seedLearningPaths();
