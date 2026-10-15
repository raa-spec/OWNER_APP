'use client';

import React, { useRef, useState } from 'react';

export default function PhotoUploadSection({ photoUrl, setPhotoUrl, photoName, setPhotoName }) {
  const fileInputRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(photoUrl || '');
  const [currentFileName, setCurrentFileName] = useState(photoName || 'storefront_front_entrance.jpg');
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`Photo size is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 2 MB. Please select a smaller photo.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setCurrentFileName(file.name);
    setPhotoName?.(file.name);

    // Create local object URL for instant preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result);
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
      {/* Header matching prototype */}
      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-900">
          Center & Facade Photos
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload storefront, waiting lounge, or doctor cabin photo for customers.
        </p>
      </div>

      {/* Dashed Upload Card */}
      <div
        onClick={triggerUpload}
        className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-5 bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer flex flex-col sm:flex-row items-center gap-4"
      >
        {/* Thumbnail Preview */}
        <div className="w-24 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center relative shadow-xs">
          {previewSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewSrc}
              alt="Storefront Entrance"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-emerald-100 flex items-center justify-center text-2xl">
              🏥
            </div>
          )}
        </div>

        {/* Text and Uploaded Badge */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>📷</span>
              <span className="font-mono">{currentFileName}</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              Uploaded
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Click to choose a different photo (PNG, JPG up to 2MB)
          </p>
        </div>

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Error Message for files > 2 MB */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
