import { useState, useEffect } from 'react';
import { customersApi } from '../lib/constructionApi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// 顧客登録/編集モーダル
const CustomerFormModal = ({
  isOpen,
  onClose,
  customer,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
  onSave: (customer: any) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    address: '',
    contact_person: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // モーダルが開かれたときに既存データを設定
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        // 編集モードの場合、既存のデータをフォームに設定
        setFormData({
          name: customer.name || '',
          address: customer.address || '',
          contact_person: customer.contact_person || '',
          phone: customer.phone || '',
          email: customer.email || '',
          notes: customer.notes || ''
        });
      } else {
        // 新規モードの場合、フォームをリセット
        setFormData({
          name: '',
          address: '',
          contact_person: '',
          phone: '',
          email: '',
          notes: ''
        });
      }
    }
  }, [isOpen, customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          <h2 className="text-2xl font-bold mb-4">{customer ? '顧客情報の編集' : '新規顧客の登録'}</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客名 <span className="text-red-500">*</span>
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
                  住所
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
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

// メイン顧客管理コンポーネント
const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customersApi.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('顧客データの取得に失敗しました', err);
      setError('顧客データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddNew = () => {
    setCurrentCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (currentCustomer) {
        // 既存顧客の更新
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            address: formData.address,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCustomer.id);

        if (error) throw error;
      } else {
        // 新規顧客の作成
        const { error } = await supabase
          .from('customers')
          .insert([{
            name: formData.name,
            address: formData.address,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            notes: formData.notes
          }]);

        if (error) throw error;
      }
      await fetchCustomers();
    } catch (error: any) {
      console.error('顧客データの保存に失敗しました', error);
      throw new Error(`顧客データの保存に失敗しました: ${error.message}`);
    }
  };

  // 検索フィルタリング
  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (customer.contact_person && customer.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">顧客管理</h1>
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
        <div className="mb-6">
          <input
            type="text"
            placeholder="顧客名、住所、担当者名で検索..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            顧客データがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.address || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.contact_person || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.phone || customer.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900"
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

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={currentCustomer}
        onSave={handleSave}
      />
    </div>
  );
};

export default Customers; 