'use client';

import { useState, useEffect } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { Trash2, FileIcon } from 'lucide-react';

import { getFileIcon } from '@/lib/utils';
import { ChatHeader } from '@/components/Header';

interface FileInfo {
    name: string;
    type: string;
    size: number;
    lastModified: string;
}

export default function Home() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/files');
            if (!response.ok) throw new Error('Failed to fetch files');
            const fileInfos: FileInfo[] = await response.json();
            setFiles(fileInfos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDelete = async (filename: string) => {
        try {
            setDeletingFile(filename);
            const response = await fetch('/api/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileName: filename }),
            });
            if (!response.ok) throw new Error('Failed to delete file');
            fetchFiles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete file');
        } finally {
            setDeletingFile(null);
        }
    };


    return (
        <main className="min-h-screen bg-gray-50/50">
            <ChatHeader />
            <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg font-medium mb-3 text-gray-800">Upload Document</h2>
                    <div className="max-w-full">
                        <FilePond
                            allowMultiple={false}
                            credits={false}
                            className="text-sm"
                            labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                            server={{
                                process: {
                                    url: "/api/upload",
                                    onload: (response: any) => {
                                        fetchFiles();
                                        return response.key || 'uploaded';
                                    },
                                    onerror: async (response: any) => {
                                        const data = await JSON.parse(response);
                                        setError('Failed to upload file');
                                        return data?.message || 'Upload failed';
                                    }
                                },
                                revert: null,
                                restore: null,
                                load: null,
                                fetch: null
                            }}
                            onwarning={(error) => setError(error.body)}
                            onerror={(error) => setError(error.body)}
                        />
                    </div>
                </div>

                {/* Documents List Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg font-medium mb-3 text-gray-800">Uploaded Documents</h2>

                    {loading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full size-6 border-2 border-gray-900 border-t-transparent"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && !error && files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border-2 border-dashed">
                            <FileIcon className="size-8 text-gray-400 mb-2" />
                            <p className="text-sm">No documents uploaded yet</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-lg border border-gray-100 transition-colors duration-150 group"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <span className="text-xl shrink-0">{getFileIcon(file.type)}</span>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>

                                    </div>
                                </div>

                                {deletingFile === file.name ? (
                                    <div className="p-1.5">
                                        <div className="animate-spin size-4 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete file"
                                    >
                                        <Trash2 className="size-4 text-red-500" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}