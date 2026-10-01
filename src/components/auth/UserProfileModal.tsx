// Modal Hồ sơ Cán bộ và Đổi mật khẩu cá nhân
import React, { useState } from 'react';
import { User, Lock, KeyRound, Check, X, Shield, Phone, Building2, Award, Calendar } from 'lucide-react';
import { TaiKhoan, CanBo } from '../../types';
import { StorageService } from '../../services/storageService';
import { dinhDangNgayVN, tinhThamNien } from '../../utils/calculator';

interface UserProfileModalProps {
  currentUser: TaiKhoan;
  officer?: CanBo;
  currentYear: number;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  officer,
  currentYear,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    const res = StorageService.changePassword(currentUser.id, currentPassword, newPassword);
    if (res.success) {
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.message);
    }
  };

  const thamNien = officer?.ngayVaoCAND ? tinhThamNien(officer.ngayVaoCAND) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Hồ sơ Cán bộ & Tài khoản</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold px-6 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông tin cán bộ
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === 'password'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-4 text-xs text-slate-700">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {currentUser.hoTen.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {currentUser.capBac || ''} {currentUser.hoTen}
                </h4>
                <div className="text-[11px] text-slate-500">
                  Tài khoản: <span className="font-mono font-bold text-blue-900">{currentUser.tenDangNhap}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  Vai trò:{' '}
                  {currentUser.vaiTro === 'admin'
                    ? 'Chỉ huy Công an xã'
                    : currentUser.vaiTro === 'tham_muu'
                    ? 'Cán bộ tham mưu'
                    : 'Cán bộ chiến sĩ'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Mã cán bộ:</span>
                <span className="font-mono font-bold text-slate-800">{currentUser.maCanBo || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tổ công tác:</span>
                <span className="font-semibold text-slate-800">{currentUser.toCongTac || 'Công an xã Bát Tràng'}</span>
              </div>
              {officer && (
                <>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày vào CAND:</span>
                    <span className="font-mono font-bold text-slate-800">{dinhDangNgayVN(officer.ngayVaoCAND)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thâm niên công tác:</span>
                    <span className="font-bold text-indigo-700">{thamNien?.moTa || '—'}</span>
                  </div>
                </>
              )}
              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                <span className="font-mono text-slate-800">{currentUser.soDienThoai || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Trạng thái:</span>
                <span className="font-bold text-emerald-600">Đang hoạt động</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-xl transition"
              >
                Đăng xuất tài khoản
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Change password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-3.5 text-xs text-slate-700">
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Mật khẩu hiện tại <span className="text-red-500">*</span>:
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Mật khẩu mới (Tối thiểu 6 ký tự) <span className="text-red-500">*</span>:
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>:
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
