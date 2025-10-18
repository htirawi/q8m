import type { ITestimonial } from "@/types/components/home";

/**
 * Homepage Testimonials Data
 *
 * Customer success stories and social proof.
 * Avatar URLs are optional; we use placeholder initials if missing.
 */
export const HOMEPAGE_TESTIMONIALS: ITestimonial[] = [
  {
    id: "testimonial-1",
    quoteKey: "home.testimonials.items.sarah.quote",
    nameKey: "home.testimonials.items.sarah.name",
    roleKey: "home.testimonials.items.sarah.role",
    companyKey: "home.testimonials.items.sarah.company",
    avatarUrl: undefined, // Will use initials fallback
    rating: 5,
  },
  {
    id: "testimonial-2",
    quoteKey: "home.testimonials.items.ahmed.quote",
    nameKey: "home.testimonials.items.ahmed.name",
    roleKey: "home.testimonials.items.ahmed.role",
    companyKey: "home.testimonials.items.ahmed.company",
    avatarUrl: undefined,
    rating: 5,
  },
  {
    id: "testimonial-3",
    quoteKey: "home.testimonials.items.emma.quote",
    nameKey: "home.testimonials.items.emma.name",
    roleKey: "home.testimonials.items.emma.role",
    companyKey: "home.testimonials.items.emma.company",
    avatarUrl: undefined,
    rating: 5,
  },
];
