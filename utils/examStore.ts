// utils/examStore.ts

let currentExamHTML: string = '';
let isLandscapeMode: boolean = false;
let themeColor: string = '#1e3a8a';

export const setExamStore = (html: string, landscape: boolean = false, color: string = '#1e3a8a') => {
  currentExamHTML = html;
  isLandscapeMode = landscape;
  themeColor = color;
};

export const getExamStore = () => {
  return {
    html: currentExamHTML,
    isLandscape: isLandscapeMode,
    color: themeColor,
  };
};