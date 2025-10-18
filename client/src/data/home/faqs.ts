import type { IFaq } from "@/types/components/home";

/**
 * Homepage FAQ Data
 *
 * Frequently asked questions for the homepage.
 * These will be used to generate FAQ schema for SEO.
 */
export const HOMEPAGE_FAQS: IFaq[] = [
  {
    id: "faq-1",
    qKey: "home.faq.items.trial.question",
    aKey: "home.faq.items.trial.answer",
  },
  {
    id: "faq-2",
    qKey: "home.faq.items.payment.question",
    aKey: "home.faq.items.payment.answer",
  },
  {
    id: "faq-3",
    qKey: "home.faq.items.content.question",
    aKey: "home.faq.items.content.answer",
  },
  {
    id: "faq-4",
    qKey: "home.faq.items.cancel.question",
    aKey: "home.faq.items.cancel.answer",
  },
  {
    id: "faq-5",
    qKey: "home.faq.items.refund.question",
    aKey: "home.faq.items.refund.answer",
  },
  {
    id: "faq-6",
    qKey: "home.faq.items.support.question",
    aKey: "home.faq.items.support.answer",
  },
];
