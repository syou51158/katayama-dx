import React from 'react';

interface ProgressVisualizerProps {
  currentProgress: number | string;
  previousProgress?: number | null;
  onProgressChange: (value: string) => void;
}

const ProgressVisualizer: React.FC<ProgressVisualizerProps> = ({
  currentProgress,
  previousProgress,
  onProgressChange
}) => {
  // 数値に変換
  const currentProgressNum = typeof currentProgress === 'number' 
    ? currentProgress 
    : currentProgress === '' ? 0 : parseFloat(currentProgress);
  
  const prevProgressNum = previousProgress === null || previousProgress === undefined
    ? null
    : typeof previousProgress === 'number'
      ? previousProgress 
      : previousProgress === '' ? 0 : parseFloat(previousProgress as string);
  
  // 進捗の差分を計算
  const progressDiff = prevProgressNum !== null
    ? (currentProgressNum - prevProgressNum).toFixed(1)
    : null;
  
  // 差分の符号に基づく色を取得
  const getDiffColorClass = () => {
    if (!progressDiff) return '';
    const diffNum = parseFloat(progressDiff);
    if (diffNum > 0) return 'text-green-600';
    if (diffNum < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 進捗状況に基づくカラーを取得
  const getProgressColorClass = (progress: number) => {
    if (progress >= 90) return 'bg-green-600';
    if (progress >= 60) return 'bg-blue-600';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 進捗状況に応じたラベルを取得
  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return '完了間近';
    if (progress >= 60) return '順調';
    if (progress >= 30) return '進行中';
    if (progress > 0) return '初期段階';
    return '未着手';
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">進捗状況</h3>
        
        {progressDiff !== null && (
          <div className={`text-sm font-medium ${getDiffColorClass()}`}>
            {parseFloat(progressDiff) > 0 ? '+' : ''}{progressDiff}% 
            <span className="text-gray-500 ml-1">前回比</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{getProgressLabel(currentProgressNum)}</span>
          <span className="text-sm font-semibold">{currentProgressNum.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-4 rounded-full ${getProgressColorClass(currentProgressNum)}`} 
            style={{ width: `${Math.max(0, Math.min(100, currentProgressNum))}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            進捗率 (%)
          </label>
          <input
            type="number"
            value={currentProgress}
            onChange={(e) => onProgressChange(e.target.value)}
            min="0"
            max="100"
            step="0.1"
            placeholder="例: 45.5"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center">
          <div className="flex-grow">
            <div className="grid grid-cols-5 gap-1">
              {[0, 25, 50, 75, 100].map((milestone) => (
                <button
                  key={milestone}
                  type="button"
                  onClick={() => onProgressChange(milestone.toString())}
                  className={`py-2 px-1 text-xs border rounded
                    ${currentProgressNum >= milestone ? getProgressColorClass(milestone) : 'bg-gray-100'}
                    ${currentProgressNum >= milestone ? 'text-white' : 'text-gray-700'}
                  `}
                >
                  {milestone}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 進捗状況に応じたヒント表示 */}
      {currentProgressNum >= 90 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">完了間近</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>工事はほぼ完了しています。最終確認や品質チェック、清掃などの仕上げ作業を行いましょう。</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentProgressNum === 100 && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882L9.5 10.692l-1.296-1.69a.75.75 0 00-1.192.91l1.296 1.69 1.5 1.96a.75.75 0 001.192-.91l-1.5-1.96 2.857-3.73z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">完了</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>工事が完了しました！顧客による最終確認と引き渡し準備を行いましょう。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressVisualizer; 