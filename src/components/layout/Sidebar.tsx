// Sidebar điều hướng chính cho Phần mềm Quản lý Nghỉ phép Công an xã Bát Tràng
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CalendarRange, 
  Calendar, 
  BarChart3, 
  Sheet, 
  History, 
  Sliders, 
  Star,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
  UserCheck,
  LogOut,
  Printer
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavItem = 
  | 'dashboard'
  | 'officers'
  | 'leave-requests'
  | 'leave-slip-config'
  | 'annual-tracking'
  | 'calendar'
  | 'reports'
  | 'google-sync'
  | 'audit-log';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  pendingRequestsCount: number;
  totalOfficersCount: number;
  onOpenAccountModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  currentRole,
  pendingRequestsCount,
  totalOfficersCount,
  onOpenAccountModal,
  onLogout,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavItem,
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Chỉ số, biểu đồ & cảnh báo quân số',
    },
    {
      id: 'officers' as NavItem,
      label: 'Danh sách CBCS',
      icon: Users,
      badge: `${totalOfficersCount} Đ/c`,
      desc: 'Quản lý cán bộ & tự động tính thâm niên',
    },
    {
      id: 'leave-requests' as NavItem,
      label: 'Quản lý phiếu nghỉ phép',
      icon: FileText,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} chờ` : null,
      badgeColor: 'bg-amber-500 text-slate-900',
      desc: 'Tạo phiếu, duyệt, hoàn phép & in đơn',
    },
    {
      id: 'leave-slip-config' as NavItem,
      label: 'Cấu hình giấy nghỉ phép',
      icon: Printer,
      badge: 'Mẫu in',
      badgeColor: 'bg-red-700 text-amber-300 font-bold',
      desc: 'Mẫu giấy, quốc hiệu, tiêu đề, chữ ký & in ấn',
    },
    {
      id: 'annual-tracking' as NavItem,
      label: 'Theo dõi phép theo năm',
      icon: CalendarRange,
      badge: null,
      desc: 'Bảng tổng hợp phép năm & tỷ lệ sử dụng',
    },
    {
      id: 'calendar' as NavItem,
      label: 'Quản lý lịch nghỉ phép',
      icon: Calendar,
      badge: null,
      desc: 'Lịch tháng, tuần & cảnh báo trùng lịch tổ',
    },
    {
      id: 'reports' as NavItem,
      label: 'Báo cáo – Thống kê',
      icon: BarChart3,
      badge: null,
      desc: 'Báo cáo đơn vị, xuất Excel & in văn bản',
    },
    {
      id: 'google-sync' as NavItem,
      label: 'CSDL Google Sheets',
      icon: Sheet,
      badge: 'GAS',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Kết nối 2 chiều Google Apps Script & Sheets',
    },
    {
      id: 'audit-log' as NavItem,
      label: 'Nhật ký hệ thống',
      icon: History,
      badge: null,
      desc: 'Lịch sử thao tác thêm, sửa, duyệt phiếu',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand banner */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                CÔNG AN NHÂN DÂN
              </div>
              <div className="text-sm font-bold text-white leading-tight">
                CÔNG AN XÃ BÁT TRÀNG
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nguyên tắc tính phép nhanh ở banner */}
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5" />
            Nguyên tắc tính ngày phép:
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <span className="text-white font-medium">15 ngày</span> cơ bản/năm + <span className="text-amber-300 font-medium">1 ngày</span> cho mỗi đủ <span className="text-white font-medium">05 năm</span> công tác CAND.
          </p>
        </div>

        {/* Menu items list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between group ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 transition ${
                    isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-400'
                  }`} />
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-medium leading-snug truncate">
                      {item.label}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quản lý tài khoản cho Chỉ huy */}
          {currentRole === 'admin' && onOpenAccountModal && (
            <button
              onClick={() => {
                onOpenAccountModal();
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between text-indigo-300 hover:bg-slate-800 hover:text-white group border border-indigo-900/40 bg-indigo-950/20"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserCheck className="w-5 h-5 shrink-0 text-indigo-400 group-hover:text-amber-400" />
                <div className="truncate">
                  <div className="text-xs sm:text-sm font-medium leading-snug">
                    Quản lý tài khoản
                  </div>
                  <div className="text-[10px] text-indigo-300/70">
                    Phân quyền & cấp tài khoản CBCS
                  </div>
                </div>
              </div>
            </button>
          )}
        </nav>

        {/* Bottom footer status & Logout button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-xs space-y-2">
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          )}

          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Trạng thái hệ thống:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sẵn sàng
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Phiên bản 1.0 • Công an xã Bát Tràng
          </div>
        </div>
      </aside>
    </>
  );
};
