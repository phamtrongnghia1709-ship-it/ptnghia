// Header thanh tiêu đề hệ thống quản lý Công an xã Bát Tràng
import React, { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  UserCheck, 
  Cloud, 
  Download, 
  Settings, 
  Menu,
  Clock,
  RefreshCw,
  User,
  Users,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { UserRole, CauHinhHeThong, TaiKhoan } from '../../types';

interface HeaderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  config: CauHinhHeThong;
  currentUser: TaiKhoan | null;
  onOpenSyncModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAccountModal: () => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
  onExportExcel: () => void;
  onToggleSidebar: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  onYearChange,
  currentRole,
  onRoleChange,
  config,
  currentUser,
  onOpenSyncModal,
  onOpenSettingsModal,
  onOpenAccountModal,
  onOpenProfileModal,
  onLogout,
  onExportExcel,
  onToggleSidebar,
  isSyncing,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const years = [2024, 2025, 2026, 2027, 2028];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { title: 'Chỉ huy (Toàn quyền)', color: 'text-red-400 bg-red-950/80 border-red-800' };
      case 'tham_muu':
        return { title: 'Tham mưu tổng hợp', color: 'text-amber-400 bg-amber-950/80 border-amber-800' };
      case 'viewer':
        return { title: 'Cán bộ chiến sĩ', color: 'text-blue-400 bg-blue-950/80 border-blue-800' };
    }
  };

  const roleInfo = getRoleLabel(currentRole);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Thanh dải đơn vị cấp trên */}
      <div className="bg-slate-950 px-4 py-1 text-[11px] text-slate-400 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 tracking-wider">★ {config.tenDonViCapTren}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-bold">{config.tenDonVi}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Hệ thống quản lý thâm niên & ngày phép CAND
          </span>
          {config.lastSyncTime && (
            <span className="text-slate-500">
              Đồng bộ lần cuối: {new Date(config.lastSyncTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Main Header bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center text-amber-300 shadow-inner border border-red-600 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>QUẢN LÝ NGÀY NGHỈ PHÉP CBCS</span>
                <span className="hidden lg:inline text-xs font-normal text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  CÔNG AN XÃ BÁT TRÀNG
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Theo dõi thâm niên công tác và tính toán ngày phép theo Luật CAND
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Chọn năm thống kê */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
            <span className="text-xs text-slate-400 mr-1.5 hidden sm:inline">Năm:</span>
            <select
              value={currentYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              aria-label="Chọn năm thống kê"
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-800 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Phân quyền / Chuyển nhanh vai trò (Demo Switch) */}
          <div className="hidden lg:flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              aria-label="Chuyển vai trò thử nghiệm"
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-slate-800 text-white">Vai trò: Chỉ huy CAX</option>
              <option value="tham_muu" className="bg-slate-800 text-white">Vai trò: Tham mưu</option>
              <option value="viewer" className="bg-slate-800 text-white">Vai trò: CBCS</option>
            </select>
          </div>

          {/* Nút Kết nối Google Sheets */}
          <button
            onClick={onOpenSyncModal}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition shadow-sm ${
              config.gasWebAppUrl
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Đồng bộ dữ liệu với Google Sheets qua Google Apps Script"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden md:inline">Google Sheets</span>
          </button>

          {/* Nút Xuất Excel */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 transition shadow-sm"
            title="Xuất cơ sở dữ liệu ra tệp Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Xuất Excel</span>
          </button>

          {/* Quản lý tài khoản (Nếu là Admin) */}
          {currentRole === 'admin' && (
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-900/80 border border-indigo-700 text-indigo-200 hover:bg-indigo-800 hover:text-white transition shadow-sm"
              title="Quản lý danh sách tài khoản & phân quyền"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Tài khoản</span>
            </button>
          )}

          {/* Cài đặt tham số */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Cài đặt hệ thống & tham số tính phép"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile User Dropdown Button */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-[11px] text-white">
                  {currentUser.hoTen.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[120px]">
                    {currentUser.hoTen}
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium leading-none">
                    {currentUser.vaiTro === 'admin' ? 'Chỉ huy' : currentUser.vaiTro === 'tham_muu' ? 'Tham mưu' : 'CBCS'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 z-50 overflow-hidden py-1 text-xs">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{currentUser.capBac || ''} {currentUser.hoTen}</div>
                      <div className="text-slate-500 font-mono text-[10px]">@{currentUser.tenDangNhap}</div>
                      <div className="text-[10px] font-semibold text-blue-700 mt-1">
                        {currentUser.toCongTac || 'Công an xã Bát Tràng'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-700"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Thông tin hồ sơ & Đổi mật khẩu</span>
                    </button>

                    {currentRole === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAccountModal();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-700"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Quản lý tài khoản toàn đơn vị</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất khỏi hệ thống</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
