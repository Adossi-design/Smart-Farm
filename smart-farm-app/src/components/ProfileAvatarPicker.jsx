import React, { useId } from 'react';

const ProfileAvatarPicker = ({
  title,
  imageUrl,
  fallbackText = 'U',
  file,
  onFileChange,
  fileLabel = 'Choose image',
  hint,
  editable = true,
  compact = false,
}) => {
  const inputId = useId();
  const avatarSize = compact ? 'h-20 w-20 text-2xl' : 'h-24 w-24 text-3xl';

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {title && <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">{title}</p>}
      <div className="flex flex-col items-center text-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || 'Profile'}
            className={`${avatarSize} rounded-full object-cover border border-emerald-200 dark:border-slate-600 shadow-sm`}
          />
        ) : (
          <div className={`${avatarSize} rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm`}>
            {fallbackText}
          </div>
        )}

        {editable ? (
          <>
            <label htmlFor={inputId} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition dark:bg-slate-900 dark:text-emerald-300 dark:border-slate-600 dark:hover:bg-slate-700">
              <i className="fas fa-upload"></i>
              {fileLabel}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onFileChange?.(event.target.files?.[0] || null)}
            />
            {file ? (
              <div className="max-w-full rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 border border-emerald-100 truncate dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700">
                {file.name}
              </div>
            ) : (
              hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileAvatarPicker;