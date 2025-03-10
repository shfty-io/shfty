import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Ensures rich text formatting has CSS classes instead of inline styles
 * This is useful for migrating existing product descriptions
 */
export function migrateRichTextFormatting(html: string): string {
  if (!html) return html;
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Add classes to elements based on their tag names
  const elements = tempDiv.querySelectorAll('h1, h2, h3, p, ul, ol, li, strong, em, code, a');
  elements.forEach(el => {
    // Add appropriate classes based on element type
    if (el.tagName.toLowerCase() === 'h1') {
      el.classList.add('rich-text-h1');
    } else if (el.tagName.toLowerCase() === 'h2') {
      el.classList.add('rich-text-h2');
    } else if (el.tagName.toLowerCase() === 'h3') {
      el.classList.add('rich-text-h3');
    } else if (el.tagName.toLowerCase() === 'p') {
      el.classList.add('rich-text-p');
    } else if (el.tagName.toLowerCase() === 'ul') {
      el.classList.add('rich-text-ul');
    } else if (el.tagName.toLowerCase() === 'ol') {
      el.classList.add('rich-text-ol');
    } else if (el.tagName.toLowerCase() === 'li') {
      el.classList.add('rich-text-li');
    } else if (el.tagName.toLowerCase() === 'strong') {
      el.classList.add('rich-text-strong');
    } else if (el.tagName.toLowerCase() === 'em') {
      el.classList.add('rich-text-em');
    } else if (el.tagName.toLowerCase() === 'code') {
      el.classList.add('rich-text-code');
    } else if (el.tagName.toLowerCase() === 'a') {
      el.classList.add('rich-text-a');
    }
  });
  
  return tempDiv.innerHTML;
}
