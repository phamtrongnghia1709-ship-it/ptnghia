// Modal Cài đặt Hệ thống và Tham số Nghiệp vụ - Công an xã Bát Tràng
import React, { useState } from 'react';
import { Settings, Shield, RotateCcw, Save, X, Info, Printer } from 'lucide-react';
import { CauHinhHeThong } from '../../types';

interface SettingsModalProps {
  config: CauHinhHeThong;
  onSaveConfig: (cfg: CauHinhHeThong) => void;
  onResetData: () => void;
  onClose: () => void;
  onOpenSlipConfig?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSaveConfig,
  onResetData,
  onClose,
  onOpenSlipConfig,
}) => {
  const [formData, setFormData] = useState<CauHinhHeThong>({ ...config });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu (12 CBCS và các phiếu nghỉ kiểm thử của Công an xã Bát Tràng) không?'
    );
    if (confirmReset) {
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Cài đặt Hệ thống & Tham số Nghiệp vụ</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Tên đơn vị cấp trên:
            </label>
            <input
              type="text"
              required
              value={formData.tenDonViCapTren}
              onChange={(e) => setFormData({ ...formData, tenDonViCapTren: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Tên đơn vị:
            </label>
            <input
              type="text"
              required
              value={formData.tenDonVi}
              onChange={(e) => setFormData({ ...formData, tenDonVi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Địa chỉ đơn vị:
            </label>
            <input
              type="text"
              value={formData.diaChiDonVi}
              onChange={(e) => setFormData({ ...formData, diaChiDonVi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Số ngày phép cơ bản/năm:
              </label>
              <input
                type="number"
                min={10}
                max={30}
                required
                value={formData.phepCoBanMacDinh}
                onChange={(e) => setFormData({ ...formData, phepCoBanMacDinh: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-blue-900"
              />
              <span className="text-[10px] text-slate-400">Mặc định theo luật CAND: 15 ngày</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Chu kỳ thâm niên (năm/1 ngày phép):
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.chuKyTangPhepNam}
                onChange={(e) => setFormData({ ...formData, chuKyTangPhepNam: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-amber-800"
              />
              <span className="text-[10px] text-slate-400">Mặc định: Cứ 5 năm cộng 1 ngày</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Phương thức tính số ngày nghỉ trong phiếu:
            </label>
            <select
              value={formData.phuongThucTinhNgay}
              onChange={(e) => setFormData({ ...formData, phuongThucTinhNgay: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold text-slate-900"
            >
              <option value="lien_tuc">Tính theo ngày liên tục (Bao gồm Thứ 7, Chủ Nhật - Mặc định)</option>
              <option value="ngay_lam_viec">Chỉ tính ngày làm việc (Loại trừ Thứ 7 và Chủ Nhật)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Ngưỡng cảnh báo trùng quân số cùng tổ:
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={formData.canhBaoTrungQuanSoTo}
              onChange={(e) => setFormData({ ...formData, canhBaoTrungQuanSoTo: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
            <span className="text-[10px] text-slate-400">
              Cảnh báo khi có từ {formData.canhBaoTrungQuanSoTo} cán bộ trở lên trong cùng 1 tổ nghỉ trùng ngày
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Chức vụ người ký báo cáo:
              </label>
              <input
                type="text"
                value={formData.nguoiKyBaoCao}
                onChange={(e) => setFormData({ ...formData, nguoiKyBaoCao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Họ và tên người ký báo cáo:
              </label>
              <input
                type="text"
                value={formData.hoTenNguoiKy}
                onChange={(e) => setFormData({ ...formData, hoTenNguoiKy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Nút chuyển tới Cấu hình giấy nghỉ phép */}
          {onOpenSlipConfig && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-950 block text-xs">Mẫu in & Thể thức Giấy nghỉ phép</span>
                <span className="text-[10px] text-amber-800">Tùy chỉnh Quốc hiệu, Tiêu đề, Định dạng số văn bản, Chức danh ký duyệt</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSlipConfig();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cấu hình giấy phép →</span>
              </button>
            </div>
          )}

          {/* Nút Reset dữ liệu */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục dữ liệu mẫu ban đầu</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
