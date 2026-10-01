// Màn hình Đăng nhập và Đăng ký Tài khoản - Công an xã Bát Tràng
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Star, 
  Award, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { CanBo, CauHinhHeThong, TaiKhoan, UserRole, ToCongTac } from '../../types';
import { StorageService } from '../../services/storageService';

interface LoginViewProps {
  config: CauHinhHeThong;
  officers: CanBo[];
  onLoginSuccess: (account: TaiKhoan) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  config,
  officers,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form States
  const [regSelectedOfficerId, setRegSelectedOfficerId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRank, setRegRank] = useState('Thượng úy');
  const [regRole, setRegRole] = useState<UserRole>('viewer');
  const [regUnit, setRegUnit] = useState<ToCongTac>('Tổ Tổng hợp');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const TO_CONG_TAC_OPTIONS: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim()) {
      setLoginError('Vui lòng nhập tên đăng nhập hoặc mã cán bộ!');
      return;
    }
    if (!loginPassword) {
      setLoginError('Vui lòng nhập mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = StorageService.authenticate(loginUsername, loginPassword);
      setIsSubmitting(false);

      if (res.success && res.session) {
        onLoginSuccess(res.session.user);
      } else {
        setLoginError(res.message);
      }
    }, 300);
  };

  // Quick Demo Login
  const handleQuickLogin = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = StorageService.authenticate(username, pass);
      setIsSubmitting(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session.user);
      } else {
        setLoginError(res.message);
      }
    }, 200);
  };

  // When officer is selected in registration dropdown
  const handleSelectOfficerForReg = (maCB: string) => {
    setRegSelectedOfficerId(maCB);
    if (!maCB) {
      return;
    }
    const off = officers.find(o => o.maCanBo === maCB);
    if (off) {
      setRegFullName(off.hoTen);
      setRegRank(off.capBac);
      setRegUnit(off.toCongTac);
      setRegPhone(off.soDienThoai || '');
      // Gợi ý tên đăng nhập dựa trên mã cán bộ hoặc họ tên
      const suggestedUser = off.maCanBo.toLowerCase().replace(/[^a-z0-9]/g, '');
      setRegUsername(suggestedUser);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regUsername.trim()) {
      setRegError('Vui lòng nhập tên đăng nhập!');
      return;
    }

    if (regUsername.trim().length < 3) {
      setRegError('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }

    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên cán bộ chiến sĩ!');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Mật khẩu bảo mật phải có ít nhất 6 ký tự!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    const res = StorageService.registerAccount({
      tenDangNhap: regUsername.trim().toLowerCase(),
      matKhau: regPassword,
      maCanBo: regSelectedOfficerId || undefined,
      hoTen: regFullName.trim(),
      vaiTro: regRole,
      capBac: regRank as any,
      toCongTac: regUnit as any,
      soDienThoai: regPhone.trim(),
      kichHoat: true,
    });

    if (res.success && res.account) {
      setRegSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng vào hệ thống...');
      setTimeout(() => {
        onLoginSuccess(res.account!);
      }, 1000);
    } else {
      setRegError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Container thẻ đăng nhập */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden relative">
        {/* Banner phù hiệu Công an nhân dân */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white p-6 text-center relative overflow-hidden">
          {/* Họa tiết trang trí */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-400/20 rounded-full blur-xl pointer-events-none"></div>

          {/* Quốc hiệu / Đơn vị */}
          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{config.tenDonViCapTren}</span>
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          </div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-900/80 border-2 border-amber-400 text-amber-300 shadow-lg my-1.5">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-white mt-1">
            {config.tenDonVi}
          </h2>
          <p className="text-xs text-amber-200 font-medium">
            HỆ THỐNG QUẢN LÝ NGÀY NGHỈ PHÉP CÁN BỘ, CHIẾN SĨ
          </p>
        </div>

        {/* Tab Switcher: Đăng nhập vs Đăng ký */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'login'
                ? 'border-blue-700 text-blue-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập hệ thống</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegError('');
              setRegSuccess('');
            }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'register'
                ? 'border-blue-700 text-blue-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo tài khoản cán bộ</span>
          </button>
        </div>

        {/* FORM ĐĂNG NHẬP */}
        {activeTab === 'login' && (
          <div className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên đăng nhập hoặc Mã CBCS:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="VD: admin, thammuu, cbcs hoặc CAX-BT01"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mật khẩu bảo mật:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Ghi nhớ phiên đăng nhập</span>
                </label>
                <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  Quên mật khẩu?
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang xác thực...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}</span>
              </button>
            </form>

            {/* Quick Demo Accounts Helper */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tài khoản quản trị đơn vị:</span>
                </span>
                <span className="text-[10px] text-blue-700 font-mono font-normal">Bấm 1-click để vào</span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('quantricaxbattrang', 'admin@123')}
                  className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-900 border-2 border-red-300 rounded-xl text-left transition shadow-sm flex items-center justify-between group"
                  title="Đăng nhập tài khoản Quản trị viên Công an xã Bát Tràng"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-700 text-amber-300 flex items-center justify-center font-bold">
                      <Star className="w-4 h-4 fill-amber-300" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                        <span>QUẢN TRỊ VIÊN ĐƠN VỊ</span>
                        <span className="text-[10px] bg-red-200/80 text-red-950 font-mono px-1.5 py-0.2 rounded">Chỉ huy</span>
                      </div>
                      <div className="font-mono text-red-700 text-[11px] font-bold">
                        quantricaxbattrang
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-bold shadow-xs group-hover:bg-red-700 group-hover:text-white transition">
                      Đăng nhập ngay →
                    </span>
                  </div>
                </button>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>Mật khẩu: <strong className="font-mono text-slate-800">admin@123</strong></span>
                <span className="text-slate-500">Toàn quyền cấu hình & quản lý 5 tổ</span>
              </div>
            </div>
          </div>
        )}

        {/* FORM ĐĂNG KÝ TÀI KHOẢN CÁN BỘ */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Liên kết hồ sơ cán bộ (Tùy chọn):
                </label>
                <select
                  value={regSelectedOfficerId}
                  onChange={(e) => handleSelectOfficerForReg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">-- Chọn cán bộ có sẵn trong đơn vị --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.maCanBo}>
                      {o.maCanBo} - {o.capBac} {o.hoTen} ({o.toCongTac})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Chọn cán bộ để tự động điền thông tin cấp bậc, tổ công tác
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên đăng nhập <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: nam.lh, huy.dq"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vai trò tài khoản:
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="viewer">Cán bộ chiến sĩ</option>
                    <option value="tham_muu">Cán bộ Tham mưu</option>
                    <option value="admin">Chỉ huy Công an xã</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên CBCS <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lê Hoàng Nam"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cấp bậc hàm:
                  </label>
                  <input
                    type="text"
                    value={regRank}
                    onChange={(e) => setRegRank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại liên hệ:
                  </label>
                  <input
                    type="text"
                    placeholder="0912..."
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổ công tác:
                </label>
                <select
                  value={regUnit}
                  onChange={(e) => setRegUnit(e.target.value as ToCongTac)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {TO_CONG_TAC_OPTIONS.map((to) => (
                    <option key={to} value={to}>
                      {to}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>TẠO TÀI KHOẢN NGAY</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Công an xã Bát Tràng • Bảo mật thông tin nội bộ
        </div>
      </div>
    </div>
  );
};
