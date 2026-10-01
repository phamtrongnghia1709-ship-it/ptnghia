// Modal in Đơn đề nghị xin nghỉ phép chuẩn thể thức CAND - Công an xã Bát Tràng
import React from 'react';
import { Printer, X, FileCheck, CheckCircle2 } from 'lucide-react';
import { PhieuNghiPhep, CanBo, CauHinhHeThong } from '../../types';
import { DEFAULT_LEAVE_SLIP_CONFIG } from '../../utils/mockData';
import { tinhTongHopPhepNamCanBo } from '../../utils/calculator';
import { StorageService } from '../../services/storageService';

interface LeaveSlipModalProps {
  leave: PhieuNghiPhep;
  officer?: CanBo;
  config: CauHinhHeThong;
  onClose: () => void;
}

export const LeaveSlipModal: React.FC<LeaveSlipModalProps> = ({
  leave,
  officer,
  config,
  onClose,
}) => {
  const slipConfig = { ...DEFAULT_LEAVE_SLIP_CONFIG, ...(config.cauHinhGiayNghiPhep || {}) };

  const handlePrint = () => {
    window.print();
  };

  // Tính toán số liệu ngày phép của cán bộ
  const currentYear = leave.namNghi || new Date(leave.ngayBatDau).getFullYear() || 2026;
  const allLeaves = StorageService.getLeaveRequests();
  const summary = officer ? tinhTongHopPhepNamCanBo(officer, currentYear, allLeaves) : null;

  const tongPhep = summary ? summary.tongPhepDuocHuong : 17;
  const daNghi = summary ? summary.phepDaNghi : 0;
  const daNghiStr = String(daNghi).padStart(2, '0');
  const tongPhepStr = String(tongPhep).padStart(2, '0');
  const soNgayNghiStr = String(leave.soNgayNghi).padStart(2, '0');

  // Xử lý ngày tháng hiển thị
  const ngayLap = leave.ngayLapPhieu ? new Date(leave.ngayLapPhieu) : new Date();
  const ngayStr = ngayLap.getDate();
  const thangStr = ngayLap.getMonth() + 1;
  const namStr = ngayLap.getFullYear();

  // Format ngày sinh
  const formatNgaySinh = (dateStr?: string) => {
    if (!dateStr) return '... tháng ... năm ...';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[2], 10)} tháng ${parseInt(parts[1], 10)} năm ${parts[0]}`;
    }
    return dateStr;
  };

  // Format ngày vào CAND (MM/YYYY)
  const formatNgayVaoCAND = (dateStr?: string) => {
    if (!dateStr) return '10/2011';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Format ngày tháng DD/M/YYYY
  const formatNgayThang = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = parts[2].padStart(2, '0');
      const m = String(parseInt(parts[1], 10));
      return `${d}/${m}/${parts[0]}`;
    }
    return dateStr;
  };

  const toCongTacText = leave.toCongTac || officer?.toCongTac || 'Tổ Tổng hợp';
  const tieuDeXacNhanTo = toCongTacText === 'Lãnh đạo Chỉ huy Công an xã'
    ? 'XÁC NHẬN CỦA LÃNH ĐẠO, CHỈ HUY CAX'
    : (slipConfig.tieuDeXacNhanTo || 'XÁC NHẬN CỦA {to}').replace(
        '{to}',
        toCongTacText.toUpperCase()
      );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 print:shadow-none print:border-none print:m-0 print:max-w-none print:w-full">
        {/* Top actions bar - hide when printing */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              Đơn đề nghị nghỉ phép: {leave.id} - {leave.hoTenCanBo}
            </h3>
            <span className="text-[10px] bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded border border-red-800">
              Mẫu chuẩn CAND
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>In đơn đề nghị</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper printable container - Match exact PDF visual ratio & typography */}
        <div className="p-8 sm:p-14 text-slate-950 font-serif leading-relaxed max-w-[800px] mx-auto bg-white print:p-0 print:max-w-none text-[13px] sm:text-[14px]">
          {/* Header Quốc hiệu */}
          <div className="text-center mb-6">
            <div className="font-bold uppercase tracking-wide text-sm sm:text-base text-slate-950">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-950 mt-0.5">
              Độc lập – Tự do – Hạnh phúc
            </div>
            <div className="w-40 h-[1.5px] bg-slate-950 mx-auto mt-1 mb-6"></div>
          </div>

          {/* Tiêu đề Đơn */}
          <div className="text-center my-6">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-950">
              {slipConfig.tieuDeDon || 'ĐƠN ĐỀ NGHỊ'}
            </h1>
            <div className="text-xs sm:text-sm font-bold italic mt-1 text-slate-800">
              {slipConfig.tieuDePhu || 'Về việc xin nghỉ phép, nghỉ việc riêng'}
            </div>
          </div>

          {/* Kính gửi */}
          <div className="text-center font-medium my-5 text-xs sm:text-sm">
            <span>Kính gửi: </span>
            <span className="font-semibold">{slipConfig.kinhGui || 'BCH Công an xã Bát Tràng, Công an TP Hà Nội'}</span>
          </div>

          {/* Thông tin nhân thân cán bộ */}
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-900 mt-4 leading-normal">
            <div className="flex justify-between items-baseline">
              <div>
                <span>Tên tôi là: </span>
                <span className="font-semibold">{leave.hoTenCanBo}</span>
              </div>
              <div className="pr-6">
                <span>Giới tính: </span>
                <span>{officer?.gioiTinh || 'Nam'}.</span>
              </div>
            </div>

            <div>
              <span>Sinh ngày: </span>
              <span>{formatNgaySinh(officer?.ngaySinh)}</span>
            </div>

            <div>
              <span>Quê quán: </span>
              <span>{officer?.queQuan || leave.diaDiemNghi || 'Xã Bát Tràng, Huyện Gia Lâm, TP Hà Nội'}</span>
            </div>

            <div>
              <span>Ngày vào CAND: </span>
              <span>{formatNgayVaoCAND(officer?.ngayVaoCAND)}; </span>
              <span>Cấp bậc hàm: </span>
              <span className="font-semibold">{officer?.capBac || 'Đại úy'}</span>
            </div>

            <div>
              <span>Chức vụ, đơn vị công tác: </span>
              <span>{officer?.chucVu || 'Cán bộ'}, {slipConfig.tenDonVi || config.tenDonVi || 'Công an xã Bát Tràng'}.</span>
            </div>
          </div>

          {/* Đoạn văn bản căn cứ */}
          <p className="text-justify text-xs sm:text-sm mt-4 indent-8 leading-relaxed">
            {slipConfig.canCuVanBan}
          </p>

          {/* Danh sách 5 mục đề nghị */}
          <div className="space-y-1 text-xs sm:text-sm mt-3 pl-4">
            <div>
              <span className="font-bold italic">1. Tổng số ngày được nghỉ phép trong năm {currentYear}: </span>
              <span className="font-semibold">{tongPhep} ngày;</span>
            </div>

            <div>
              <span className="font-bold italic">2. Đã nghỉ số ngày phép: </span>
              <span className="font-semibold">{daNghiStr}/{tongPhepStr} </span>
              <span>(tổng số ngày được nghỉ trong năm);</span>
            </div>

            <div>
              <span className="font-bold italic">3. Đề nghị nghỉ phép {soNgayNghiStr} ngày: </span>
              <span>từ ngày </span>
              <span className="font-semibold">{formatNgayThang(leave.ngayBatDau)}</span>
              <span> đến hết ngày </span>
              <span className="font-semibold">{formatNgayThang(leave.ngayKetThuc)}</span>
            </div>

            <div>
              <span className="font-bold italic">4. Địa điểm nghỉ phép: </span>
              <span>{leave.diaDiemNghi || officer?.queQuan || 'Nơi đăng ký thường trú'};</span>
            </div>

            <div>
              <span className="font-bold italic">5. Lý do xin nghỉ phép: </span>
              <span>{leave.lyDoNghi || 'Giải quyết công việc gia đình'};</span>
            </div>
          </div>

          {/* Cam kết & Cảm ơn */}
          <p className="text-justify text-xs sm:text-sm mt-4 indent-8 leading-relaxed">
            {slipConfig.camKetDieuLenh}
          </p>

          <div className="font-bold italic text-xs sm:text-sm mt-2 pl-4">
            {slipConfig.loiCamOn || 'Tôi xin chân thành cảm ơn!'}
          </div>

          {/* KHỐI CHỮ KÝ 4 BÊN CHUẨN MẪU PDF */}
          <div className="mt-8 space-y-12">
            {/* Hàng 1: Xác nhận của Tổ công tác (Trái) & Ngày tháng / Người báo cáo (Phải) */}
            <div className="grid grid-cols-2 gap-6 text-center text-xs sm:text-sm">
              <div>
                <div className="font-bold uppercase tracking-wide">
                  {tieuDeXacNhanTo}
                </div>
                <div className="h-20 sm:h-24"></div>
              </div>

              <div>
                <div className="italic text-[11px] sm:text-xs text-slate-800">
                  {slipConfig.diaDanh || 'Bát Tràng'}, ngày {ngayStr} tháng {thangStr} năm {namStr}
                </div>
                <div className="font-bold uppercase tracking-wide mt-0.5">
                  {slipConfig.tieuDeNguoiBaoCao || 'NGƯỜI BÁO CÁO'}
                </div>
                <div className="h-16 sm:h-20 flex items-end justify-center">
                  <span className="font-bold text-slate-950">{leave.hoTenCanBo}</span>
                </div>
              </div>
            </div>

            {/* Hàng 2: Xác nhận của Chỉ huy phụ trách (Trái) & Xác nhận của Trưởng CAX (Phải) */}
            <div className="grid grid-cols-2 gap-6 text-center text-xs sm:text-sm pt-2">
              <div>
                <div className="font-bold uppercase tracking-wide leading-snug">
                  {slipConfig.tieuDeChiHuyPhuTrach || 'XÁC NHẬN CỦA\nCHỈ HUY PHỤ TRÁCH'}
                </div>
                <div className="h-20 sm:h-24"></div>
              </div>

              <div>
                <div className="font-bold uppercase tracking-wide">
                  {slipConfig.tieuDeTruongCAX || 'XÁC NHẬN CỦA TRƯỞNG CAX'}
                </div>
                <div className="h-20 sm:h-24 flex items-center justify-center">
                  {leave.trangThai === 'Đã phê duyệt' ? (
                    slipConfig.hienThiDauPheDuyet ? (
                      <span className="border-2 border-red-700 text-red-700 font-bold px-3 py-1 rounded text-xs rotate-[-5deg] uppercase shadow-2xs">
                        ✓ ĐÃ PHÊ DUYỆT
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs uppercase">
                        Đã phê duyệt
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 italic text-xs">Chờ phê duyệt</span>
                  )}
                </div>
                {slipConfig.hoTenTruongCAX && (
                  <div className="font-bold uppercase text-slate-950 text-xs">
                    {slipConfig.hoTenTruongCAX}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
