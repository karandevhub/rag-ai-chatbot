import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export  const getFileIcon = (fileType: string): string => {
       
  switch (fileType) {
      case 'application/pdf':
          return '📝';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return '📃';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return '📊';
      default:
          return '📎';
  }
};