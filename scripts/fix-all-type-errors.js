#!/usr/bin/env node

/**
 * Automated Type Error Fixer
 * Fixes the most common type error patterns across the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const CLIENT_SRC = join(process.cwd(), "client", "src");

// Track statistics
const stats = {
  filesProcessed: 0,
  fixesApplied: 0,
  errors: [],
};

// Common function name fixes (lowercase → camelCase)
const FUNCTION_RENAMES = {
  // Handle functions
  handleclick: "handleClick",
  handlesubmit: "handleSubmit",
  handleclose: "handleClose",
  handlecancel: "handleCancel",
  handleinput: "handleInput",
  handleblur: "handleBlur",
  handlefocus: "handleFocus",
  handlechange: "handleChange",
  handlesave: "handleSave",
  handledelete: "handleDelete",
  handleedit: "handleEdit",
  handlerefresh: "handleRefresh",
  handleretry: "handleRetry",
  handleupgrade: "handleUpgrade",
  handleupgradeclick: "handleUpgradeClick",
  handlelogout: "handleLogout",
  handlemouseleave: "handleMouseLeave",
  handleitemclick: "handleItemClick",
  handletabkey: "handleTabKey",
  handletypeahead: "handleTypeAhead",
  handletouchmove: "handleTouchMove",
  handletouchend: "handleTouchEnd",
  handleclickoutside: "handleClickOutside",
  handleaccept: "handleAccept",
  handlereject: "handleReject",
  handlestart: "handleStart",
  handleviewdetails: "handleViewDetails",
  handleloadmore: "handleLoadMore",
  handlecreatechallenge: "handleCreateChallenge",
  handlebackdropclick: "handleBackdropClick",
  handleconfirm: "handleConfirm",
  handlestartquizzes: "handleStartQuizzes",
  handlecancelconfirm: "handleCancelConfirm",
  handlecheckout: "handleCheckout",
  handlepaypalcheckout: "handlePayPalCheckout",
  handleoauthlogin: "handleOAuthLogin",
  handleregistrationsuccess: "handleRegistrationSuccess",
  handleactivityclick: "handleActivityClick",
  handleaction: "handleAction",
  handlequickaction: "handleQuickAction",
  handlefileselect: "handleFileSelect",
  handlekeydown: "handleKeydown",
  handlemaybelater: "handleMaybeLater",
  handleseeplans: "handleSeePlans",
  handlecontinuefree: "handleContinueFree",
  handledismiss: "handleDismiss",
  handleenablenotifications: "handleEnableNotifications",
  handleplanselect: "handlePlanSelect",
  handlecheckoutclose: "handleCheckoutClose",
  handlecheckoutsuccess: "handleCheckoutSuccess",
  handlectaclick: "handleCtaClick",
  handlepaypalclick: "handlePayPalClick",
  handlebeforeenter: "handleBeforeEnter",
  handleafterenter: "handleAfterEnter",
  handleenter: "handleEnter",
  handleleave: "handleLeave",
  handlemodeselect: "handleModeSelect",
  handlelevelclick: "handleLevelClick",
  handlebadgeclick: "handleBadgeClick",
  handleperiodchange: "handlePeriodChange",
  handlescopechange: "handleScopeChange",
  handlereply: "handleReply",
  handlepin: "handlePin",
  handlebestanswer: "handleBestAnswer",
  handlereport: "handleReport",
  handleblock: "handleBlock",
  handleview: "handleView",

  // Toggle functions
  togglemenu: "toggleMenu",
  togglefilter: "toggleFilter",
  togglefullscreen: "toggleFullscreen",
  togglevoice: "toggleVoice",
  togglereplyform: "toggleReplyForm",
  togglereplies: "toggleReplies",
  togglesolution: "toggleSolution",
  togglereaction: "toggleReaction",
  togglerecording: "toggleRecording",
  toggleframework: "toggleFramework",
  togglecoupon: "toggleCoupon",
  togglecomparison: "toggleComparison",
  togglefaq: "toggleFaq",
  toggleexpanded: "toggleExpanded",
  togglemonitor: "toggleMonitor",
  togglelanguage: "toggleLanguage",

  // Other action functions
  openmenu: "openMenu",
  closemenu: "closeMenu",
  closechat: "closeChat",
  clearfilters: "clearFilters",
  clearcontext: "clearContext",
  clearhistory: "clearHistory",
  clearall: "clearAll",
  loadhistory: "loadHistory",
  loadpreferences: "loadPreferences",
  loadexplanation: "loadExplanation",
  loadprogressstats: "loadProgressStats",
  loadquestions: "loadQuestions",
  loadbookmarkedquestions: "loadBookmarkedQuestions",
  loadmore: "loadMore",
  savepreferences: "savePreferences",
  savesettings: "saveSettings",
  savequizprogress: "saveQuizProgress",
  savequizhistory: "saveQuizHistory",
  selectoption: "selectOption",
  selectplan: "selectPlan",
  selectframework: "selectFramework",
  selectlevel: "selectLevel",
  selectfile: "selectFile",
  selectsuggestion: "selectSuggestion",
  selectmethod: "selectMethod",
  selectcurrency: "selectCurrency",
  selectexperiencelevel: "selectExperienceLevel",
  sendmessage: "sendMessage",
  goback: "goBack",
  gotoquizzes: "goToQuizzes",
  gotostudy: "goToStudy",
  gotobilling: "goToBilling",
  gotopricing: "goToPricing",
  gotoprogress: "goToProgress",
  gotoeasyquizzes: "goToEasyQuizzes",
  gotopath: "goToPath",
  gotolearningpaths: "goToLearningPaths",
  formatdate: "formatDate",
  formattime: "formatTime",
  formatrelativetime: "formatRelativeTime",
  getdifficultyicon: "getDifficultyIcon",
  getdifficultylabel: "getDifficultyLabel",
  getdifficultybadgeclass: "getDifficultyBadgeClass",
  getdifficultyclass: "getDifficultyClass",
  getdifficultyprogressclass: "getDifficultyProgressClass",
  animategradient: "animateGradient",
  refreshstats: "refreshStats",
  refreshmetrics: "refreshMetrics",
  refreshrecommendations: "refreshRecommendations",
  refreshbillinghistory: "refreshBillingHistory",
  resetform: "resetForm",
  resetdefaults: "resetDefaults",
  resetquestionstate: "resetQuestionState",
  startquiz: "startQuiz",
  startstudying: "startStudying",
  starttopic: "startTopic",
  startlearningstep: "startLearningStep",
  startrecording: "startRecording",
  stoprecording: "stopRecording",
  startvoicerecognition: "startVoiceRecognition",
  stopvoicerecognition: "stopVoiceRecognition",
  nextquestion: "nextQuestion",
  finishquiz: "finishQuiz",
  dismissresume: "dismissResume",
  updatetextanswer: "updateTextAnswer",
  updatestreak: "updateStreak",
  updatesettings: "updateSettings",
  updatesearch: "updateSearch",
  updatequestiontype: "updateQuestionType",
  updateansweredfilter: "updateAnsweredFilter",
  scrolltobottom: "scrollToBottom",
  scrolltodifficultyselection: "scrollToDifficultySelection",
  setbillingcycle: "setBillingCycle",
  setpracticemode: "setPracticeMode",
  copymessage: "copyMessage",
  copycode: "copyCode",
  speakmessage: "speakMessage",
  regeneratemessage: "regenerateMessage",
  viewattachment: "viewAttachment",
  explainconcept: "explainConcept",
  submitfeedback: "submitFeedback",
  openinchat: "openInChat",
  continuestudying: "continueStudying",
  continuelearning: "continueLearning",
  adjustplan: "adjustPlan",
  exportplan: "exportPlan",
  applyfilters: "applyFilters",
  applycoupon: "applyCoupon",
  enrollinpath: "enrollInPath",
  expandmodule: "expandModule",
  removeframework: "removeFramework",
  revealanswer: "revealAnswer",
  navigateto: "navigateTo",
  canceldelete: "cancelDelete",
  canceledit: "cancelEdit",
  cancelreport: "cancelReport",
  switchtab: "switchTab",
  shufflequestions: "shuffleQuestions",
  generaterecommendations: "generateRecommendations",
  parseerrordetails: "parseErrorDetails",
  parseorderdetails: "parseOrderDetails",
  trackanalytics: "trackAnalytics",
  changeleaderboardtype: "changeLeaderboardType",
  getmoduletitle: "getModuleTitle",
  getmoduledescription: "getModuleDescription",
  getmodulequestionscount: "getModuleQuestionsCount",
  ismodulecompleted: "isModuleCompleted",
  iscurrentmodule: "isCurrentModule",
  getmoduleprogressdata: "getModuleProgressData",
  getmoduleprogresspercentage: "getModuleProgressPercentage",
  getmoduleclasses: "getModuleClasses",
  geticonclasses: "getIconClasses",
  handlemoduleclick: "handleModuleClick",
  getlevelbadgeclass: "getLevelBadgeClass",
  getlevelicon: "getLevelIcon",
  getleveliconclass: "getLevelIconClass",
  getlevelprogressclass: "getLevelProgressClass",
  getscorebarclass: "getScoreBarClass",
  getrecommendationbadgeclass: "getRecommendationBadgeClass",
  getprioritybadgeclass: "getPriorityBadgeClass",
  getpriorityborderclass: "getPriorityBorderClass",
  getstatusclass: "getStatusClass",
  getgradientclass: "getGradientClass",
  geticonbgclass: "getIconBgClass",
  gettitleclass: "getTitleClass",
  getborderclass: "getBorderClass",
  getfocusringclass: "getFocusRingClass",
  getbuttonclass: "getButtonClass",
  getprogressbarclass: "getProgressBarClass",
  getprogresstextclass: "getProgressTextClass",
  getactivityiconclass: "getActivityIconClass",
  getmetricclass: "getMetricClass",
  getnavbuttonclass: "getNavButtonClass",
  getoptionclass: "getOptionClass",
  getcheckboxclass: "getCheckboxClass",
  getcheckboxoptionclass: "getCheckboxOptionClass",
  getleveldescriptionclass: "getLevelDescriptionClass",
  getcurrencyflag: "getCurrencyFlag",
  getsparklestyle: "getSparkleStyle",
  removetoast: "removeToast",
  cleartoasts: "clearToasts",
  showtestnotification: "showTestNotification",
  sharebadge: "shareBadge",
  dismissbadge: "dismissBadge",
  showbadge: "showBadge",
  showbadges: "showBadges",
  showhint: "showHint",
  startanimation: "startAnimation",
  createparticles: "createParticles",
  drawparticle: "drawParticle",
  handleresize: "handleResize",
  extendsession: "extendSession",
};

// Function to recursively get all .vue and .ts files
function getAllFiles(dir, ext = [".vue", ".ts", ".tsx"]) {
  const files = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, dist, coverage
        if (!["node_modules", "dist", "coverage", ".git"].includes(item)) {
          files.push(...getAllFiles(fullPath, ext));
        }
      } else if (ext.some((e) => item.endsWith(e))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    stats.errors.push(`Error reading directory ${dir}: ${err.message}`);
  }

  return files;
}

// Function to fix a single file
function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, "utf8");
    let modified = false;
    let fixCount = 0;

    // Fix function name declarations
    for (const [oldName, newName] of Object.entries(FUNCTION_RENAMES)) {
      const patterns = [
        [`const ${oldName} =`, `const ${newName} =`],
        [`function ${oldName}(`, `function ${newName}(`],
        [`const ${oldName}:`, `const ${newName}:`],
      ];

      for (const [oldPattern, newPattern] of patterns) {
        if (content.includes(oldPattern)) {
          content = content.replace(
            new RegExp(oldPattern.replace(/[()]/g, "\\$&"), "g"),
            newPattern
          );
          modified = true;
          fixCount++;
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, content, "utf8");
      stats.fixesApplied += fixCount;
      return fixCount;
    }

    return 0;
  } catch (err) {
    stats.errors.push(`Error processing ${filePath}: ${err.message}`);
    return 0;
  }
}

// Main execution
console.log("🔧 Starting Automated Type Error Fix...\n");
console.log("📁 Scanning files in:", CLIENT_SRC);

const files = getAllFiles(CLIENT_SRC);
console.log(`📊 Found ${files.length} files to process\n`);

let filesFixed = 0;

for (const file of files) {
  const fixes = fixFile(file);
  if (fixes > 0) {
    filesFixed++;
    const relativePath = file.replace(CLIENT_SRC, "src");
    console.log(`✅ ${relativePath} (${fixes} fixes)`);
  }
  stats.filesProcessed++;
}

console.log("\n" + "=".repeat(60));
console.log("📊 Summary:");
console.log(`  Files processed: ${stats.filesProcessed}`);
console.log(`  Files modified: ${filesFixed}`);
console.log(`  Total fixes applied: ${stats.fixesApplied}`);

if (stats.errors.length > 0) {
  console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
  stats.errors.slice(0, 5).forEach((err) => console.log(`  - ${err}`));
}

console.log('\n✅ Done! Run "pnpm typecheck" to verify fixes.');
process.exit(0);
