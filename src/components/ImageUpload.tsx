/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { ImageAttachment, ImageType, Patient } from '../types';
import { cn } from '../lib/utils';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Loader2,
  Trash2,
  Download,
  ZoomIn
} from 'lucide-react';

interface ImageUploadProps {
  patient: Patient;
  user: any;
  darkMode: boolean;
  onUploadComplete?: () => void;
}

export function ImageUpload({ patient, user, darkMode, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<ImageType>('xray');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypes: { value: ImageType; label: string }[] = [
    { value: 'xray', label: 'X-Ray' },
    { value: 'intraoral', label: 'Intra-oral Photo' },
    { value: 'extraoral', label: 'Extra-oral Photo' },
    { value: 'document', label: 'Document' },
    { value: 'other', label: 'Other' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please upload an image or PDF file' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `patients/${patient.id}/${selectedType}/${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, storagePath);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const newImage: ImageAttachment = {
            id: timestamp.toString(),
            fileName: file.name,
            fileUrl: downloadURL,
            fileSize: file.size,
            mimeType: file.type,
            imageType: selectedType,
            uploadedBy: user.displayName || user.email || 'Unknown',
            uploadedAt: new Date().toISOString(),
            description: description || undefined,
          };

          // Update patient document
          const currentImages = patient.images || [];
          await updateDoc(doc(db, 'patients', patient.id), {
            images: [...currentImages, newImage],
            updatedAt: new Date().toISOString(),
          });

          setMessage({ type: 'success', text: 'Image uploaded successfully!' });
          setDescription('');
          setUploading(false);
          setUploadProgress(0);

          setTimeout(() => {
            setMessage({ type: '', text: '' });
          }, 3000);

          if (onUploadComplete) {
            onUploadComplete();
          }
        }
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
      setUploading(false);
    }
  };

  const handleDelete = async (image: ImageAttachment) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // Delete from Storage
      const fileRef = ref(storage, image.fileUrl);
      await deleteObject(fileRef);

      // Update patient document
      const updatedImages = (patient.images || []).filter(img => img.id !== image.id);
      await updateDoc(doc(db, 'patients', patient.id), {
        images: updatedImages,
        updatedAt: new Date().toISOString(),
      });

      setMessage({ type: 'success', text: 'Image deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: `Delete failed: ${error.message}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <h3 className={cn("text-lg font-bold mb-4", darkMode ? "text-white" : "text-slate-900")}>
          Upload New Image
        </h3>

        {message.text && (
          <div className={cn(
            "mb-4 p-4 rounded-xl text-sm font-semibold",
            message.type === 'error'
              ? darkMode
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-red-50 text-red-700 border border-red-200"
              : darkMode
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-green-50 text-green-700 border border-green-200"
          )}>
            {message.text}
          </div>
        )}

        {/* Image Type Selector */}
        <div className="mb-4">
          <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
            Image Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {imageTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold transition-all",
                  selectedType === type.value
                    ? "bg-blue-600 text-white shadow-lg"
                    : darkMode
                    ? "bg-white/10 text-slate-300 hover:bg-white/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Right upper molar, Treatment progress"
            className={cn(
              "w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none",
              darkMode
                ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            )}
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : darkMode
              ? "border-white/20 hover:border-white/40 hover:bg-white/5"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleChange}
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
              <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                Uploading... {Math.round(uploadProgress)}%
              </p>
              <div className={cn(
                "h-2 rounded-full overflow-hidden",
                darkMode ? "bg-white/10" : "bg-slate-200"
              )}>
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className={cn(
                "w-12 h-12 mx-auto mb-4",
                darkMode ? "text-slate-400" : "text-slate-500"
              )} />
              <p className={cn("text-lg font-semibold mb-2", darkMode ? "text-white" : "text-slate-900")}>
                Drag & drop your file here
              </p>
              <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                or click to browse (Max 10MB, images and PDFs only)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Images Gallery */}
      {patient.images && patient.images.length > 0 && (
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <h3 className={cn("text-lg font-bold mb-4", darkMode ? "text-white" : "text-slate-900")}>
            Uploaded Images ({patient.images.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patient.images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "rounded-xl border overflow-hidden group hover:shadow-lg transition-all",
                  darkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}
              >
                {/* Image Preview */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                  {image.mimeType.startsWith('image/') ? (
                    <img
                      src={image.fileUrl}
                      alt={image.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                    <a
                      href={image.fileUrl}
                      download={image.fileName}
                      className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </a>
                    <button
                      onClick={() => handleDelete(image)}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={cn("font-semibold text-sm truncate", darkMode ? "text-white" : "text-slate-900")}>
                      {image.fileName}
                    </p>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold uppercase flex-shrink-0",
                      darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                    )}>
                      {image.imageType}
                    </span>
                  </div>
                  {image.description && (
                    <p className={cn("text-sm mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
                      {image.description}
                    </p>
                  )}
                  <div className={cn("text-xs space-y-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                    <p>Size: {formatFileSize(image.fileSize)}</p>
                    <p>Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}</p>
                    <p>By: {image.uploadedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedImage.mimeType.startsWith('image/') ? (
              <img
                src={selectedImage.fileUrl}
                alt={selectedImage.fileName}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <iframe
                src={selectedImage.fileUrl}
                className="w-full h-[90vh] bg-white rounded-lg"
                title={selectedImage.fileName}
              />
            )}
            <div className="mt-4 text-center">
              <p className="text-white font-semibold mb-2">{selectedImage.fileName}</p>
              {selectedImage.description && (
                <p className="text-slate-300 text-sm">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
