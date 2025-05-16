import { useState } from 'react';
import type { PhotoCategory } from '../types/constructionTypes';

// 写真情報の型
interface PhotoData {
  file?: File;
  url?: string;
  caption: string;
  category: PhotoCategory;
}

// コンポーネントのProps
interface EnhancedPhotoUploadProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
}

// カテゴリオプション
const CATEGORY_OPTIONS: { value: PhotoCategory; label: string; icon: string }[] = [
  { value: 'before', label: '作業前', icon: '🏗️' },
  { value: 'after', label: '作業後', icon: '✅' },
  { value: 'progress', label: '進捗', icon: '📈' },
  { value: 'issue', label: '問題', icon: '⚠️' },
  { value: 'safety', label: '安全確認', icon: '🛡️' },
  { value: 'material', label: '資材', icon: '📦' },
  { value: 'equipment', label: '機材', icon: '🔧' },
  { value: 'other', label: 'その他', icon: '📷' },
];

const EnhancedPhotoUpload: React.FC<EnhancedPhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 10
}) => {
  const [dragOver, setDragOver] = useState(false);

  // 写真追加ハンドラ
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // 最大枚数チェック
    if (photos.length >= maxPhotos) {
      alert(`写真は最大${maxPhotos}枚までアップロードできます。`);
      return;
    }

    const newFiles = Array.from(e.target.files);
    const newPhotos = newFiles.map(file => ({
      file,
      caption: '',
      category: 'other' as PhotoCategory
    }));

    onPhotosChange([...photos, ...newPhotos]);
    
    // input要素をリセット
    e.target.value = '';
  };

  // ドラッグ&ドロップハンドラ
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    // 最大枚数チェック
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(`写真は最大${maxPhotos}枚までアップロードできます。`);
      return;
    }

    const newFiles = Array.from(e.dataTransfer.files).slice(0, remainingSlots);
    const newPhotos = newFiles.map(file => ({
      file,
      caption: '',
      category: 'other' as PhotoCategory
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  // 写真の削除
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    onPhotosChange(updatedPhotos);
  };

  // キャプション変更ハンドラ
  const handleCaptionChange = (index: number, caption: string) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = {
      ...updatedPhotos[index],
      caption
    };
    onPhotosChange(updatedPhotos);
  };

  // カテゴリ変更ハンドラ
  const handleCategoryChange = (index: number, category: PhotoCategory) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = {
      ...updatedPhotos[index],
      category
    };
    onPhotosChange(updatedPhotos);
  };

  // 写真のURLを取得（ファイルかURLどちらか）
  const getPhotoUrl = (photo: PhotoData): string => {
    if (photo.url) return photo.url;
    if (photo.file) return URL.createObjectURL(photo.file);
    return '';
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">現場写真</h3>
      
      {/* ドラッグ&ドロップエリア */}
      <div
        className={`p-6 border-2 border-dashed rounded-lg text-center mb-4 ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-3">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            写真をドラッグ&ドロップするか、
            <span className="font-medium text-blue-600 hover:text-blue-500">
              クリックして選択
            </span>
            してください
          </p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF 最大 {maxPhotos} 枚</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleAddPhoto}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          ファイルを選択
        </label>
      </div>

      {/* 写真プレビュー */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={index} className="bg-white p-2 rounded-lg shadow">
              <div className="aspect-w-1 aspect-h-1 mb-2">
                <img
                  src={getPhotoUrl(photo)}
                  alt={`写真 ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              
              {/* 写真情報フォーム */}
              <div className="mt-2">
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    カテゴリ
                  </label>
                  <select
                    value={photo.category}
                    onChange={(e) => handleCategoryChange(index, e.target.value as PhotoCategory)}
                    className="w-full p-1.5 text-sm border border-gray-300 rounded"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    キャプション
                  </label>
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    placeholder="写真の説明"
                    className="w-full p-1.5 text-sm border border-gray-300 rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="w-full mt-1 text-xs text-red-600 hover:text-red-800"
                >
                  写真を削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedPhotoUpload; 