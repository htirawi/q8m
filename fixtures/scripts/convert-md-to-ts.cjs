#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseMdQuestions(mdContent, framework) {
  const lines = mdContent.split('\n');
  const questions = [];
  let currentQuestion = null;
  let currentAnswer = [];
  let inAnswer = false;

  for (const line of lines) {
    // Match question line like: ### 1) Question here?
    const questionMatch = line.match(/^###\s*(\d+)\)\s*(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion) {
        questions.push({
          id: currentQuestion.id,
          question: currentQuestion.text.trim(),
          answer: currentAnswer.join('\n').trim()
        });
      }
      
      // Start new question
      currentQuestion = {
        id: parseInt(questionMatch[1]),
        text: questionMatch[2]
      };
      currentAnswer = [];
      inAnswer = false;
      continue;
    }

    // Match answer header like: **Answer (senior-level):**
    if (line.match(/^\*\*Answer.*:\*\*$/)) {
      inAnswer = true;
      continue;
    }

    // Collect answer lines
    if (inAnswer && currentQuestion && line.trim()) {
      // Remove leading dash and spaces
      const answerLine = line.replace(/^-\s*/, '');
      if (answerLine) {
        currentAnswer.push(answerLine);
      }
    }

    // Empty line might end current answer section
    if (!line.trim() && currentAnswer.length > 0) {
      inAnswer = false;
    }
  }

  // Don't forget the last question
  if (currentQuestion) {
    questions.push({
      id: currentQuestion.id,
      question: currentQuestion.text.trim(),
      answer: currentAnswer.join('\n').trim()
    });
  }

  return questions;
}

function generateTypeScript(questions, framework) {
  const frameworkTitle = framework.charAt(0).toUpperCase() + framework.slice(1);
  
  let ts = `// ${frameworkTitle} Interview Questions - 100 Senior-Level Questions
// Auto-generated from markdown

export interface QA {
  id: number;
  question: string;
  answer: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
}

export const ${framework.toUpperCase()}_QUESTIONS: QA[] = [\n`;

  questions.forEach((q, index) => {
    const questionEscaped = q.question.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const answerEscaped = q.answer.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    
    ts += `  {\n`;
    ts += `    id: ${q.id},\n`;
    ts += `    question: \`${questionEscaped}\`,\n`;
    ts += `    answer: \`${answerEscaped}\`,\n`;
    ts += `  }${index < questions.length - 1 ? ',' : ''}\n`;
  });

  ts += `];\n\nexport default ${framework.toUpperCase()}_QUESTIONS;\n`;
  
  return ts;
}

// Main execution
const frameworks = [
  { name: 'nextjs', file: 'nextjs-100-questions.md' },
  { name: 'react', file: 'react-100-questions.md' },
  { name: 'redux', file: 'redux-100-questions.md' }
];

const dataDir = path.join(__dirname, '../src/data');

frameworks.forEach(({ name, file }) => {
  const mdPath = path.join(dataDir, file);
  const tsPath = path.join(dataDir, `${name}.ts`);
  
  console.log(`\n📄 Processing ${file}...`);
  
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const questions = parseMdQuestions(mdContent, name);
  
  console.log(`✅ Parsed ${questions.length} questions`);
  
  const tsContent = generateTypeScript(questions, name);
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  
  console.log(`✅ Created ${name}.ts with ${questions.length} questions`);
});

console.log(`\n🎉 All done! Created 3 TypeScript files.\n`);

