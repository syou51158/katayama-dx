import React from 'react';

interface IssueTrackerProps {
  issues: string;
  issueStatus: 'none' | 'pending' | 'resolved';
  onIssuesChange: (value: string) => void;
  onIssueStatusChange: (value: 'none' | 'pending' | 'resolved') => void;
}

const IssueTracker: React.FC<IssueTrackerProps> = ({
  issues,
  issueStatus,
  onIssuesChange,
  onIssueStatusChange
}) => {
  // ステータスに基づくボタンスタイルを定義
  const getStatusStyle = (status: 'none' | 'pending' | 'resolved') => {
    switch (status) {
      case 'none':
        return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  // ステータスに基づくアイコンを定義
  const getStatusIcon = (status: 'none' | 'pending' | 'resolved') => {
    switch (status) {
      case 'none':
        return null;
      case 'pending':
        return (
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
          </svg>
        );
      case 'resolved':
        return (
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: 'none' | 'pending' | 'resolved') => {
    switch (status) {
      case 'none':
        return '問題なし';
      case 'pending':
        return '対応中';
      case 'resolved':
        return '解決済み';
      default:
        return '問題なし';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">課題・問題点</h3>
        
        <div className="flex space-x-2">
          {(['none', 'pending', 'resolved'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => onIssueStatusChange(status)}
              className={`inline-flex items-center px-3 py-2 border rounded-md ${
                issueStatus === status
                  ? getStatusStyle(status)
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* 選択されたステータスに応じたヒント表示 */}
      {issueStatus !== 'none' && (
        <div className={`p-3 rounded-md mb-3 ${
          issueStatus === 'pending' 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {issueStatus === 'pending' ? (
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                issueStatus === 'pending' ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {issueStatus === 'pending' ? '対応中の課題' : '解決済みの課題'}
              </h3>
              <div className={`mt-2 text-sm ${
                issueStatus === 'pending' ? 'text-yellow-700' : 'text-green-700'
              }`}>
                <p>
                  {issueStatus === 'pending' 
                    ? '課題内容と現在の対応状況を記録してください。今後の対策も記載するとよいでしょう。' 
                    : '課題内容とどのように解決したかを記録してください。今後の参考になります。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <textarea
        value={issues}
        onChange={(e) => onIssuesChange(e.target.value)}
        placeholder={
          issueStatus === 'none' 
            ? '特に問題なし、または課題がある場合は内容を記入してください'
            : issueStatus === 'pending'
              ? '課題の内容と現在の対応状況を記入してください'
              : '課題の内容と解決方法を記入してください'
        }
        className="w-full p-3 border border-gray-300 rounded-md h-32"
      />

      {/* 課題が入力されているが、ステータスが「問題なし」の場合の警告 */}
      {issues.trim() !== '' && issueStatus === 'none' && (
        <div className="mt-2 text-sm text-orange-600">
          課題が入力されていますが、ステータスが「問題なし」になっています。適切なステータスを選択してください。
        </div>
      )}
    </div>
  );
};

export default IssueTracker; 