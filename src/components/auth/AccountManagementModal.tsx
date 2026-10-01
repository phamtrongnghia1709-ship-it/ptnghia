// Modal Quản lý Tài khoản Đăng nhập (Dành cho Quản trị viên / Chỉ huy CAX)
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  X, 
  Check, 
  Search, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { TaiKhoan, CanBo, UserRole, ToCongTac } from '../../types';
import { StorageService } from '../../services/storageService';

interface AccountManagementModalProps {
  currentUser: TaiKhoan;
  officers: CanBo[];
  onClose: () => void;
  onAccountsUpdated: () => void;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  currentUser,
  officers,
  onClose,
  onAccountsUpdated,
}) => {
  const [accounts, setAccounts] = useState<TaiKhoan[]>(StorageService.getAccounts());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [resettingAccId, setResettingAccId] = useState<string | null>(null);
  const [newPassInput, setNewPassInput] = useState('123456');

  // Form thêm tài khoản mới
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [newOfficerCode, setNewOfficerCode] = useState('');
  const [newUnit, setNewUnit] = useState<ToCongTac>('Tổ Tổng hợp');
  const [formError, setFormError] = useState('');

  const TO_CONG_TAC_OPTIONS: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  const filteredAccounts = accounts.filter(
    (a) =>
      a.tenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.maCanBo && a.maCanBo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleLock = (acc: TaiKhoan) => {
    if (acc.id === currentUser.id) {
      alert('Không thể tự khóa tài khoản của chính mình!');
      return;
    }
    const newStatus = !acc.kichHoat;
    StorageService.updateAccountStatus(acc.id, newStatus);
    const updated = StorageService.getAccounts();
    setAccounts(updated);
    onAccountsUpdated();
  };

  const handleResetPassword = (accId: string) => {
    if (!newPassInput.trim()) {
      alert('Vui lòng nhập mật khẩu mới!');
      return;
    }
    const res = StorageService.resetPassword(accId, newPassInput.trim());
    alert(res.message);
    setResettingAccId(null);
    setNewPassInput('123456');
    const updated = StorageService.getAccounts();
    setAccounts(updated);
    onAccountsUpdated();
  };

  const handleDeleteAccount = (acc: TaiKhoan) => {
    if (acc.tenDangNhap.toLowerCase() === 'quantricaxbattrang') {
      alert('Không thể xóa tài khoản Quản trị viên hệ thống quantricaxbattrang!');
      return;
    }
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${acc.tenDangNhap}" của đồng chí ${acc.hoTen}?`);
    if (confirmDelete) {
      const res = StorageService.deleteAccount(acc.id);
      alert(res.message);
      setAccounts(StorageService.getAccounts());
      onAccountsUpdated();
    }
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUsername.trim()) {
      setFormError('Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (!newFullName.trim()) {
      setFormError('Vui lòng nhập họ và tên cán bộ!');
      return;
    }

    const off = officers.find(o => o.maCanBo === newOfficerCode);

    const res = StorageService.registerAccount({
      tenDangNhap: newUsername.trim().toLowerCase(),
      matKhau: newPassword,
      hoTen: newFullName.trim(),
      vaiTro: newRole,
      maCanBo: newOfficerCode || undefined,
      capBac: off?.capBac,
      chucVu: off?.chucVu,
      toCongTac: off?.toCongTac || newUnit,
      kichHoat: true,
    });

    if (res.success) {
      setIsAddingAccount(false);
      setNewUsername('');
      setNewFullName('');
      setNewOfficerCode('');
      setAccounts(StorageService.getAccounts());
      onAccountsUpdated();
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Quản lý Tài khoản Đăng nhập Hệ thống</h3>
              <p className="text-[11px] text-slate-400">
                Phân quyền truy cập, đặt lại mật khẩu và quản lý danh sách cán bộ đăng nhập
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Controls: Search & Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tài khoản, họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              onClick={() => setIsAddingAccount(!isAddingAccount)}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl font-bold transition shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAddingAccount ? 'Đóng form thêm' : 'Tạo tài khoản mới'}</span>
            </button>
          </div>

          {/* Form thêm tài khoản mới */}
          {isAddingAccount && (
            <form onSubmit={handleAddAccountSubmit} className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-blue-700" />
                <span>Tạo tài khoản cán bộ mới</span>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chọn cán bộ liên kết:
                  </label>
                  <select
                    value={newOfficerCode}
                    onChange={(e) => {
                      setNewOfficerCode(e.target.value);
                      const off = officers.find(o => o.maCanBo === e.target.value);
                      if (off) {
                        setNewFullName(off.hoTen);
                        setNewUsername(off.maCanBo.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="">-- Cán bộ trong đơn vị --</option>
                    {officers.map(o => (
                      <option key={o.id} value={o.maCanBo}>
                        {o.maCanBo} - {o.hoTen}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên đăng nhập <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: nam.lh, caxbt03"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên cán bộ <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lê Hoàng Nam"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mật khẩu khởi tạo:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phân quyền vai trò:
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="viewer">Cán bộ chiến sĩ (Xem & Lập phiếu)</option>
                    <option value="tham_muu">Cán bộ tham mưu (Quản lý & Báo cáo)</option>
                    <option value="admin">Chỉ huy Công an xã (Toàn quyền)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition"
                  >
                    Lưu tài khoản
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Bảng danh sách tài khoản */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="py-2.5 px-3">Tên đăng nhập</th>
                  <th className="py-2.5 px-3">Cán bộ chiến sĩ</th>
                  <th className="py-2.5 px-3">Tổ công tác</th>
                  <th className="py-2.5 px-3 text-center">Vai trò</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => {
                  const isCurrent = acc.id === currentUser.id;
                  const isResetting = resettingAccId === acc.id;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                        {acc.tenDangNhap}
                        {isCurrent && (
                          <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-normal font-sans">
                            Bạn
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div>{acc.hoTen}</div>
                        {acc.capBac && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            {acc.capBac} • {acc.chucVu || ''}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {acc.toCongTac || 'Công an xã Bát Tràng'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.vaiTro === 'admin'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : acc.vaiTro === 'tham_muu'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {acc.vaiTro === 'admin' ? 'Chỉ huy' : acc.vaiTro === 'tham_muu' ? 'Tham mưu' : 'CBCS'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.kichHoat
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {acc.kichHoat ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isResetting ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              placeholder="Mật khẩu mới"
                              value={newPassInput}
                              onChange={(e) => setNewPassInput(e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded text-[11px] w-24 font-mono"
                            />
                            <button
                              onClick={() => handleResetPassword(acc.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Lưu mật khẩu mới"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setResettingAccId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Đặt lại mật khẩu */}
                            <button
                              onClick={() => {
                                setResettingAccId(acc.id);
                                setNewPassInput('123456');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                              title="Đặt lại mật khẩu"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Khóa / Mở khóa */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleToggleLock(acc)}
                                className={`p-1.5 rounded-lg ${
                                  acc.kichHoat
                                    ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={acc.kichHoat ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              >
                                {acc.kichHoat ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Xóa tài khoản */}
                            {!isCurrent && acc.tenDangNhap.toLowerCase() !== 'quantricaxbattrang' && (
                              <button
                                onClick={() => handleDeleteAccount(acc)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Xóa tài khoản này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
