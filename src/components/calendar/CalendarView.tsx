// Phân hệ Quản lý Lịch nghỉ phép (Tháng / Tuần / Danh sách) - Công an xã Bát Tràng
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  List, 
  Grid3X3, 
  CalendarDays,
  User
} from 'lucide-react';
import { PhieuNghiPhep, ToCongTac, CauHinhHeThong } from '../../types';
import { dinhDangNgayVN, timTrungLichTrongTo } from '../../utils/calculator';

interface CalendarViewProps {
  leaveRequests: PhieuNghiPhep[];
  currentYear: number;
  config: CauHinhHeThong;
  onOpenLeaveDetail: (leave: PhieuNghiPhep) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  leaveRequests,
  currentYear,
  config,
  onOpenLeaveDetail,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedTo, setSelectedTo] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const TO_CONG_TAC_OPTIONS: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  // Lọc danh sách phiếu nghỉ
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((p) => {
      const pYear = p.namNghi || new Date(p.ngayBatDau).getFullYear();
      if (pYear !== currentYear) return false;

      if (selectedTo !== 'all' && p.toCongTac !== selectedTo) return false;
      if (selectedStatus !== 'all' && p.trangThai !== selectedStatus) return false;

      return true;
    });
  }, [leaveRequests, currentYear, selectedTo, selectedStatus]);

  // Cảnh báo trùng lịch trong cùng tổ
  const unitConflicts = useMemo(() => {
    const list: { date: string; to: string; officers: string[]; requests: PhieuNghiPhep[] }[] = [];
    const valid = filteredRequests.filter(
      (p) => p.trangThai === 'Đã phê duyệt' || p.trangThai === 'Chờ phê duyệt'
    );

    TO_CONG_TAC_OPTIONS.forEach((to) => {
      const toReqs = valid.filter((p) => p.toCongTac === to);
      for (let i = 0; i < toReqs.length; i++) {
        for (let j = i + 1; j < toReqs.length; j++) {
          const r1 = toReqs[i];
          const r2 = toReqs[j];
          if (r1.maCanBo !== r2.maCanBo) {
            if (r1.ngayBatDau <= r2.ngayKetThuc && r2.ngayBatDau <= r1.ngayKetThuc) {
              list.push({
                date: `${dinhDangNgayVN(r1.ngayBatDau)} - ${dinhDangNgayVN(r1.ngayKetThuc)}`,
                to,
                officers: [r1.hoTenCanBo, r2.hoTenCanBo],
                requests: [r1, r2],
              });
            }
          }
        }
      }
    });

    return list;
  }, [filteredRequests]);

  // Tạo ma trận ngày cho Tháng hiện tại (Lịch tháng)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

    const totalDays = lastDayOfMonth.getDate();
    // 0: Chủ nhật, 1: Thứ 2, ...
    let startingDayOfWeek = firstDayOfMonth.getDay();
    // Chuyển sang Thứ 2 là ngày đầu tuần (0: T2, ..., 6: CN)
    const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    // Padding ngày tháng trước
    for (let i = 0; i < offset; i++) {
      days.push({ day: null, dateStr: null, isCurrentMonth: false });
    }

    // Các ngày trong tháng
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr, isCurrentMonth: true });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Tìm các phiếu nghỉ rơi vào một ngày cụ thể
  const getRequestsForDate = (dateStr: string) => {
    return filteredRequests.filter((p) => {
      return dateStr >= p.ngayBatDau && dateStr <= p.ngayKetThuc;
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) setCurrentMonth(12);
    else setCurrentMonth(currentMonth - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) setCurrentMonth(1);
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="space-y-5">
      {/* Thanh công cụ Lịch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-700" />
              <span>Quản lý Lịch nghỉ phép – Tháng {currentMonth}/{currentYear}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Trực quan hóa lịch trực và cảnh báo nguy cơ thiếu quân số trong cùng tổ công tác
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút chuyển chế độ xem */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'month' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch tháng
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dạng danh sách
            </button>
          </div>

          {/* Lọc theo tổ */}
          <select
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            aria-label="Lọc lịch theo tổ công tác"
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các tổ</option>
            {TO_CONG_TAC_OPTIONS.map((to) => (
              <option key={to} value={to}>{to}</option>
            ))}
          </select>

          {/* Điều hướng Tháng */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-200"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2 text-slate-800">
              Tháng {currentMonth}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-200"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cảnh báo quân số trùng lịch */}
      {unitConflicts.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <span className="font-bold text-amber-950">
              Cảnh báo quân số: Phát hiện {unitConflicts.length} đợt nghỉ trùng trong cùng tổ công tác!
            </span>
            <div className="mt-1 space-y-0.5 text-amber-800">
              {unitConflicts.map((c, i) => (
                <div key={i}>
                  • <strong>{c.to}</strong>: Đồng chí {c.officers.join(' và ')} nghỉ trùng khoảng thời gian ({c.date}).
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Mode: Month Calendar */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Thứ 2 -> Chủ Nhật */}
          <div className="grid grid-cols-7 bg-slate-900 text-white text-center font-bold text-xs py-2.5">
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div>Thứ Sáu</div>
            <div className="text-amber-300">Thứ Bảy</div>
            <div className="text-amber-400">Chủ Nhật</div>
          </div>

          {/* Grid ngày */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth || !item.dateStr) {
                return (
                  <div key={idx} className="bg-slate-50/50 p-2 min-h-[90px] opacity-40"></div>
                );
              }

              const requests = getRequestsForDate(item.dateStr);
              const isToday = item.dateStr === new Date().toISOString().slice(0, 10);

              // Kiểm tra xem ngày này có xung đột cùng tổ không
              const toCounts: { [key: string]: number } = {};
              requests.forEach((r) => {
                toCounts[r.toCongTac] = (toCounts[r.toCongTac] || 0) + 1;
              });
              const hasConflict = Object.values(toCounts).some((cnt) => cnt >= config.canhBaoTrungQuanSoTo);

              return (
                <div
                  key={idx}
                  className={`p-1.5 min-h-[100px] flex flex-col justify-between transition hover:bg-blue-50/30 ${
                    isToday ? 'bg-blue-50/80 ring-2 ring-blue-500 ring-inset' : ''
                  } ${hasConflict ? 'bg-amber-50/40' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.day}
                    </span>

                    {hasConflict && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1 rounded flex items-center gap-0.5" title="Có từ 2 CBCS cùng tổ nghỉ trùng ngày">
                        ⚠️ Trùng tổ
                      </span>
                    )}
                  </div>

                  {/* Danh sách CBCS nghỉ trong ngày */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {requests.map((req) => {
                      const isPending = req.trangThai === 'Chờ phê duyệt';
                      const isAnnual = req.loaiNghi === 'Nghỉ phép năm';

                      return (
                        <div
                          key={req.id}
                          onClick={() => onOpenLeaveDetail(req)}
                          className={`p-1 rounded text-[10px] cursor-pointer font-medium truncate border transition ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              : isAnnual
                              ? 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200'
                              : 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200'
                          }`}
                          title={`${req.hoTenCanBo} (${req.toCongTac}) - ${req.loaiNghi} (${req.trangThai})`}
                        >
                          <span className="font-bold">{req.hoTenCanBo}</span>
                          <span className="text-[9px] opacity-75 block truncate">
                            {req.loaiNghi} {isPending ? '(Chờ)' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode: List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
            Danh sách lịch nghỉ phép Tháng {currentMonth}/{currentYear} ({filteredRequests.length} đợt nghỉ)
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Không có lịch nghỉ phép nào trong tháng này.
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onOpenLeaveDetail(req)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                      {req.soNgayNghi}N
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{req.hoTenCanBo}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">
                          {req.maCanBo}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">{req.toCongTac}</div>
                      <div className="text-slate-700 italic mt-1 text-[11px]">
                        "{req.lyDoNghi}"
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {dinhDangNgayVN(req.ngayBatDau)} → {dinhDangNgayVN(req.ngayKetThuc)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.trangThai === 'Đã phê duyệt' ? 'bg-emerald-100 text-emerald-800' :
                      req.trangThai === 'Chờ phê duyệt' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.loaiNghi} • {req.trangThai}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
