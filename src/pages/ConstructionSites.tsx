import { useState, useEffect } from 'react';
import { constructionSitesApi, customersApi } from '../lib/constructionApi';
import { useAuth } from '../contexts/AuthContext';
import type { ConstructionSite, ConstructionSiteStatus } from '../types/constructionTypes';

// 工事現場登録/編集モーダル
const SiteFormModal = ({
  isOpen,
  onClose,
  site,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  site?: ConstructionSite;
  onSave: (site: any) => Promise<void>;
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>({
    name: '',
    address: '',
    client_id: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: '',
    status: 'planning' as ConstructionSiteStatus,
    manager_id: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  // 顧客一覧の取得
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customers = await customersApi.getAllCustomers();
        setCustomers(customers);
      } catch (err) {
        console.error('顧客データの取得に失敗しました', err);
      }
    };

    fetchCustomers();
  }, []);

  // モーダルが開かれたときに既存データを設定
  useEffect(() => {
    if (isOpen) {
      if (site) {
        // 編集モードの場合、既存のデータをフォームに設定
        setFormData({
          name: site.name,
          address: site.address,
          client_id: site.client_id || '',
          start_date: site.start_date,
          expected_end_date: site.expected_end_date || '',
          status: site.status,
          manager_id: site.manager_id || '',
          description: site.description || ''
        });
      } else {
        // 新規モードの場合、フォームをリセット
        setFormData({
          name: '',
          address: '',
          client_id: '',
          start_date: new Date().toISOString().split('T')[0],
          expected_end_date: '',
          status: 'planning' as ConstructionSiteStatus,
          manager_id: user?.id || '',
          description: ''
        });
      }
    }
  }, [isOpen, site, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Record<string, any>) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error('保存中にエラーが発生しました', err);
      setError(err.message || '保存中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{site ? '工事現場情報の編集' : '新規工事現場の登録'}</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事現場名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">-- 選択してください --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1">
                  <a 
                    href="/#/customers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    新規顧客を登録する
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="planning">計画中</option>
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                  <option value="on_hold">保留中</option>
                  <option value="cancelled">中止</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予定終了日
                </label>
                <input
                  type="date"
                  name="expected_end_date"
                  value={formData.expected_end_date}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ステータスに対応するバッジコンポーネント
const StatusBadge = ({ status }: { status: ConstructionSiteStatus }) => {
  const statusConfig = {
    planning: { label: '計画中', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-800' },
    completed: { label: '完了', color: 'bg-green-100 text-green-800' },
    on_hold: { label: '保留中', color: 'bg-yellow-100 text-yellow-800' },
    cancelled: { label: '中止', color: 'bg-red-100 text-red-800' }
  };

  const config = statusConfig[status] || statusConfig.planning;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// メイン画面コンポーネント
const ConstructionSites = () => {
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<ConstructionSite | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await constructionSitesApi.getAllSites();
      setSites(data);
    } catch (err) {
      console.error('工事現場データの取得に失敗しました', err);
      setError('工事現場データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleAddNew = () => {
    setCurrentSite(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (site: ConstructionSite) => {
    setCurrentSite(site);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (currentSite) {
      // 既存現場の更新
      await constructionSitesApi.updateSite(currentSite.id, formData);
    } else {
      // 新規現場の作成
      await constructionSitesApi.createSite(formData);
    }
    await fetchSites();
  };

  // 検索とフィルタリング
  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (site.client_name && site.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">工事現場管理</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規登録
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="工事現場名、住所、顧客名で検索..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">すべてのステータス</option>
              <option value="planning">計画中</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
              <option value="on_hold">保留中</option>
              <option value="cancelled">中止</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            工事現場データがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    工事現場名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    開始日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    予定終了日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSites.map(site => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.client_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.start_date ? new Date(site.start_date).toLocaleDateString('ja-JP') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.expected_end_date ? new Date(site.expected_end_date).toLocaleDateString('ja-JP') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={site.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(site)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SiteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        site={currentSite}
        onSave={handleSave}
      />
    </div>
  );
};

export default ConstructionSites; 