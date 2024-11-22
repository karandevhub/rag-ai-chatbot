'use client';

import { create } from 'zustand';

interface FileState {
  file: { name: string; type: string } | null;
  uploadError: string;
  isUploading: boolean;

  setFile: (file: { name: string; type: string } | null) => void;
  setUploadError: (error: string) => void;
  setIsUploading: (uploading: boolean) => void;
  clearFile: () => void;
}

const useFileStore = create<FileState>()((set) => ({
  file: null,
  uploadError: '',
  isUploading: false,

  setFile: (file) => set({ file }),
  setUploadError: (error) => set({ uploadError: error }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  clearFile: () => set({ file: null, uploadError: '', isUploading: false }),
}));

export default useFileStore;

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// // Define the file type
// interface FileState {
//   file: { name: string; type: string } | null;
//   uploadError: string;
//   isUploading: boolean;

//   // Actions
//   setFile: (file: { name: string; type: string } | null) => void;
//   setUploadError: (error: string) => void;
//   setIsUploading: (uploading: boolean) => void;
//   clearFile: () => void;
// }

// const useFileStore = create<FileState>()(
//   persist(
//     (set) => ({
//       file: null,
//       uploadError: '',
//       isUploading: false,

//       setFile: (file) => set({ file }),
//       setUploadError: (error) => set({ uploadError: error }),
//       setIsUploading: (uploading) => set({ isUploading: uploading }),
//       clearFile: () => set({ file: null, uploadError: '', isUploading: false }),
//     }),
//     {
//       name: 'file-storage', // unique name for localStorage key
//       partialize: (state) => ({
//         file: state.file, // only persist these specific fields
//       }),
//     }
//   )
// );

// export default useFileStore;
