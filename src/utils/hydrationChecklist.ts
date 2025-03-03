export const hydrationChecklist = {
  componentRules: [
    "Use 'use client' directive for components with hooks or browser APIs",
    "Wrap client-only components with ClientOnly component",
    "Keep layout.tsx as a server component",
    "Use CSS variables for consistent styling",
    "Avoid mixing server and client components in the same file"
  ],
  
  styleRules: [
    "Define fixed dimensions for images",
    "Use CSS variables for repeated values",
    "Ensure consistent object-fit properties",
    "Apply proper responsive classes"
  ]
}; 