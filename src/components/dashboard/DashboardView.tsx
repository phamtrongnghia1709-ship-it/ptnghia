// Phân hệ Dashboard - Tổng quan tình hình & Chuyển dữ liệu ra Đơn đề nghị nghỉ phép hoàn chỉnh
// Công an xã Bát Tràng - Công an TP Hà Nội
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CalendarCheck, 
  CalendarClock, 
  CalendarX, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Filter, 
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Printer,
  FileCheck,
  FilePlus,
  Send,
  UserCheck,
  MapPin,
  HelpCircle,
  Sparkles,
  Search,
  Sliders
} from 'lucide-react';
import { CanBo, PhieuNghiPhep, ToCongTac, UserRole, CauHinhHeThong } from '../../types';
import { 
  tinhTongHopPhepNamCanBo, 
  dinhDangNgayVN, 
  timTrungLichTrongTo, 
  tinhSoNgayNghi,
  tinhThamNien
} from '../../utils/calculator';

interface DashboardViewProps {
  currentYear: number;
  officers: CanBo[];
  leaveRequests: PhieuNghiPhep[];
  currentRole: UserRole;
  config?: CauHinhHeThong;
  onNavigateToTab: (tab: any) => void;
  onOpenLeaveModal: (leave?: PhieuNghiPhep) => void;
  onApproveLeave: (leaveId: string) => void;
  onSaveLeaveRequest?: (request: PhieuNghiPhep) => void;
  onOpenLeaveSlip?: (leave: PhieuNghiPhep) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentYear,
  officers,
  leaveRequests,
  currentRole,
  config,
  onNavigateToTab,
  onOpenLeaveModal,
  onApproveLeave,
  onSaveLeaveRequest,
  onOpenLeaveSlip,
}) => {
  // Bộ lọc
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedTo, setSelectedTo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardTab, setDashboardTab] = useState<'extract_table' | 'quick_dispatch' | 'analytics'>('extract_table');

  // Form chuyển dữ liệu nhanh ra đơn đề nghị
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    officers.length > 0 ? officers[0].maCanBo : ''
  );
  const [quickStartDate, setQuickStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickEndDate, setQuickEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickDays, setQuickDays] = useState(1);
  const [quickLocation, setQuickLocation] = useState('');
  const [quickReason, setQuickReason] = useState('Giải quyết công việc gia đình');
  const [quickSuccessMsg, setQuickSuccessMsg] = useState('');

  const TO_CONG_TAC_LIST: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  // Lọc danh sách cán bộ theo tổ
  const filteredOfficers = useMemo(() => {
    return officers.filter((cb) => {
      if (selectedTo !== 'all' && cb.toCongTac !== selectedTo) return false;
      return true;
    });
  }, [officers, selectedTo]);

  // Lọc danh sách phiếu nghỉ theo năm, tháng, tổ, từ khóa tìm kiếm
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((p) => {
      const pYear = p.namNghi || new Date(p.ngayBatDau).getFullYear();
      if (pYear !== currentYear) return false;

      if (selectedTo !== 'all' && p.toCongTac !== selectedTo) return false;

      if (selectedMonth !== 'all') {
        const startMonth = new Date(p.ngayBatDau).getMonth() + 1;
        const endMonth = new Date(p.ngayKetThuc).getMonth() + 1;
        if (startMonth !== selectedMonth && endMonth !== selectedMonth) return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = p.hoTenCanBo.toLowerCase().includes(term);
        const matchCode = p.maCanBo.toLowerCase().includes(term);
        const matchReason = p.lyDoNghi.toLowerCase().includes(term);
        const matchLoc = (p.diaDiemNghi || '').toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchReason && !matchLoc) return false;
      }

      return true;
    });
  }, [leaveRequests, currentYear, selectedMonth, selectedTo, searchTerm]);

  // Cán bộ đang chọn cho bộ chuyển dữ liệu nhanh
  const activeQuickOfficer = useMemo(() => {
    return officers.find((o) => o.maCanBo === selectedOfficerId) || officers[0] || null;
  }, [officers, selectedOfficerId]);

  // Thống kê phép của cán bộ đang chọn
  const activeQuickSummary = useMemo(() => {
    if (!activeQuickOfficer) return null;
    return tinhTongHopPhepNamCanBo(activeQuickOfficer, currentYear, leaveRequests);
  }, [activeQuickOfficer, currentYear, leaveRequests]);

  // Khi đổi cán bộ, tự động điền quê quán làm địa điểm nghỉ nếu chưa có
  const handleSelectOfficer = (maCb: string) => {
    setSelectedOfficerId(maCb);
    const cb = officers.find((o) => o.maCanBo === maCb);
    if (cb && cb.queQuan) {
      setQuickLocation(cb.queQuan);
    }
  };

  // Cập nhật ngày bắt đầu / kết thúc
  const handleQuickStartDateChange = (val: string) => {
    setQuickStartDate(val);
    if (val > quickEndDate) {
      setQuickEndDate(val);
      setQuickDays(1);
    } else {
      const count = tinhSoNgayNghi(val, quickEndDate, 'lien_tuc');
      setQuickDays(Math.max(1, count));
    }
  };

  const handleQuickEndDateChange = (val: string) => {
    setQuickEndDate(val);
    if (val < quickStartDate) {
      setQuickStartDate(val);
      setQuickDays(1);
    } else {
      const count = tinhSoNgayNghi(quickStartDate, val, 'lien_tuc');
      setQuickDays(Math.max(1, count));
    }
  };

  // Thực hiện chuyển dữ liệu ra Đơn đề nghị hoàn chỉnh
  const handleDispatchLeaveSlip = (shouldPrintImmediately: boolean) => {
    if (!activeQuickOfficer) {
      alert('Vui lòng thêm hoặc chọn Cán bộ chiến sĩ trước!');
      return;
    }

    const nextNum = leaveRequests.length + 1;
    const newId = `PNP-${currentYear}-${String(nextNum).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);

    const newReq: PhieuNghiPhep = {
      id: newId,
      ngayLapPhieu: today,
      maCanBo: activeQuickOfficer.maCanBo,
      hoTenCanBo: activeQuickOfficer.hoTen,
      toCongTac: activeQuickOfficer.toCongTac,
      ngayBatDau: quickStartDate,
      ngayKetThuc: quickEndDate,
      soNgayNghi: quickDays,
      loaiNghi: 'Nghỉ phép năm',
      lyDoNghi: quickReason || 'Giải quyết công việc gia đình',
      diaDiemNghi: quickLocation || activeQuickOfficer.queQuan || 'Tại nơi cư trú',
      nguoiPheDuyet: config?.hoTenNguoiKy || 'Trung tá Phạm Trọng Nghĩa',
      chucVuNguoiDuyet: config?.nguoiKyBaoCao || 'Trưởng Công an xã',
      trangThai: currentRole === 'admin' ? 'Đã phê duyệt' : 'Chờ phê duyệt',
      namNghi: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSaveLeaveRequest) {
      onSaveLeaveRequest(newReq);
    }

    setQuickSuccessMsg(`Đã tạo thành công phiếu ${newReq.id} cho đồng chí ${newReq.hoTenCanBo}!`);
    setTimeout(() => setQuickSuccessMsg(''), 4000);

    if (shouldPrintImmediately) {
      if (onOpenLeaveSlip) {
        onOpenLeaveSlip(newReq);
      } else {
        onOpenLeaveModal(newReq);
      }
    }
  };

  // Tính toán các chỉ số thống kê
  const stats = useMemo(() => {
    let tongPhepDuocHuong = 0;
    let tongPhepDaNghi = 0;
    let soChuaNghi = 0;
    let soHetPhep = 0;
    let soConDuoi3Ngay = 0;
    let soVuotPhep = 0;

    const activeOfficers = filteredOfficers.filter((cb) => cb.trangThaiCongTac === 'Đang công tác');

    activeOfficers.forEach((cb) => {
      const summary = tinhTongHopPhepNamCanBo(cb, currentYear, leaveRequests);
      tongPhepDuocHuong += summary.tongPhepDuocHuong;
      tongPhepDaNghi += summary.phepDaNghi;

      if (summary.phepDaNghi === 0) soChuaNghi++;
      if (summary.phepConLai < 0) soVuotPhep++;
      else if (summary.phepConLai === 0) soHetPhep++;
      else if (summary.phepConLai <= 3) soConDuoi3Ngay++;
    });

    const tongPhepConLai = Math.max(0, tongPhepDuocHuong - tongPhepDaNghi);
    const tyLeNghi = tongPhepDuocHuong > 0 ? Math.round((tongPhepDaNghi / tongPhepDuocHuong) * 100) : 0;

    // Đang nghỉ hôm nay
    const today = new Date().toISOString().slice(0, 10);
    const dangNghiHomNay = leaveRequests.filter((p) => {
      return (
        p.trangThai === 'Đã phê duyệt' &&
        p.ngayBatDau <= today &&
        p.ngayKetThuc >= today
      );
    });

    // Phiếu chờ duyệt
    const choPheDuyet = leaveRequests.filter((p) => p.trangThai === 'Chờ phê duyệt');

    return {
      quanSo: activeOfficers.length,
      tongPhepDuocHuong,
      tongPhepDaNghi,
      tongPhepConLai,
      tyLeNghi,
      soChuaNghi,
      soHetPhep,
      soConDuoi3Ngay,
      soVuotPhep,
      dangNghiHomNayCount: dangNghiHomNay.length,
      choPheDuyetCount: choPheDuyet.length,
    };
  }, [filteredOfficers, leaveRequests, currentYear]);

  // Cảnh báo trùng lịch công tác trong tổ
  const conflicts = useMemo(() => {
    const list: { to: string; dates: string; officers: string[] }[] = [];
    const activeLeaves = leaveRequests.filter(
      (p) =>
        (p.namNghi || new Date(p.ngayBatDau).getFullYear()) === currentYear &&
        (p.trangThai === 'Đã phê duyệt' || p.trangThai === 'Chờ phê duyệt')
    );

    TO_CONG_TAC_LIST.forEach((to) => {
      const toLeaves = activeLeaves.filter((p) => p.toCongTac === to);
      for (let i = 0; i < toLeaves.length; i++) {
        for (let j = i + 1; j < toLeaves.length; j++) {
          const l1 = toLeaves[i];
          const l2 = toLeaves[j];
          if (l1.maCanBo !== l2.maCanBo) {
            if (l1.ngayBatDau <= l2.ngayKetThuc && l2.ngayBatDau <= l1.ngayKetThuc) {
              const dates = `${dinhDangNgayVN(l1.ngayBatDau)} - ${dinhDangNgayVN(l1.ngayKetThuc)}`;
              if (!list.some((c) => c.to === to && c.officers.includes(l1.hoTenCanBo) && c.officers.includes(l2.hoTenCanBo))) {
                list.push({
                  to,
                  dates,
                  officers: [l1.hoTenCanBo, l2.hoTenCanBo],
                });
              }
            }
          }
        }
      }
    });

    return list;
  }, [leaveRequests, currentYear]);

  // Thống kê theo tổ công tác
  const unitStats = useMemo(() => {
    return TO_CONG_TAC_LIST.map((to) => {
      const officersInTo = officers.filter(
        (cb) => cb.toCongTac === to && cb.trangThaiCongTac === 'Đang công tác'
      );
      let tongHuong = 0;
      let daNghi = 0;

      officersInTo.forEach((cb) => {
        const sum = tinhTongHopPhepNamCanBo(cb, currentYear, leaveRequests);
        tongHuong += sum.tongPhepDuocHuong;
        daNghi += sum.phepDaNghi;
      });

      const conLai = Math.max(0, tongHuong - daNghi);
      const tyLe = tongHuong > 0 ? Math.round((daNghi / tongHuong) * 100) : 0;

      return {
        to,
        quanSo: officersInTo.length,
        tongHuong,
        daNghi,
        conLai,
        tyLe,
      };
    });
  }, [officers, leaveRequests, currentYear]);

  return (
    <div className="space-y-6">
      {/* 1. Thanh tiêu đề và Bộ lọc toàn trang */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Năm công tác {currentYear}
            </span>
            <span className="text-slate-400">•</span>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Bảng Điều Khiển & Trích Xuất Đơn Nghỉ Phép Hoàn Chỉnh</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đồng bộ đầy đủ các trường thông tin nhân thân, thâm niên CAND, số ngày phép và xuất thẳng ra Đơn đề nghị hoàn chỉnh
          </p>
        </div>

        {/* Bộ lọc: Đơn vị / Tổ & Tháng */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc Tổ công tác / Khối Lãnh đạo */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedTo}
              onChange={(e) => setSelectedTo(e.target.value)}
              className="bg-transparent font-semibold outline-none cursor-pointer"
            >
              <option value="all">Toàn đơn vị (Tất cả tổ)</option>
              {TO_CONG_TAC_LIST.map((to) => (
                <option key={to} value={to}>{to}</option>
              ))}
            </select>
          </div>

          {/* Lọc tháng */}
          <div className="text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent font-semibold outline-none cursor-pointer"
            >
              <option value="all">Cả năm {currentYear}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* Nút Cấu hình mẫu giấy nghỉ phép */}
          <button
            onClick={() => onNavigateToTab('leave-slip-config')}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-xl transition"
            title="Tùy chỉnh mẫu in Đơn đề nghị theo chuẩn Công an xã Bát Tràng"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>Mẫu đơn in</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ chỉ số tổng quan phục vụ lập & xuất đơn */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Quân số */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Quân số đơn vị</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.quanSo}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            6 Đơn vị / Tổ công tác
          </div>
        </div>

        {/* Tổng quỹ ngày phép */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng quỹ phép {currentYear}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-950">{stats.tongPhepDuocHuong} <span className="text-xs font-normal text-slate-500">ngày</span></div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">
            15 ngày + Thâm niên CAND
          </div>
        </div>

        {/* Đã sử dụng */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đã nghỉ phép</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{stats.tongPhepDaNghi} <span className="text-xs font-normal text-slate-500">ngày</span></div>
          <div className="mt-1 text-[11px] text-slate-500">
            Tỷ lệ sử dụng: <strong className="text-slate-800">{stats.tyLeNghi}%</strong>
          </div>
        </div>

        {/* Còn lại */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Quỹ phép còn lại</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.tongPhepConLai} <span className="text-xs font-normal text-slate-500">ngày</span></div>
          <div className="mt-1 text-[11px] text-slate-500">
            {stats.soChuaNghi} đồng chí chưa nghỉ
          </div>
        </div>

        {/* Đang nghỉ / Chờ phê duyệt */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đang nghỉ hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{stats.dangNghiHomNayCount} <span className="text-xs font-normal text-slate-500">Đ/c</span></div>
          <div className="mt-1 text-[11px] text-amber-700 font-bold">
            {stats.choPheDuyetCount} phiếu chờ phê duyệt
          </div>
        </div>
      </div>

      {/* Cảnh báo trùng quân số trực chiến nếu có */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 flex-1">
            <div className="font-bold flex items-center gap-2">
              <span>Cảnh báo quân số trực chiến: Phát hiện {conflicts.length} trường hợp trùng lịch nghỉ trong cùng tổ!</span>
            </div>
            <p className="mt-0.5 text-amber-900">
              Để bảo đảm quân số thường trực chiến đấu tại Công an xã, vui lòng kiểm tra kỹ trước khi phê duyệt:
              {' '}{conflicts.map((c) => `${c.to} (${c.dates}: ${c.officers.join(', ')})`).join('; ')}.
            </p>
          </div>
        </div>
      )}

      {/* 3. KHỐI TRUNG TÂM: CÔNG CỤ & BẢNG CHUYỂN DỮ LIỆU RA ĐƠN ĐỀ NGHỊ NGHỈ PHÉP */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Thanh chuyển chế độ xem */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
                <span>TRÍCH XUẤT DỮ LIỆU & XUẤT ĐƠN NGHỈ PHÉP HOÀN CHỈNH</span>
                <span className="text-[10px] bg-red-800 text-amber-200 font-mono px-2 py-0.5 rounded border border-red-700">
                  Chuẩn PDF CAND
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Đầy đủ 12 trường thông tin: Nhân thân, Thâm niên, Chế độ phép ({currentYear}), Địa điểm & Lý do
              </p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex bg-slate-800 p-1 rounded-xl gap-1 text-xs font-bold">
            <button
              onClick={() => setDashboardTab('extract_table')}
              className={`py-1.5 px-3 rounded-lg transition flex items-center gap-1.5 ${
                dashboardTab === 'extract_table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Bảng xuất đơn ({filteredRequests.length})</span>
            </button>

            <button
              onClick={() => setDashboardTab('quick_dispatch')}
              className={`py-1.5 px-3 rounded-lg transition flex items-center gap-1.5 ${
                dashboardTab === 'quick_dispatch'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Lập & Chuyển ra đơn nhanh</span>
            </button>

            <button
              onClick={() => setDashboardTab('analytics')}
              className={`py-1.5 px-3 rounded-lg transition flex items-center gap-1.5 ${
                dashboardTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Thống kê các tổ</span>
            </button>
          </div>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG */}
        {quickSuccessMsg && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{quickSuccessMsg}</span>
          </div>
        )}

        {/* TAB 1: BẢNG TRÍCH XUẤT ĐẦY ĐỦ CÁC TRƯỜNG ĐƠN ĐỀ NGHỊ */}
        {dashboardTab === 'extract_table' && (
          <div>
            {/* Filter toolbar inside table */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên CBCS, mã số, quê quán, lý do..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Mỗi hàng tương ứng 1 hồ sơ Đơn nghỉ phép hoàn chỉnh. Bấm </span>
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold text-[10px]">
                  <Printer className="w-3 h-3" /> Xuất đơn
                </span>
                <span> để in trực tiếp.</span>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-3">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <p className="font-semibold text-slate-600 text-sm">Chưa có phiếu nghỉ phép nào phù hợp bộ lọc.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Đồng chí có thể chuyển sang tab <strong>"Lập & Chuyển ra đơn nhanh"</strong> bên trên để tạo đơn ngay.
                  </p>
                </div>
                <button
                  onClick={() => setDashboardTab('quick_dispatch')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Lập đơn đề nghị đầu tiên</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-3 px-3">Mã phiếu</th>
                      <th className="py-3 px-3">Cán bộ chiến sĩ</th>
                      <th className="py-3 px-3">Cấp bậc / Chức vụ</th>
                      <th className="py-3 px-3">Đơn vị / Tổ</th>
                      <th className="py-3 px-2 text-center">Tổng phép</th>
                      <th className="py-3 px-2 text-center">Đã nghỉ</th>
                      <th className="py-3 px-3">Thời gian đề nghị nghỉ</th>
                      <th className="py-3 px-3">Địa điểm & Lý do</th>
                      <th className="py-3 px-2 text-center">Trạng thái</th>
                      <th className="py-3 px-3 text-center">Xuất đơn hoàn chỉnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => {
                      const off = officers.find((o) => o.maCanBo === req.maCanBo);
                      const summary = off ? tinhTongHopPhepNamCanBo(off, currentYear, leaveRequests) : null;
                      const tongPhep = summary ? summary.tongPhepDuocHuong : 17;
                      const daNghi = summary ? summary.phepDaNghi : 0;
                      const daNghiStr = String(daNghi).padStart(2, '0');
                      const tongPhepStr = String(tongPhep).padStart(2, '0');

                      return (
                        <tr key={req.id} className="hover:bg-blue-50/40 transition">
                          {/* Mã phiếu */}
                          <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                            <div>{req.id}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {dinhDangNgayVN(req.ngayLapPhieu)}
                            </span>
                          </td>

                          {/* Họ tên, Giới tính, Ngày sinh, Quê quán */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 text-xs">
                              {req.hoTenCanBo}
                              <span className="ml-1 text-[10px] text-slate-500 font-normal">
                                ({off?.gioiTinh || 'Nam'})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Quê: {off?.queQuan || req.diaDiemNghi || 'Bát Tràng, Gia Lâm'}
                            </div>
                            {off?.ngaySinh && (
                              <div className="text-[10px] text-slate-400">
                                NS: {dinhDangNgayVN(off.ngaySinh)}
                              </div>
                            )}
                          </td>

                          {/* Cấp bậc hàm / Chức vụ */}
                          <td className="py-3 px-3 text-slate-800">
                            <div className="font-semibold text-xs">
                              {off?.capBac || 'Đại úy'}
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {off?.chucVu || 'Cán bộ'}
                            </span>
                          </td>

                          {/* Tổ công tác */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.toCongTac === 'Lãnh đạo Chỉ huy Công an xã'
                                ? 'bg-red-100 text-red-900 border border-red-200'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {req.toCongTac}
                            </span>
                          </td>

                          {/* Mục 1: Tổng số ngày phép năm 2026 */}
                          <td className="py-3 px-2 text-center font-bold text-indigo-950">
                            {tongPhep} ngày
                          </td>

                          {/* Mục 2: Đã nghỉ */}
                          <td className="py-3 px-2 text-center font-mono font-bold text-amber-700">
                            {daNghiStr}/{tongPhepStr}
                          </td>

                          {/* Mục 3: Đề nghị nghỉ ... ngày */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-blue-900 text-xs">
                              {String(req.soNgayNghi).padStart(2, '0')} ngày
                            </div>
                            <div className="text-[11px] text-slate-600 whitespace-nowrap">
                              {dinhDangNgayVN(req.ngayBatDau)} → {dinhDangNgayVN(req.ngayKetThuc)}
                            </div>
                          </td>

                          {/* Mục 4 & 5: Địa điểm & Lý do */}
                          <td className="py-3 px-3 max-w-[180px]">
                            <div className="font-medium text-slate-800 truncate" title={req.diaDiemNghi}>
                              {req.diaDiemNghi || 'Quê quán'}
                            </div>
                            <div className="text-[11px] text-slate-500 italic truncate" title={req.lyDoNghi}>
                              "{req.lyDoNghi}"
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.trangThai === 'Đã phê duyệt'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.trangThai === 'Chờ phê duyệt'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {req.trangThai}
                            </span>
                          </td>

                          {/* Thao tác: XUẤT ĐƠN HOÀN CHỈNH */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (onOpenLeaveSlip) onOpenLeaveSlip(req);
                                  else onOpenLeaveModal(req);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs shadow-xs transition"
                                title="Xem và in Đơn đề nghị nghỉ phép hoàn chỉnh theo chuẩn PDF"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-300" />
                                <span>Xuất đơn</span>
                              </button>

                              {currentRole !== 'viewer' && req.trangThai === 'Chờ phê duyệt' && (
                                <button
                                  onClick={() => onApproveLeave(req.id)}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                  title="Duyệt đơn ngay"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BỘ CÔNG CỤ LẬP & CHUYỂN DỮ LIỆU RA ĐƠN ĐỀ NGHỊ NHANH */}
        {dashboardTab === 'quick_dispatch' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950">
                <span className="font-bold block text-sm">Bộ chuyển dữ liệu trực tiếp ra Đơn đề nghị nghỉ phép hoàn chỉnh</span>
                <span>
                  Chọn đồng chí CBCS từ danh sách, hệ thống sẽ tự động điền toàn bộ nhân thân, ngày vào ngành, tính thâm niên,
                  số ngày phép năm {currentYear} và chuẩn bị sẵn tờ Đơn đề nghị đúng thể thức Công an nhân dân để xuất / in ngay.
                </span>
              </div>
            </div>

            {officers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 text-sm">Chưa có Cán bộ chiến sĩ nào trong hệ thống.</p>
                <p className="text-xs text-slate-500 mt-1">Vui lòng vào mục "Danh sách CBCS" để nhập thông tin cán bộ trước.</p>
                <button
                  onClick={() => onNavigateToTab('officers')}
                  className="mt-3 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Nhập CBCS ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cột trái: Chọn CBCS & Xem trước dữ liệu tự động điền (5 Cột) */}
                <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      1. Chọn Cán bộ chiến sĩ làm đơn:
                    </label>
                    <select
                      value={selectedOfficerId}
                      onChange={(e) => handleSelectOfficer(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-950 text-xs"
                    >
                      {officers.map((o) => (
                        <option key={o.maCanBo} value={o.maCanBo}>
                          {o.hoTen} ({o.capBac} - {o.toCongTac})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thông tin nhân thân tự động tải */}
                  {activeQuickOfficer && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-slate-800">
                      <div className="font-bold text-slate-900 border-b pb-1 flex items-center justify-between">
                        <span>Thông tin nhân thân trích xuất:</span>
                        <span className="text-[10px] text-blue-700 font-mono font-normal">
                          Mã: {activeQuickOfficer.maCanBo}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">Giới tính: </span>
                          <span className="font-semibold">{activeQuickOfficer.gioiTinh}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Ngày sinh: </span>
                          <span className="font-semibold">{dinhDangNgayVN(activeQuickOfficer.ngaySinh) || '—'}</span>
                        </div>
                      </div>

                      <div className="text-[11px]">
                        <span className="text-slate-500">Quê quán: </span>
                        <span className="font-semibold">{activeQuickOfficer.queQuan || 'Xã Bát Tràng, Huyện Gia Lâm, TP Hà Nội'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">Cấp bậc: </span>
                          <span className="font-semibold">{activeQuickOfficer.capBac}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Chức vụ: </span>
                          <span className="font-semibold">{activeQuickOfficer.chucVu}</span>
                        </div>
                      </div>

                      <div className="text-[11px]">
                        <span className="text-slate-500">Đơn vị / Tổ: </span>
                        <span className="font-bold text-blue-900">{activeQuickOfficer.toCongTac}</span>
                      </div>

                      <div className="text-[11px] pt-1 border-t border-slate-100 flex justify-between">
                        <span>Ngày vào CAND: <strong>{dinhDangNgayVN(activeQuickOfficer.ngayVaoCAND)}</strong></span>
                        <span className="text-slate-500">Thâm niên: <strong>{tinhThamNien(activeQuickOfficer.ngayVaoCAND).moTa}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Chỉ số phép tính toán tự động */}
                  {activeQuickSummary && (
                    <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-blue-950 space-y-1.5 text-[11px]">
                      <div className="font-bold text-xs text-blue-900">
                        Chỉ số phép tự động điền vào Mục 1 & 2:
                      </div>
                      <div className="flex justify-between">
                        <span>1. Tổng ngày phép năm {currentYear}:</span>
                        <strong className="text-sm font-bold text-blue-950">{activeQuickSummary.tongPhepDuocHuong} ngày</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Đã nghỉ số ngày phép:</span>
                        <strong className="font-mono font-bold text-amber-800">
                          {String(activeQuickSummary.phepDaNghi).padStart(2, '0')}/{String(activeQuickSummary.tongPhepDuocHuong).padStart(2, '0')}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-blue-200">
                        <span>Quỹ ngày phép còn lại:</span>
                        <strong className="font-bold text-emerald-800">{activeQuickSummary.phepConLai} ngày</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột phải: Nhập chi tiết đợt nghỉ phép & Nút xuất đơn (7 Cột) */}
                <div className="lg:col-span-7 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Từ ngày nghỉ:
                      </label>
                      <input
                        type="date"
                        value={quickStartDate}
                        onChange={(e) => handleQuickStartDateChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Đến hết ngày:
                      </label>
                      <input
                        type="date"
                        value={quickEndDate}
                        onChange={(e) => handleQuickEndDateChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Mục 3: Số ngày đề nghị nghỉ:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={quickDays}
                        onChange={(e) => setQuickDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-xl font-bold text-base text-blue-900"
                      />
                      <span className="text-slate-500 font-medium">ngày</span>
                      <span className="text-slate-400 text-[11px]">
                        (Tự động tính từ ngày {dinhDangNgayVN(quickStartDate)} đến {dinhDangNgayVN(quickEndDate)})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Mục 4: Địa điểm nghỉ phép:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Hải Thịnh, Ninh Bình"
                      value={quickLocation}
                      onChange={(e) => setQuickLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Ghi rõ xã/phường, quận/huyện, tỉnh/thành nơi lưu trú khi nghỉ phép
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Mục 5: Lý do xin nghỉ phép:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Giải quyết công việc gia đình"
                      value={quickReason}
                      onChange={(e) => setQuickReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDispatchLeaveSlip(true)}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md transition"
                    >
                      <Printer className="w-4 h-4 text-amber-300" />
                      <span>Xuất ngay Đơn nghỉ phép & In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDispatchLeaveSlip(false)}
                      className="flex items-center gap-1.5 py-3 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Lưu phiếu vào hệ thống</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: THỐNG KÊ CHI TIẾT CÁC TỔ & LÃNH ĐẠO */}
        {dashboardTab === 'analytics' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Tình hình sử dụng ngày phép theo Đơn vị / Tổ công tác
                </h3>
                <p className="text-xs text-slate-500">
                  Gồm khối Lãnh đạo Chỉ huy CAX và 5 tổ công tác nghiệp vụ
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('annual-tracking')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                Bảng theo dõi phép chi tiết →
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Đơn vị / Tổ công tác</th>
                    <th className="py-2.5 px-3 text-center">Quân số</th>
                    <th className="py-2.5 px-3 text-right">Tổng quỹ phép</th>
                    <th className="py-2.5 px-3 text-right">Đã nghỉ</th>
                    <th className="py-2.5 px-3 text-right">Còn lại</th>
                    <th className="py-2.5 px-4 text-center">Tiến độ sử dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unitStats.map((item) => (
                    <tr key={item.to} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.to}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700">
                        {item.quanSo} Đ/c
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {item.tongHuong} ngày
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                        {item.daNghi} ngày
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {item.conLai} ngày
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.tyLe > 80 ? 'bg-rose-500' : item.tyLe > 50 ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, item.tyLe)}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 w-9 text-right">
                            {item.tyLe}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
