/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// PHẦN MỀM QUẢN LÝ NGÀY NGHỈ PHÉP CÁN BỘ, CHIẾN SĨ – CÔNG AN XÃ BÁT TRÀNG
import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { OfficerManagement } from './components/officers/OfficerManagement';
import { LeaveRequestsView } from './components/leave/LeaveRequestsView';
import { AnnualTrackingView } from './components/annual/AnnualTrackingView';
import { CalendarView } from './components/calendar/CalendarView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { GoogleSheetSyncModal } from './components/sync/GoogleSheetSyncModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { LeaveSlipConfigView } from './components/settings/LeaveSlipConfigView';
import { LeaveSlipModal } from './components/leave/LeaveSlipModal';
import { LoginView } from './components/auth/LoginView';
import { AccountManagementModal } from './components/auth/AccountManagementModal';
import { UserProfileModal } from './components/auth/UserProfileModal';

import { CanBo, PhieuNghiPhep, NhatKyHeThong, CauHinhHeThong, UserRole, TaiKhoan } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<TaiKhoan | null>(() => {
    const session = StorageService.getCurrentSession();
    return session ? session.user : null;
  });

  // Navigation & State
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const session = StorageService.getCurrentSession();
    return session ? session.user.vaiTro : 'admin';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Data states
  const [officers, setOfficers] = useState<CanBo[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<PhieuNghiPhep[]>([]);
  const [auditLogs, setAuditLogs] = useState<NhatKyHeThong[]>([]);
  const [config, setConfig] = useState<CauHinhHeThong>(StorageService.getConfig());

  // Modal states
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedLeaveSlip, setSelectedLeaveSlip] = useState<PhieuNghiPhep | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Khởi tạo và nạp dữ liệu ban đầu
  const reloadData = () => {
    setOfficers(StorageService.getOfficers());
    setLeaveRequests(StorageService.getLeaveRequests());
    setAuditLogs(StorageService.getAuditLogs());
    setConfig(StorageService.getConfig());

    const session = StorageService.getCurrentSession();
    if (session) {
      setCurrentUser(session.user);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = (account: TaiKhoan) => {
    setCurrentUser(account);
    setCurrentRole(account.vaiTro);
    reloadData();
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  // Xử lý lưu cán bộ (Thêm mới hoặc Cập nhật)
  const handleSaveOfficer = (officer: CanBo) => {
    const isExisting = officers.some((o) => o.id === officer.id);
    let updatedOfficers: CanBo[];

    if (isExisting) {
      updatedOfficers = officers.map((o) => (o.id === officer.id ? officer : o));
      StorageService.addAuditLog(
        'Cập nhật cán bộ',
        `Cập nhật thông tin đồng chí ${officer.capBac} ${officer.hoTen} (${officer.maCanBo})`,
        currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
        currentRole === 'admin' ? 'Chỉ huy đơn vị' : 'Tham mưu'
      );
    } else {
      updatedOfficers = [officer, ...officers];
      StorageService.addAuditLog(
        'Thêm mới cán bộ',
        `Thêm đồng chí ${officer.capBac} ${officer.hoTen} (${officer.maCanBo}) vào ${officer.toCongTac}`,
        currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
        currentRole === 'admin' ? 'Chỉ huy đơn vị' : 'Tham mưu'
      );
    }

    setOfficers(updatedOfficers);
    StorageService.saveOfficers(updatedOfficers);
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Xử lý chuyển công tác
  const handleTransferOfficer = (officerId: string, ngayChuyen: string, ghiChu: string) => {
    const target = officers.find((o) => o.id === officerId);
    if (!target) return;

    const updatedOfficers = officers.map((o) =>
      o.id === officerId
        ? {
            ...o,
            trangThaiCongTac: 'Chuyển công tác' as const,
            ngayChuyenCongTac: ngayChuyen,
            ghiChu: `${o.ghiChu ? `${o.ghiChu}. ` : ''}Chuyển công tác: ${ghiChu}`,
            updatedAt: new Date().toISOString(),
          }
        : o
    );

    setOfficers(updatedOfficers);
    StorageService.saveOfficers(updatedOfficers);

    StorageService.addAuditLog(
      'Chuyển công tác',
      `Đồng chí ${target.capBac} ${target.hoTen} chuyển công tác ngày ${ngayChuyen}: ${ghiChu}`,
      currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
      'Chỉ huy đơn vị'
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Xử lý lưu phiếu nghỉ phép (Lập mới hoặc Sửa)
  const handleSaveLeaveRequest = (request: PhieuNghiPhep) => {
    const isExisting = leaveRequests.some((r) => r.id === request.id);
    let updatedRequests: PhieuNghiPhep[];

    if (isExisting) {
      updatedRequests = leaveRequests.map((r) => (r.id === request.id ? request : r));
      StorageService.addAuditLog(
        'Cập nhật phiếu nghỉ',
        `Cập nhật phiếu ${request.id} của đồng chí ${request.hoTenCanBo} (${request.soNgayNghi} ngày)`,
        currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
        currentRole === 'admin' ? 'Chỉ huy đơn vị' : 'Tham mưu'
      );
    } else {
      updatedRequests = [request, ...leaveRequests];
      StorageService.addAuditLog(
        'Lập phiếu nghỉ phép',
        `Lập phiếu ${request.id} cho đồng chí ${request.hoTenCanBo} (${request.soNgayNghi} ngày ${request.loaiNghi})`,
        currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
        currentRole === 'admin' ? 'Chỉ huy đơn vị' : 'Tham mưu'
      );
    }

    setLeaveRequests(updatedRequests);
    StorageService.saveLeaveRequests(updatedRequests);
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Phê duyệt phiếu nghỉ phép
  const handleApproveLeave = (requestId: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = leaveRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            trangThai: 'Đã phê duyệt' as const,
            ngayPheDuyet: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    setLeaveRequests(updatedRequests);
    StorageService.saveLeaveRequests(updatedRequests);

    StorageService.addAuditLog(
      'Phê duyệt phiếu nghỉ',
      `Phê duyệt phiếu ${req.id} cho đồng chí ${req.hoTenCanBo} (${req.soNgayNghi} ngày ${req.loaiNghi})`,
      currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
      'Chỉ huy đơn vị'
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Từ chối phê duyệt phiếu
  const handleRejectLeave = (requestId: string, reason: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = leaveRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            trangThai: 'Không phê duyệt' as const,
            lyDoTuChoi: reason,
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    setLeaveRequests(updatedRequests);
    StorageService.saveLeaveRequests(updatedRequests);

    StorageService.addAuditLog(
      'Không phê duyệt phiếu',
      `Từ chối phiếu ${req.id} của đồng chí ${req.hoTenCanBo}. Lý do: ${reason}`,
      currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
      'Chỉ huy đơn vị'
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Hủy phiếu (Tự động hoàn lại ngày phép)
  const handleCancelLeave = (requestId: string, reason: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = leaveRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            trangThai: 'Đã hủy' as const,
            ghiChu: `${r.ghiChu ? `${r.ghiChu}. ` : ''}Đã hủy: ${reason}`,
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    setLeaveRequests(updatedRequests);
    StorageService.saveLeaveRequests(updatedRequests);

    StorageService.addAuditLog(
      'Hủy phiếu nghỉ phép',
      `Hủy phiếu ${req.id} của đồng chí ${req.hoTenCanBo}. Tự động hoàn lại ${req.soNgayNghi} ngày phép`,
      currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
      currentRole === 'admin' ? 'Chỉ huy đơn vị' : 'Tham mưu'
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Xóa phiếu
  const handleDeleteLeave = (requestId: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = leaveRequests.filter((r) => r.id !== requestId);
    setLeaveRequests(updatedRequests);
    StorageService.saveLeaveRequests(updatedRequests);

    StorageService.addAuditLog(
      'Xóa phiếu nghỉ',
      `Xóa phiếu ${req.id} khỏi hệ thống`,
      currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
      currentRole === 'admin' ? 'Chỉ huy đơn vị' : 'Tham mưu'
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Lưu cấu hình
  const handleSaveConfig = (newConfig: CauHinhHeThong) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
    StorageService.addAuditLog(
      'Cập nhật cấu hình',
      'Cập nhật tham số hệ thống và đơn vị',
      currentUser ? currentUser.hoTen : config.hoTenNguoiKy,
      'Chỉ huy đơn vị'
    );
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Khôi phục dữ liệu gốc
  const handleResetData = () => {
    StorageService.resetToDefault();
    reloadData();
    alert('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu của Công an xã Bát Tràng!');
  };

  // Xuất Excel nhanh từ Header
  const handleExportExcelQuick = () => {
    StorageService.exportToExcel(currentYear);
  };

  // Nếu người dùng chưa đăng nhập, hiển thị Màn hình Đăng nhập & Tạo tài khoản
  if (!currentUser) {
    return (
      <LoginView
        config={config}
        officers={officers}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const pendingCount = leaveRequests.filter((r) => r.trangThai === 'Chờ phê duyệt').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentYear={currentYear}
        onYearChange={setCurrentYear}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        config={config}
        currentUser={currentUser}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onExportExcel={handleExportExcelQuick}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSyncing={isSyncing}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentRole={currentRole}
          pendingRequestsCount={pendingCount}
          totalOfficersCount={officers.filter((o) => o.trangThaiCongTac === 'Đang công tác').length}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* 1. Dashboard Tab */}
            {currentTab === 'dashboard' && (
              <DashboardView
                currentYear={currentYear}
                officers={officers}
                leaveRequests={leaveRequests}
                currentRole={currentRole}
                config={config}
                onNavigateToTab={setCurrentTab}
                onOpenLeaveModal={(l) => {
                  if (l) setSelectedLeaveSlip(l);
                  else setCurrentTab('leave-requests');
                }}
                onApproveLeave={handleApproveLeave}
                onSaveLeaveRequest={handleSaveLeaveRequest}
                onOpenLeaveSlip={(l) => setSelectedLeaveSlip(l)}
              />
            )}

            {/* 2. Officers Tab */}
            {currentTab === 'officers' && (
              <OfficerManagement
                officers={officers}
                leaveRequests={leaveRequests}
                currentYear={currentYear}
                currentRole={currentRole}
                onSaveOfficer={handleSaveOfficer}
                onTransferOfficer={handleTransferOfficer}
              />
            )}

            {/* 3. Leave Requests Tab */}
            {currentTab === 'leave-requests' && (
              <LeaveRequestsView
                leaveRequests={leaveRequests}
                officers={officers}
                currentYear={currentYear}
                config={config}
                currentRole={currentRole}
                onSaveRequest={handleSaveLeaveRequest}
                onApproveRequest={handleApproveLeave}
                onRejectRequest={handleRejectLeave}
                onCancelRequest={handleCancelLeave}
                onDeleteRequest={handleDeleteLeave}
                onOpenSlipConfig={() => setCurrentTab('leave-slip-config')}
              />
            )}

            {/* Cấu hình Mẫu Giấy Nghỉ Phép Tab */}
            {currentTab === 'leave-slip-config' && (
              <LeaveSlipConfigView
                config={config}
                onSaveConfig={handleSaveConfig}
              />
            )}

            {/* 4. Annual Tracking Tab */}
            {currentTab === 'annual-tracking' && (
              <AnnualTrackingView
                currentYear={currentYear}
                officers={officers}
                leaveRequests={leaveRequests}
                config={config}
                onOpenOfficerDetail={() => setCurrentTab('officers')}
              />
            )}

            {/* 5. Calendar Tab */}
            {currentTab === 'calendar' && (
              <CalendarView
                leaveRequests={leaveRequests}
                currentYear={currentYear}
                config={config}
                onOpenLeaveDetail={(req) => setSelectedLeaveSlip(req)}
              />
            )}

            {/* 6. Reports Tab */}
            {currentTab === 'reports' && (
              <ReportsView
                officers={officers}
                leaveRequests={leaveRequests}
                currentYear={currentYear}
                config={config}
              />
            )}

            {/* 7. Google Sheets Sync Tab */}
            {currentTab === 'google-sync' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Cơ sở dữ liệu Google Sheets & Google Apps Script
                    </h2>
                    <p className="text-xs text-slate-500">
                      Kết nối hai chiều lưu trữ dữ liệu vào bảng tính Google Sheets của đơn vị
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Mở Bảng Điều Khiển Đồng Bộ →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="font-bold text-emerald-950 block mb-1">6 Trang tính chuẩn</span>
                    <p className="text-slate-600 text-[11px]">
                      CBCS, NGHI_PHEP, THEO_DOI_NAM, DANH_MUC, CAU_HINH, NHAT_KY_HE_THONG.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="font-bold text-blue-950 block mb-1">Không mất dữ liệu</span>
                    <p className="text-slate-600 text-[11px]">
                      Hỗ trợ cả LocalStorage ngoại tuyến và đồng bộ trực tuyến qua Google Apps Script Web App.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="font-bold text-purple-950 block mb-1">Sao lưu & Phục hồi</span>
                    <p className="text-slate-600 text-[11px]">
                      Dễ dàng xuất toàn bộ CSDL ra file Excel (.xlsx) đa bảng hoặc JSON.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Xem Hướng Dẫn Cài Đặt Google Apps Script và Kiểm Tra Kết Nối
                  </button>
                </div>
              </div>
            )}

            {/* 8. Audit Log Tab */}
            {currentTab === 'audit-log' && (
              <AuditLogView logs={auditLogs} currentRole={currentRole} />
            )}
          </div>
        </main>
      </div>

      {/* Sync Modal */}
      {isSyncModalOpen && (
        <GoogleSheetSyncModal
          config={config}
          onSaveConfig={handleSaveConfig}
          onClose={() => setIsSyncModalOpen(false)}
          onRefreshData={reloadData}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          config={config}
          onSaveConfig={handleSaveConfig}
          onResetData={handleResetData}
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenSlipConfig={() => setCurrentTab('leave-slip-config')}
        />
      )}

      {/* Account Management Modal (Quản lý tài khoản) */}
      {isAccountModalOpen && currentUser && (
        <AccountManagementModal
          currentUser={currentUser}
          officers={officers}
          onClose={() => setIsAccountModalOpen(false)}
          onAccountsUpdated={reloadData}
        />
      )}

      {/* User Profile & Password Modal */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          officer={officers.find(o => o.maCanBo === currentUser.maCanBo)}
          currentYear={currentYear}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Leave Slip Modal (In giấy nghỉ phép) */}
      {selectedLeaveSlip && (
        <LeaveSlipModal
          leave={selectedLeaveSlip}
          officer={officers.find((o) => o.maCanBo === selectedLeaveSlip.maCanBo)}
          config={config}
          onClose={() => setSelectedLeaveSlip(null)}
        />
      )}
    </div>
  );
}
