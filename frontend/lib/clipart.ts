import { ClipartItem } from '@/types';

// Predefined clipart library
export const clipartLibrary: ClipartItem[] = [
  {
    id: 'star',
    name: 'Star',
    category: 'shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  },
  {
    id: 'heart',
    name: 'Heart',
    category: 'shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  },
  {
    id: 'circle',
    name: 'Circle',
    category: 'shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`,
  },
  {
    id: 'square',
    name: 'Square',
    category: 'shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>`,
  },
  {
    id: 'triangle',
    name: 'Triangle',
    category: 'shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>`,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    category: 'shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 12l8 10 8-10-8-10z"/></svg>`,
  },
  {
    id: 'lightning',
    name: 'Lightning',
    category: 'symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/></svg>`,
  },
  {
    id: 'fire',
    name: 'Fire',
    category: 'symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`,
  },
  {
    id: 'crown',
    name: 'Crown',
    category: 'symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`,
  },
  {
    id: 'music',
    name: 'Music Note',
    category: 'symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
  },
  {
    id: 'camera',
    name: 'Camera',
    category: 'objects',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1zM21.54 9c-.93 0-1.81-.16-2.64-.45l-3.48 6.04c.27.41.45.87.45 1.41 0 1.66-1.34 3-3 3-1.21 0-2.25-.72-2.73-1.75l-4.04 7c-.27.48-.09 1.09.39 1.36.48.27 1.09.09 1.36-.39l1-1.73 1.73 1c.48.28 1.09.09 1.37-.37.27-.48.09-1.09-.39-1.36l-1.73-1 1.73-1c.48-.27.66-.88.39-1.37-.28-.47-.89-.66-1.37-.39l-1.73 1-1-1.73c-.27-.48-.88-.66-1.36-.39-.48.27-.66.89-.39 1.36l1 1.73-4.04 7c-.27.48-.09 1.09.39 1.36.48.27 1.09.09 1.36-.39l6.12-10.61c.85.58 1.87.93 2.96.93 2.21 0 4-1.79 4-4 0-1.45-.77-2.73-1.93-3.45l1.9-3.29c.59.23 1.23.38 1.9.38 2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .67.15 1.31.38 1.9l-3.29 1.9C11.73 6.77 10.45 6 9 6c-2.21 0-4 1.79-4 4 0 1.09.35 2.11.93 2.96L3.9 16.6c-.93-.53-2.07-.53-3 0-.48.28-.66.88-.39 1.37.28.47.89.66 1.37.39l1.73-1 1 1.73c.28.48.89.66 1.37.39.48-.28.66-.89.39-1.37l-1-1.73 1.73-1c.48-.28.66-.89.39-1.37-.28-.47-.89-.66-1.37-.39l-1.73 1-1.9-3.28C3.17 10.04 3 9.53 3 9c0-.67.15-1.31.38-1.9l3.29 1.9c.72-1.16 2-1.93 3.45-1.93 2.21 0 4 1.79 4 4 0 1.45-.77 2.73-1.93 3.45l1.9 3.29c.59-.23 1.23-.38 1.9-.38z"/></svg>`,
  },
];

export const getClipartByCategory = (category: string): ClipartItem[] => {
  return clipartLibrary.filter((item) => item.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(clipartLibrary.map((item) => item.category))];
};
