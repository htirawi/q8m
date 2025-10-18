#!/bin/bash

# Direct fix for all missing props based on actual errors
# This script adds the exact missing props to the correct interfaces

cd "$(dirname "$0")/.."

echo "🔧 Adding missing props to interfaces..."
echo ""

# IPlanComparisonCardProps - add targetPlan
sed -i '' '/export interface IPlanComparisonCardProps {/,/^}/s/^}/  targetPlan?: string;\n}/' \
  client/src/types/components/marketing.ts

# IInlineUpsellCardProps - add contentId
sed -i '' '/export interface IInlineUpsellCardProps {/,/^}/s/^}/  contentId?: string;\n}/' \
  client/src/types/components/paywall.ts

# INotificationPromptProps - add dismissible and autoDismissDelay
sed -i '' '/export interface INotificationPromptProps {/,/^}/s/^}/  dismissible?: boolean;\n  autoDismissDelay?: number;\n}/' \
  client/src/types/components/notifications.ts

# ICountdownTimerProps - add duration, autoReset, resetDuration
sed -i '' '/export interface ICountdownTimerProps {/,/^}/s/^}/  duration?: number;\n  autoReset?: boolean;\n  resetDuration?: number;\n}/' \
  client/src/types/components/pricing.ts

# IModernPricingCardProps - add planName
sed -i '' '/export interface IModernPricingCardProps {/,/^}/s/^}/  planName?: string;\n}/' \
  client/src/types/components/pricing.ts

# ITestimonialCarouselProps - add autoplayInterval
sed -i '' '/export interface ITestimonialCarouselProps {/,/^}/s/^}/  autoplayInterval?: number;\n}/' \
  client/src/types/components/pricing.ts

# ICardListSkeletonProps - add showImage, showMeta, showActions
sed -i '' '/export interface ICardListSkeletonProps {/,/^}/s/^}/  showImage?: boolean;\n  showMeta?: boolean;\n  showActions?: boolean;\n}/' \
  client/src/types/components/skeletons.ts

# IQuestionCardSkeletonProps - add showCode
sed -i '' '/export interface IQuestionCardSkeletonProps {/,/^}/s/^}/  showCode?: boolean;\n}/' \
  client/src/types/components/skeletons.ts

# IStartStudyingCtaProps - add disabled, scrollTargetSelector
sed -i '' '/export interface IStartStudyingCtaProps {/,/^}/s/^}/  disabled?: boolean;\n  scrollTargetSelector?: string;\n}/' \
  client/src/types/components/study.ts

# IStickyStartBarProps - add hasLastSession, selectedDifficulty, errorMessage
sed -i '' '/export interface IStickyStartBarProps {/,/^}/s/^}/  hasLastSession?: boolean;\n  selectedDifficulty?: string;\n  errorMessage?: string;\n}/' \
  client/src/types/components/study.ts

# IChallengeListProps - add emptyStateTitle, showCreateButton, pagination
sed -i '' '/export interface IChallengeListProps {/,/^}/s/^}/  emptyStateTitle?: string;\n  showCreateButton?: boolean;\n  pagination?: { currentPage: number; totalPages: number; pageSize: number };\n}/' \
  client/src/types/components/challenges.ts

# ICreateChallengeModalProps - add loading
sed -i '' '/export interface ICreateChallengeModalProps {/,/^}/s/^}/  loading?: boolean;\n}/' \
  client/src/types/components/challenges.ts

echo "✅ Props added to interfaces"
echo ""

# Check result
echo "🔍 Checking remaining errors..."
ERROR_COUNT=$(cd client && npx vue-tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
echo "📊 Remaining errors: $ERROR_COUNT"
echo ""

if [ "$ERROR_COUNT" -lt "650" ]; then
  echo "✅ Progress! Fixed ~80+ errors"
else
  echo "⚠️  Some fixes may not have applied"
fi

