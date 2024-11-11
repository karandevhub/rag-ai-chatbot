'use client';

import { useState, useEffect } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { Trash2 } from 'lucide-react';

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



    const getFileIcon = (fileType: string): string => {
       
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

    console.log(files)
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                    <FilePond
                        allowMultiple={false}
                        credits={false}
                        server={{
                            process: {
                                url: "/api/upload",
                                onload: (response: any) => {
                                    fetchFiles();

                                    return response.key || 'uploaded';
                                },
                                onerror: async (response: any) => {
                                    const data = await JSON.parse(response)
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

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>

                    {loading && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {!loading && !error && files.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            No documents uploaded yet
                        </div>
                    )}

                    <div className="space-y-2">
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
                            >
                                
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                                 
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                    </div>
                                </div>

                                {deletingFile === file.name ? (
                                    <div className="p-2 rounded-full transition-colors">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                                        title="Delete file"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600" />
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