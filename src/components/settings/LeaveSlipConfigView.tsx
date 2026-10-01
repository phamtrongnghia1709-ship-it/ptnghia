// Phân hệ Cấu hình Mẫu Đơn Đề Nghị Nghỉ Phép Chuẩn CAND - Công an xã Bát Tràng
import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  Award,
  ShieldCheck,
  Building2,
  FileCheck
} from 'lucide-react';
import { CauHinhGiayNghiPhep, CauHinhHeThong } from '../../types';
import { DEFAULT_LEAVE_SLIP_CONFIG } from '../../utils/mockData';
import { StorageService } from '../../services/storageService';

interface LeaveSlipConfigViewProps {
  config: CauHinhHeThong;
  onSaveConfig: (updatedConfig: CauHinhHeThong) => void;
}

export const LeaveSlipConfigView: React.FC<LeaveSlipConfigViewProps> = ({
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<CauHinhGiayNghiPhep>({
    ...DEFAULT_LEAVE_SLIP_CONFIG,
    ...(config.cauHinhGiayNghiPhep || {}),
  });

  const [activeTab, setActiveTab] = useState<'titles' | 'basis' | 'commitments' | 'signatures'>('titles');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Xử lý lưu cấu hình
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = StorageService.saveLeaveSlipConfig(formData);
    onSaveConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Khôi phục cấu hình mẫu theo file PDF chuẩn
  const handleResetDefaults = () => {
    const confirmReset = window.confirm(
      'Khôi phục lại toàn bộ mẫu Đơn đề nghị nghỉ phép theo đúng chuẩn biểu mẫu của Công an xã Bát Tràng?'
    );
    if (confirmReset) {
      setFormData({ ...DEFAULT_LEAVE_SLIP_CONFIG });
      const updated = StorageService.saveLeaveSlipConfig({ ...DEFAULT_LEAVE_SLIP_CONFIG });
      onSaveConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Áp dụng mẫu nhanh
  const applyPreset = (preset: 'chuan_pdf' | 'nghi_viec_rieng') => {
    if (preset === 'chuan_pdf') {
      setFormData({
        ...DEFAULT_LEAVE_SLIP_CONFIG,
      });
    } else if (preset === 'nghi_viec_rieng') {
      setFormData((prev) => ({
        ...prev,
        tieuDeDon: 'ĐƠN ĐỀ NGHỊ',
        tieuDePhu: 'Về việc xin nghỉ việc riêng',
        canCuVanBan:
          'Căn cứ Thông tư số 96/2025/TT-BCA ngày 06/10/2025 của Bộ Công an quy định về chế độ nghỉ trong Công an nhân dân và quy định hiện hành của Công an TP Hà Nội, tôi xin báo cáo và đề nghị như sau:',
      }));
    }
  };

  const handlePrintTest = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-700 to-amber-700 text-white flex items-center justify-center shadow-md border border-amber-400/40">
            <FileText className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Cấu hình Mẫu Đơn Đề Nghị Nghỉ Phép</span>
              <span className="text-[11px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-200">
                Chuẩn Mẫu CAX Bát Tràng
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Tùy chỉnh Quốc hiệu, Tiêu đề, Kính gửi, Căn cứ văn bản, Điều lệ cam kết và 4 khối chữ ký xác nhận
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Khôi phục mẫu gốc theo PDF"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mẫu gốc PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrintTest}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition"
            title="In thử bản xem trước này ra giấy"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>In thử nghiệm</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>

      {/* Thông báo lưu thành công */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đã lưu thành công Cấu hình Mẫu đơn đề nghị! Bản in phiếu nghỉ phép của CBCS sẽ tự động áp dụng đúng mẫu này.</span>
          </div>
        </div>
      )}

      {/* Main 2-column layout: Left Form + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: FORM CẤU HÌNH (5 Cột trên desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('titles')}
              className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition text-center ${
                activeTab === 'titles'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tiêu đề & Kính gửi
            </button>
            <button
              onClick={() => setActiveTab('basis')}
              className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition text-center ${
                activeTab === 'basis'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Căn cứ pháp lý
            </button>
            <button
              onClick={() => setActiveTab('commitments')}
              className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl transition text-center ${
                activeTab === 'commitments'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lời cam kết
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition text-center ${
                activeTab === 'signatures'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Khối chữ ký
            </button>
          </div>

          {/* Quick presets */}
          <div className="px-5 pt-3.5 pb-2 bg-slate-50/40 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Thiết lập nhanh:</span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('chuan_pdf')}
                className="text-[10px] font-semibold bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-2 py-0.5 rounded-lg shadow-2xs"
              >
                Mẫu chuẩn PDF
              </button>
              <button
                type="button"
                onClick={() => applyPreset('nghi_viec_rieng')}
                className="text-[10px] font-semibold bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-2 py-0.5 rounded-lg shadow-2xs"
              >
                Mẫu Nghỉ việc riêng
              </button>
            </div>
          </div>

          {/* Tab 1: Tiêu đề & Kính gửi */}
          {activeTab === 'titles' && (
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Tiêu đề chính:
                </label>
                <input
                  type="text"
                  value={formData.tieuDeDon || 'ĐƠN ĐỀ NGHỊ'}
                  onChange={(e) => setFormData({ ...formData, tieuDeDon: e.target.value })}
                  placeholder="ĐƠN ĐỀ NGHỊ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Tiêu đề phụ:
                </label>
                <input
                  type="text"
                  value={formData.tieuDePhu || 'Về việc xin nghỉ phép, nghỉ việc riêng'}
                  onChange={(e) => setFormData({ ...formData, tieuDePhu: e.target.value })}
                  placeholder="Về việc xin nghỉ phép, nghỉ việc riêng"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Nơi kính gửi:
                </label>
                <input
                  type="text"
                  value={formData.kinhGui || 'BCH Công an xã Bát Tràng, Công an TP Hà Nội'}
                  onChange={(e) => setFormData({ ...formData, kinhGui: e.target.value })}
                  placeholder="BCH Công an xã Bát Tràng, Công an TP Hà Nội"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Địa danh:
                  </label>
                  <input
                    type="text"
                    value={formData.diaDanh || 'Bát Tràng'}
                    onChange={(e) => setFormData({ ...formData, diaDanh: e.target.value })}
                    placeholder="Bát Tràng"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    VD: &ldquo;{formData.diaDanh || 'Bát Tràng'}, ngày ...&rdquo;
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Tên đơn vị công tác:
                  </label>
                  <input
                    type="text"
                    value={formData.tenDonVi || 'Công an xã Bát Tràng'}
                    onChange={(e) => setFormData({ ...formData, tenDonVi: e.target.value })}
                    placeholder="Công an xã Bát Tràng"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Khổ in văn bản:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition ${
                    formData.khoGiayIn === 'A4' ? 'bg-blue-50/70 border-blue-400 text-blue-950 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="khoGiayIn"
                      value="A4"
                      checked={formData.khoGiayIn === 'A4'}
                      onChange={() => setFormData({ ...formData, khoGiayIn: 'A4' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs block">Khổ A4 (Chuẩn)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Đầy đủ 4 khối ký trang trọng</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition ${
                    formData.khoGiayIn === 'A5' ? 'bg-blue-50/70 border-blue-400 text-blue-950 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="khoGiayIn"
                      value="A5"
                      checked={formData.khoGiayIn === 'A5'}
                      onChange={() => setFormData({ ...formData, khoGiayIn: 'A5' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs block">Khổ A5 (Nhỏ gọn)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Tiết kiệm giấy</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Căn cứ pháp lý */}
          {activeTab === 'basis' && (
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Đoạn văn bản căn cứ Thông tư và Công văn hướng dẫn:
                </label>
                <textarea
                  rows={6}
                  value={formData.canCuVanBan || ''}
                  onChange={(e) => setFormData({ ...formData, canCuVanBan: e.target.value })}
                  placeholder="Thực hiện Công văn số 9253/CAHN-PX01 ngày 17/12/2025 của Công an TP Hà Nội..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Được trích dẫn ngay trên 5 mục đề nghị nghỉ phép của cán bộ.
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Lời cam kết & Cảm ơn */}
          {activeTab === 'commitments' && (
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Đoạn cam kết chấp hành Điều lệnh CAND:
                </label>
                <textarea
                  rows={4}
                  value={formData.camKetDieuLenh || ''}
                  onChange={(e) => setFormData({ ...formData, camKetDieuLenh: e.target.value })}
                  placeholder="Trong thời gian nghỉ phép, tôi xin cam kết và xin hứa..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Lời cảm ơn cuối đơn:
                </label>
                <input
                  type="text"
                  value={formData.loiCamOn || 'Tôi xin chân thành cảm ơn!'}
                  onChange={(e) => setFormData({ ...formData, loiCamOn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 4: 4 Khối chữ ký xác nhận */}
          {activeTab === 'signatures' && (
            <div className="p-5 space-y-3.5 text-xs">
              <span className="font-bold text-slate-800 block text-xs">
                Cấu hình 4 khối chữ ký xác nhận trên đơn:
              </span>

              {/* Khối 1: Xác nhận của Tổ công tác */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <label className="block font-semibold text-slate-800">
                  1. Khối xác nhận của Tổ (Góc trên bên trái):
                </label>
                <input
                  type="text"
                  value={formData.tieuDeXacNhanTo || 'XÁC NHẬN CỦA {to}'}
                  onChange={(e) => setFormData({ ...formData, tieuDeXacNhanTo: e.target.value })}
                  placeholder="XÁC NHẬN CỦA {to}"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg uppercase font-bold text-slate-800 text-xs"
                />
                <span className="text-[10px] text-slate-400 block">
                  Giữ <code>{'{to}'}</code> để tự động điền: TỔ TỔNG HỢP, TỔ AN NINH, TỔ CẢNH SÁT KHU VỰC,...
                </span>
              </div>

              {/* Khối 2: Người báo cáo */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <label className="block font-semibold text-slate-800">
                  2. Khối người làm đơn (Góc trên bên phải):
                </label>
                <input
                  type="text"
                  value={formData.tieuDeNguoiBaoCao || 'NGƯỜI BÁO CÁO'}
                  onChange={(e) => setFormData({ ...formData, tieuDeNguoiBaoCao: e.target.value })}
                  placeholder="NGƯỜI BÁO CÁO"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg uppercase font-bold text-slate-800 text-xs"
                />
              </div>

              {/* Khối 3: Chỉ huy phụ trách */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <label className="block font-semibold text-slate-800">
                  3. Khối Chỉ huy phụ trách (Góc dưới bên trái):
                </label>
                <input
                  type="text"
                  value={formData.tieuDeChiHuyPhuTrach || 'XÁC NHẬN CỦA CHỈ HUY PHỤ TRÁCH'}
                  onChange={(e) => setFormData({ ...formData, tieuDeChiHuyPhuTrach: e.target.value })}
                  placeholder="XÁC NHẬN CỦA CHỈ HUY PHỤ TRÁCH"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg uppercase font-bold text-slate-800 text-xs"
                />
              </div>

              {/* Khối 4: Trưởng CAX */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block font-semibold text-slate-800">
                  4. Khối Trưởng CAX (Góc dưới bên phải):
                </label>
                <input
                  type="text"
                  value={formData.tieuDeTruongCAX || 'XÁC NHẬN CỦA TRƯỞNG CAX'}
                  onChange={(e) => setFormData({ ...formData, tieuDeTruongCAX: e.target.value })}
                  placeholder="XÁC NHẬN CỦA TRƯỞNG CAX"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg uppercase font-bold text-slate-800 text-xs"
                />

                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    Họ và tên Trưởng CAX:
                  </label>
                  <input
                    type="text"
                    value={formData.hoTenTruongCAX || 'Trung tá Phạm Trọng Nghĩa'}
                    onChange={(e) => setFormData({ ...formData, hoTenTruongCAX: e.target.value })}
                    placeholder="Trung tá Phạm Trọng Nghĩa"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-blue-950 text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hienThiDauPheDuyet}
                    onChange={(e) => setFormData({ ...formData, hienThiDauPheDuyet: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">
                    Hiển thị con dấu mộc đỏ điện tử &ldquo;[✓ ĐÃ PHÊ DUYỆT]&rdquo;
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * Mọi chỉnh sửa cập nhật trực tiếp trên bản xem trước bên phải
            </span>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition"
            >
              Lưu mẫu đơn này
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: BẢN XEM TRƯỚC TRỰC TIẾP (LIVE PREVIEW THEO ĐÚNG PDF) */}
        <div className="lg:col-span-7 bg-slate-200/90 rounded-2xl p-3 sm:p-5 border border-slate-300 shadow-inner overflow-hidden">
          {/* Header Preview Toolbar */}
          <div className="flex items-center justify-between mb-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Bản xem trước trực tiếp (Khổ {formData.khoGiayIn})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintTest}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In thử</span>
              </button>
            </div>
          </div>

          {/* Paper container - Simulated PDF paper sheet */}
          <div 
            className="bg-white mx-auto shadow-2xl border border-slate-300 text-slate-950 font-serif leading-relaxed max-w-[660px] p-6 sm:p-10 text-[12px] sm:text-[13px] print:shadow-none print:border-none print:m-0 print:w-full print:p-0"
          >
            {/* Header Quốc hiệu */}
            <div className="text-center mb-5">
              <div className="font-bold uppercase tracking-wide text-[13px] sm:text-[14px] text-slate-950">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="font-bold text-[11px] sm:text-[12px] text-slate-950 mt-0.5">
                Độc lập – Tự do – Hạnh phúc
              </div>
              <div className="w-36 h-[1.5px] bg-slate-950 mx-auto mt-1 mb-5"></div>
            </div>

            {/* Tiêu đề Đơn */}
            <div className="text-center my-4">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-950">
                {formData.tieuDeDon || 'ĐƠN ĐỀ NGHỊ'}
              </h2>
              <div className="text-[11px] sm:text-[12px] font-bold italic mt-0.5 text-slate-800">
                {formData.tieuDePhu || 'Về việc xin nghỉ phép, nghỉ việc riêng'}
              </div>
            </div>

            {/* Kính gửi */}
            <div className="text-center font-medium my-4 text-[11px] sm:text-[12px]">
              <span>Kính gửi: </span>
              <span className="font-semibold">{formData.kinhGui || 'BCH Công an xã Bát Tràng, Công an TP Hà Nội'}</span>
            </div>

            {/* Thông tin nhân thân cán bộ mẫu */}
            <div className="space-y-1 text-[11px] sm:text-[12px] text-slate-900 mt-3 leading-normal">
              <div className="flex justify-between items-baseline">
                <div>
                  <span>Tên tôi là: </span>
                  <span className="font-semibold">Phạm Trọng Nghĩa</span>
                </div>
                <div className="pr-4">
                  <span>Giới tính: </span>
                  <span>Nam.</span>
                </div>
              </div>

              <div>
                <span>Sinh ngày 17 tháng 9 năm 1993</span>
              </div>

              <div>
                <span>Quê quán: </span>
                <span>Xã Hải Thịnh, Tỉnh Ninh Bình</span>
              </div>

              <div>
                <span>Ngày vào CAND: 10/2011; Cấp bậc hàm: </span>
                <span className="font-semibold">Đại úy</span>
              </div>

              <div>
                <span>Chức vụ, đơn vị công tác: </span>
                <span>Cán bộ, {formData.tenDonVi || 'Công an xã Bát Tràng'}.</span>
              </div>
            </div>

            {/* Đoạn văn bản căn cứ */}
            <p className="text-justify text-[11px] sm:text-[12px] mt-3 indent-6 leading-relaxed">
              {formData.canCuVanBan}
            </p>

            {/* 5 mục danh sách đề nghị */}
            <div className="space-y-0.5 text-[11px] sm:text-[12px] mt-2.5 pl-3">
              <div>
                <span className="font-bold italic">1. Tổng số ngày được nghỉ phép trong năm 2026: </span>
                <span className="font-semibold">17 ngày;</span>
              </div>

              <div>
                <span className="font-bold italic">2. Đã nghỉ số ngày phép: </span>
                <span className="font-semibold">04/17 </span>
                <span>(tổng số ngày được nghỉ trong năm);</span>
              </div>

              <div>
                <span className="font-bold italic">3. Đề nghị nghỉ phép 05 ngày: </span>
                <span>từ ngày </span>
                <span className="font-semibold">29/8/2026</span>
                <span> đến hết ngày </span>
                <span className="font-semibold">02/9/2026</span>
              </div>

              <div>
                <span className="font-bold italic">4. Địa điểm nghỉ phép: </span>
                <span>Hải Thịnh, Ninh Bình;</span>
              </div>

              <div>
                <span className="font-bold italic">5. Lý do xin nghỉ phép: </span>
                <span>Giải quyết công việc gia đình;</span>
              </div>
            </div>

            {/* Cam kết & Cảm ơn */}
            <p className="text-justify text-[11px] sm:text-[12px] mt-3 indent-6 leading-relaxed">
              {formData.camKetDieuLenh}
            </p>

            <div className="font-bold italic text-[11px] sm:text-[12px] mt-1.5 pl-3">
              {formData.loiCamOn || 'Tôi xin chân thành cảm ơn!'}
            </div>

            {/* KHỐI CHỮ KÝ 4 BÊN THEO ĐÚNG MẪU PDF */}
            <div className="mt-6 space-y-8">
              {/* Hàng 1 */}
              <div className="grid grid-cols-2 gap-4 text-center text-[11px] sm:text-[12px]">
                <div>
                  <div className="font-bold uppercase tracking-wide">
                    {(formData.tieuDeXacNhanTo || 'XÁC NHẬN CỦA {to}').replace('{to}', 'TỔ TỔNG HỢP')}
                  </div>
                  <div className="h-16"></div>
                </div>

                <div>
                  <div className="italic text-[10px] sm:text-[11px] text-slate-800">
                    {formData.diaDanh || 'Bát Tràng'}, ngày 28 tháng 8 năm 2026
                  </div>
                  <div className="font-bold uppercase tracking-wide mt-0.5">
                    {formData.tieuDeNguoiBaoCao || 'NGƯỜI BÁO CÁO'}
                  </div>
                  <div className="h-14 flex items-end justify-center">
                    <span className="font-bold text-slate-950">Phạm Trọng Nghĩa</span>
                  </div>
                </div>
              </div>

              {/* Hàng 2 */}
              <div className="grid grid-cols-2 gap-4 text-center text-[11px] sm:text-[12px]">
                <div>
                  <div className="font-bold uppercase tracking-wide whitespace-pre-line leading-tight">
                    {formData.tieuDeChiHuyPhuTrach || 'XÁC NHẬN CỦA\nCHỈ HUY PHỤ TRÁCH'}
                  </div>
                  <div className="h-16"></div>
                </div>

                <div>
                  <div className="font-bold uppercase tracking-wide">
                    {formData.tieuDeTruongCAX || 'XÁC NHẬN CỦA TRƯỞNG CAX'}
                  </div>
                  <div className="h-16 flex items-center justify-center">
                    {formData.hienThiDauPheDuyet ? (
                      <span className="border-2 border-red-700 text-red-700 font-bold px-2.5 py-0.5 rounded text-[10px] rotate-[-5deg] uppercase shadow-2xs">
                        ✓ ĐÃ PHÊ DUYỆT
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">Chờ phê duyệt</span>
                    )}
                  </div>
                  {formData.hoTenTruongCAX && (
                    <div className="font-bold uppercase text-slate-950 text-[11px]">
                      {formData.hoTenTruongCAX}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
