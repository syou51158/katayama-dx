import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
  reason: string | null;
  approved_by: string | null;
  created_at: string;
}

export default function Leave() {
  const { user } = useAuth();
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('annual');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 休暇申請一覧を取得
  useEffect(() => {
    if (!user) return;
    
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leave')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLeaveRequests(data || []);
      } catch (error) {
        console.error('休暇申請の取得に失敗:', error);
        setMessage({ text: 'データの取得に失敗しました', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, [user]);

  // 申請処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ text: 'ログインしてください', type: 'error' });
      return;
    }

    // バリデーション
    if (!startDate || !endDate) {
      setMessage({ text: '日付を入力してください', type: 'error' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setMessage({ text: '終了日は開始日以降に設定してください', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const { data, error } = await supabase
        .from('leave')
        .insert({
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
          leave_type: leaveType,
          reason: reason.trim() || null,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setLeaveRequests([data, ...leaveRequests]);
      setMessage({ text: '休暇申請を送信しました', type: 'success' });
      
      // フォームをリセット
      setStartDate('');
      setEndDate('');
      setLeaveType('annual');
      setReason('');
      
    } catch (error) {
      console.error('休暇申請の送信に失敗:', error);
      setMessage({ text: '申請の送信に失敗しました', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 休暇タイプの表示名
  const getLeaveTypeName = (type: string) => {
    switch (type) {
      case 'annual': return '年次有給休暇';
      case 'sick': return '病気休暇';
      case 'personal': return '私用休暇';
      case 'other': return 'その他';
      default: return type;
    }
  };

  // ステータスの表示
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">承認待ち</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">承認済</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">却下</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">休暇申請</h1>
      
      {message.text && (
        <div 
          className={`border-l-4 p-4 mb-6 ${
            message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
            'bg-red-100 border-red-500 text-red-700'
          }`} 
          role="alert"
        >
          <p>{message.text}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">新規申請</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                終了日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700 mb-1">
              休暇タイプ <span className="text-red-500">*</span>
            </label>
            <select
              id="leave-type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="annual">年次有給休暇</option>
              <option value="sick">病気休暇</option>
              <option value="personal">私用休暇</option>
              <option value="other">その他</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              理由
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="休暇の理由を入力してください"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md font-medium ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? '送信中...' : '申請する'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">申請履歴</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            休暇申請履歴がありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期間
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種類
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申請日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(leave.start_date)}
                      {leave.start_date !== leave.end_date && ` 〜 ${formatDate(leave.end_date)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLeaveTypeName(leave.leave_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(leave.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 