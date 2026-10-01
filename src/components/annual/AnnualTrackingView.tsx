// Phân hệ Theo dõi ngày phép theo năm - Công an xã Bát Tràng
import React, { useState, useMemo } from 'react';
import { 
  CalendarRange, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  X
} from 'lucide-react';
import { CanBo, PhieuNghiPhep, ToCongTac, TrangThaiPhepNam, CauHinhHeThong } from '../../types';
import { tinhTongHopPhepNamCanBo, dinhDangNgayVN } from '../../utils/calculator';
import * as XLSX from 'xlsx';

interface AnnualTrackingViewProps {
  currentYear: number;
  officers: CanBo[];
  leaveRequests: PhieuNghiPhep[];
  config: CauHinhHeThong;
  onOpenOfficerDetail: (officer: CanBo) => void;
}

export const AnnualTrackingView: React.FC<AnnualTrackingViewProps> = ({
  currentYear,
  officers,
  leaveRequests,
  config,
  onOpenOfficerDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const TRANG_THAI_OPTIONS: TrangThaiPhepNam[] = [
    'Chưa nghỉ phép',
    'Đang sử dụng',
    'Còn ít phép',
    'Đã hết phép',
    'Vượt phép',
  ];

  // Tính toán dữ liệu tổng hợp từng cán bộ cho năm hiện tại
  const annualData = useMemo(() => {
    return officers
      .filter((cb) => cb.trangThaiCongTac === 'Đang công tác')
      .map((cb) => {
        const summary = tinhTongHopPhepNamCanBo(
          cb,
          currentYear,
          leaveRequests,
          config.phepCoBanMacDinh,
          config.chuKyTangPhepNam
        );
        return {
          officer: cb,
          summary,
        };
      });
  }, [officers, currentYear, leaveRequests, config]);

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    return annualData.filter(({ officer, summary }) => {
      const matchSearch =
        officer.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.maCanBo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (officer.soHieuCAND && officer.soHieuCAND.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTo = selectedTo === 'all' || officer.toCongTac === selectedTo;
      const matchStatus = selectedStatus === 'all' || summary.trangThai === selectedStatus;

      return matchSearch && matchTo && matchStatus;
    });
  }, [annualData, searchTerm, selectedTo, selectedStatus]);

  // Xuất bảng này ra Excel
  const handleExportAnnualExcel = () => {
    const rows = filteredData.map(({ officer, summary }, idx) => ({
      'STT': idx + 1,
      'Năm': currentYear,
      'Mã cán bộ': officer.maCanBo,
      'Họ và tên': officer.hoTen,
      'Cấp bậc': officer.capBac,
      'Chức vụ': officer.chucVu,
      'Tổ công tác': officer.toCongTac,
      'Ngày vào CAND': officer.ngayVaoCAND,
      'Số năm công tác': summary.soNamCongTac,
      'Số tháng lẻ': summary.soThangLe,
      'Phép cơ bản': summary.phepCoBan,
      'Phép tăng thêm (Thâm niên)': summary.phepTangThem,
      'Tổng phép được hưởng': summary.tongPhepDuocHuong,
      'Tổng phép đã nghỉ': summary.phepDaNghi,
      'Tổng phép còn lại': summary.phepConLai,
      'Tỷ lệ sử dụng (%)': summary.tyLeSuDung,
      'Trạng thái': summary.trangThai,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `TheoDoi_${currentYear}`);
    XLSX.writeFile(wb, `TheoDoiPhepNam_${currentYear}_CAX_BatTrang.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Tiêu đề & Nút Xuất Bảng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Bảng Theo dõi Ngày phép theo Năm {currentYear}</span>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              {filteredData.length} CBCS
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi tỷ lệ sử dụng phép và tình trạng còn lại của từng đồng chí trong toàn đơn vị
          </p>
        </div>

        <button
          onClick={handleExportAnnualExcel}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Excel bảng theo dõi</span>
        </button>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã cán bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            aria-label="Lọc theo tổ công tác"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các tổ công tác</option>
            {TO_CONG_TAC_OPTIONS.map((to) => (
              <option key={to} value={to}>{to}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái phép"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái sử dụng phép</option>
            {TRANG_THAI_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng Chi tiết Theo dõi Ngày phép theo Năm (Section IV.4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Mã CBCS</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Tổ công tác</th>
                <th className="py-3 px-3">Ngày vào CAND</th>
                <th className="py-3 px-2 text-center">Thâm niên</th>
                <th className="py-3 px-2 text-center bg-slate-800">Cơ bản</th>
                <th className="py-3 px-2 text-center bg-slate-800">Thâm niên</th>
                <th className="py-3 px-2 text-center bg-blue-900 text-amber-300 font-bold">Tổng hưởng</th>
                <th className="py-3 px-2 text-center bg-amber-950 text-amber-300 font-bold">Đã nghỉ</th>
                <th className="py-3 px-2 text-center bg-emerald-950 text-emerald-300 font-bold">Còn lại</th>
                <th className="py-3 px-3 text-center">Tỷ lệ sử dụng</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredData.map(({ officer, summary }, index) => {
                  return (
                    <tr key={officer.id} className="hover:bg-blue-50/50 transition">
                      <td className="py-3 px-3 text-center font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">
                        {officer.maCanBo}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div>{officer.capBac} {officer.hoTen}</div>
                        <div className="text-[10px] text-slate-400">{officer.chucVu}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {officer.toCongTac}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {dinhDangNgayVN(officer.ngayVaoCAND)}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-indigo-900 whitespace-nowrap">
                        {summary.soNamCongTac} năm
                        {summary.soThangLe > 0 && (
                          <span className="text-[10px] text-slate-400 block">+{summary.soThangLe}th</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700 bg-slate-50">
                        {summary.phepCoBan}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-amber-700 bg-slate-50">
                        +{summary.phepTangThem}
                      </td>
                      <td className="py-3 px-2 text-center font-black text-sm bg-blue-50 text-blue-900">
                        {summary.tongPhepDuocHuong}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-sm bg-amber-50 text-amber-800">
                        {summary.phepDaNghi}
                      </td>
                      <td className="py-3 px-2 text-center font-black text-sm bg-emerald-50 text-emerald-800">
                        {summary.phepConLai}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                summary.tyLeSuDung >= 100
                                  ? 'bg-rose-500'
                                  : summary.tyLeSuDung > 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, summary.tyLeSuDung)}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 w-8 text-right">
                            {summary.tyLeSuDung}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          summary.trangThai === 'Chưa nghỉ phép' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                          summary.trangThai === 'Đang sử dụng' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          summary.trangThai === 'Còn ít phép' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          summary.trangThai === 'Đã hết phép' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {summary.trangThai}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenOfficerDetail(officer)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                          title="Xem chi tiết lịch sử nghỉ phép"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
