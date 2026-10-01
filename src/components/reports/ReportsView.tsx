// Phân hệ Báo cáo – Thống kê chuẩn thể thức Công an nhân dân - Công an xã Bát Tràng
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { CanBo, PhieuNghiPhep, ToCongTac, CauHinhHeThong } from '../../types';
import { tinhTongHopPhepNamCanBo, dinhDangNgayVN } from '../../utils/calculator';
import * as XLSX from 'xlsx';

export type ReportType = 
  | 'tong_hop_don_vi'
  | 'theo_to_cong_tac'
  | 'chua_nghi_phep'
  | 'da_het_phep'
  | 'con_it_phep'
  | 'vuot_phep';

interface ReportsViewProps {
  officers: CanBo[];
  leaveRequests: PhieuNghiPhep[];
  currentYear: number;
  config: CauHinhHeThong;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  officers,
  leaveRequests,
  currentYear,
  config,
}) => {
  const [reportType, setReportType] = useState<ReportType>('tong_hop_don_vi');
  const [selectedTo, setSelectedTo] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  const TO_CONG_TAC_OPTIONS: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  // Tính toán dữ liệu tổng hợp
  const calculatedData = useMemo(() => {
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
        return { officer: cb, summary };
      });
  }, [officers, currentYear, leaveRequests, config]);

  // Lọc dữ liệu theo báo cáo và điều kiện
  const reportRows = useMemo(() => {
    return calculatedData.filter(({ officer, summary }) => {
      if (selectedTo !== 'all' && officer.toCongTac !== selectedTo) return false;

      switch (reportType) {
        case 'chua_nghi_phep':
          return summary.phepDaNghi === 0;
        case 'da_het_phep':
          return summary.phepConLai === 0;
        case 'con_it_phep':
          return summary.phepConLai > 0 && summary.phepConLai <= 3;
        case 'vuot_phep':
          return summary.phepConLai < 0;
        default:
          return true;
      }
    });
  }, [calculatedData, selectedTo, reportType]);

  // Xuất Excel cho báo cáo hiện tại
  const handleExportExcel = () => {
    const rows = reportRows.map(({ officer, summary }, idx) => ({
      'STT': idx + 1,
      'Mã CBCS': officer.maCanBo,
      'Cấp bậc, Họ và tên': `${officer.capBac} ${officer.hoTen}`,
      'Chức vụ': officer.chucVu,
      'Tổ công tác': officer.toCongTac,
      'Ngày vào CAND': officer.ngayVaoCAND,
      'Thâm niên (năm)': summary.soNamCongTac,
      'Phép cơ bản': summary.phepCoBan,
      'Phép thâm niên': summary.phepTangThem,
      'Tổng ngày phép': summary.tongPhepDuocHuong,
      'Số ngày đã nghỉ': summary.phepDaNghi,
      'Số ngày còn lại': summary.phepConLai,
      'Tỷ lệ sử dụng (%)': `${summary.tyLeSuDung}%`,
      'Trạng thái': summary.trangThai,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCao');
    XLSX.writeFile(wb, `BaoCao_NghiPhep_${reportType}_${currentYear}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'tong_hop_don_vi':
        return `BÁO CÁO TỔNG HỢP TÌNH HÌNH NGHỈ PHÉP NĂM ${currentYear}`;
      case 'theo_to_cong_tac':
        return `BÁO CÁO TÌNH HÌNH NGHỈ PHÉP THEO TỔ CÔNG TÁC – NĂM ${currentYear}`;
      case 'chua_nghi_phep':
        return `DANH SÁCH CÁN BỘ, CHIẾN SĨ CHƯA NGHỈ PHÉP – NĂM ${currentYear}`;
      case 'da_het_phep':
        return `DANH SÁCH CÁN BỘ, CHIẾN SĨ ĐÃ NGHỈ HẾT PHÉP – NĂM ${currentYear}`;
      case 'con_it_phep':
        return `DANH SÁCH CÁN BỘ, CHIẾN SĨ CÒN DƯỚI 03 NGÀY PHÉP – NĂM ${currentYear}`;
      case 'vuot_phep':
        return `DANH SÁCH CÁN BỘ NGHỈ VƯỢT QUỸ PHÉP NĂM ${currentYear}`;
    }
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Thanh chọn Báo cáo & Thao tác (Ẩn khi in ấn) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <span>Báo cáo – Thống kê Tình hình Nghỉ phép CAND</span>
            </h2>
            <p className="text-xs text-slate-500">
              Xuất văn bản hành chính theo quy chuẩn báo cáo tham mưu Công an nhân dân
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo chuẩn A4</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Tab chuyển đổi các chuyên đề báo cáo */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setReportType('tong_hop_don_vi')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              reportType === 'tong_hop_don_vi'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tổng hợp toàn đơn vị
          </button>
          <button
            onClick={() => setReportType('chua_nghi_phep')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              reportType === 'chua_nghi_phep'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Chưa nghỉ phép
          </button>
          <button
            onClick={() => setReportType('da_het_phep')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              reportType === 'da_het_phep'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Đã hết phép
          </button>
          <button
            onClick={() => setReportType('con_it_phep')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              reportType === 'con_it_phep'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Còn dưới 03 ngày
          </button>
          <button
            onClick={() => setReportType('vuot_phep')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              reportType === 'vuot_phep'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Nghỉ vượt phép
          </button>
        </div>
      </div>

      {/* Trang Báo Cáo Văn Bản Chuẩn Hành Chính CAND (In trực tiếp / Xem trước) */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto font-serif text-slate-900 leading-normal">
        {/* Quốc hiệu - Tiêu ngữ - Tên Đơn vị */}
        <div className="flex justify-between items-start text-center mb-6">
          <div className="text-xs">
            <div className="font-bold uppercase tracking-wider">{config.tenDonViCapTren}</div>
            <div className="font-bold uppercase tracking-wider text-sm border-b-2 border-slate-900 pb-0.5 inline-block">
              {config.tenDonVi}
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-600">
              Số: ..... /BC-CAX
            </div>
          </div>

          <div className="text-xs">
            <div className="font-bold uppercase tracking-wider text-xs">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="font-bold text-xs italic border-b-2 border-slate-900 pb-0.5 inline-block">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="mt-1 text-[11px] italic text-slate-600">
              Bát Tràng, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
            </div>
          </div>
        </div>

        {/* Tiêu đề Báo cáo */}
        <div className="text-center my-6">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900">
            {getReportTitle()}
          </h2>
          <div className="text-xs italic mt-1 text-slate-600">
            (Tính đến ngày {dinhDangNgayVN(today.toISOString().slice(0, 10))})
          </div>
        </div>

        {/* Bảng Dữ liệu Thống kê Báo cáo */}
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800 text-center">
                <th className="border border-slate-800 py-2 px-2 w-10">STT</th>
                <th className="border border-slate-800 py-2 px-2.5">Mã CBCS</th>
                <th className="border border-slate-800 py-2 px-3 text-left">Cấp bậc, Họ và tên</th>
                <th className="border border-slate-800 py-2 px-3 text-left">Tổ công tác</th>
                <th className="border border-slate-800 py-2 px-2">Ngày vào ngành</th>
                <th className="border border-slate-800 py-2 px-2">Thâm niên</th>
                <th className="border border-slate-800 py-2 px-2">Phép cơ bản</th>
                <th className="border border-slate-800 py-2 px-2">Thâm niên</th>
                <th className="border border-slate-800 py-2 px-2 font-black">Tổng hưởng</th>
                <th className="border border-slate-800 py-2 px-2 font-bold">Đã nghỉ</th>
                <th className="border border-slate-800 py-2 px-2 font-bold">Còn lại</th>
                <th className="border border-slate-800 py-2 px-2">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="border border-slate-800 py-6 text-center text-slate-400 italic">
                    Không có bản ghi nào phù hợp tiêu chí báo cáo.
                  </td>
                </tr>
              ) : (
                reportRows.map(({ officer, summary }, index) => (
                  <tr key={officer.id} className="border-b border-slate-400">
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{index + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2.5 font-mono font-bold text-center">{officer.maCanBo}</td>
                    <td className="border border-slate-800 py-1.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {officer.capBac} {officer.hoTen}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-3 whitespace-nowrap">{officer.toCongTac}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-mono">{dinhDangNgayVN(officer.ngayVaoCAND)}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-semibold">{summary.soNamCongTac} năm</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{summary.phepCoBan}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">+{summary.phepTangThem}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">{summary.tongPhepDuocHuong}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold text-amber-900">{summary.phepDaNghi}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold text-emerald-900">{summary.phepConLai}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{summary.tyLeSuDung}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Chữ ký hai bên */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-4 text-center text-xs">
          <div>
            <div className="font-bold uppercase">NGƯỜI LẬP BIỂU</div>
            <div className="italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</div>
            <div className="h-20"></div>
            <div className="font-bold">Cán bộ tham mưu tổng hợp</div>
          </div>

          <div>
            <div className="font-bold uppercase tracking-wider">TRƯỞNG CÔNG AN XÃ</div>
            <div className="italic text-[11px] text-slate-500">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div className="h-20"></div>
            <div className="font-bold uppercase">{config.hoTenNguoiKy}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
