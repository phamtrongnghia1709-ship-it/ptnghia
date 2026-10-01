// Phân hệ Quản lý Danh sách Cán bộ, Chiến sĩ - Công an xã Bát Tràng
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  UserMinus, 
  Calendar, 
  Award, 
  ShieldCheck, 
  FileSpreadsheet, 
  Phone, 
  Clock, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { CanBo, CapBac, ChucVu, ToCongTac, TrangThaiCongTac, PhieuNghiPhep, UserRole } from '../../types';
import { tinhThamNien, tinhSoNgayPhepTheoNam, dinhDangNgayVN } from '../../utils/calculator';

interface OfficerManagementProps {
  officers: CanBo[];
  leaveRequests: PhieuNghiPhep[];
  currentYear: number;
  currentRole: UserRole;
  onSaveOfficer: (officer: CanBo) => void;
  onTransferOfficer: (officerId: string, ngayChuyen: string, ghiChu: string) => void;
}

export const OfficerManagement: React.FC<OfficerManagementProps> = ({
  officers,
  leaveRequests,
  currentYear,
  currentRole,
  onSaveOfficer,
  onTransferOfficer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTo, setSelectedTo] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [editingOfficer, setEditingOfficer] = useState<CanBo | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingOfficer, setViewingOfficer] = useState<CanBo | null>(null);
  const [transferingOfficer, setTransferingOfficer] = useState<CanBo | null>(null);

  const TO_CONG_TAC_OPTIONS: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  const CAP_BAC_OPTIONS: CapBac[] = [
    'Binh nhì', 'Binh nhất', 'Hạ sĩ', 'Trung sĩ', 'Thượng sĩ',
    'Thiếu úy', 'Trung úy', 'Thượng úy', 'Đại úy', 'Thiếu tá',
    'Trung tá', 'Thượng tá', 'Đại tá'
  ];

  const CHUC_VU_OPTIONS: ChucVu[] = [
    'Trưởng Công an xã',
    'Phó Trưởng Công an xã',
    'Cán bộ',
    'Chiến sĩ nghĩa vụ',
  ];

  // Lọc và tìm kiếm
  const filteredOfficers = useMemo(() => {
    return officers.filter((cb) => {
      const matchSearch = 
        cb.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cb.maCanBo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cb.soHieuCAND && cb.soHieuCAND.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cb.soDienThoai && cb.soDienThoai.includes(searchTerm));

      const matchTo = selectedTo === 'all' || cb.toCongTac === selectedTo;
      const matchStatus = selectedStatus === 'all' || cb.trangThaiCongTac === selectedStatus;

      return matchSearch && matchTo && matchStatus;
    });
  }, [officers, searchTerm, selectedTo, selectedStatus]);

  // Handle open add modal
  const handleOpenAdd = () => {
    const nextIndex = officers.length + 1;
    const newMaCanBo = `CAX-BT${String(nextIndex).padStart(2, '0')}`;
    const newOfficer: CanBo = {
      id: String(Date.now()),
      maCanBo: newMaCanBo,
      hoTen: '',
      gioiTinh: 'Nam',
      capBac: 'Thượng úy',
      chucVu: 'Cán bộ',
      toCongTac: 'Tổ Tổng hợp',
      ngayVaoCAND: '2020-01-01',
      trangThaiCongTac: 'Đang công tác',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingOfficer(newOfficer);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Danh sách Cán bộ, Chiến sĩ Công an xã Bát Tràng</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {filteredOfficers.length} Đ/c
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Hệ thống tự động tính toán thâm niên và ngày phép theo công thức: 15 + INT(Năm công tác / 5)
          </p>
        </div>

        {currentRole !== 'viewer' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm CBCS mới</span>
          </button>
        )}
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã cán bộ, số hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            aria-label="Lọc danh sách theo tổ công tác"
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
            aria-label="Lọc danh sách theo trạng thái công tác"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái công tác</option>
            <option value="Đang công tác">Đang công tác</option>
            <option value="Chuyển công tác">Đã chuyển công tác</option>
            <option value="Nghỉ hưu/Xuất ngũ">Nghỉ hưu/Xuất ngũ</option>
          </select>
        </div>
      </div>

      {/* Bảng Danh sách CBCS Chuẩn CAND (Section IV.2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Mã CBCS</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Cấp bậc</th>
                <th className="py-3 px-3">Chức vụ</th>
                <th className="py-3 px-3">Tổ công tác</th>
                <th className="py-3 px-3">Ngày vào CAND</th>
                <th className="py-3 px-2 text-center" title="Số năm công tác chính xác (không làm tròn)">Thâm niên</th>
                <th className="py-3 px-2 text-center bg-slate-800" title="Phép cơ bản">Cơ bản</th>
                <th className="py-3 px-2 text-center bg-slate-800" title="Phép tăng thêm: INT(năm/5)">Thâm niên</th>
                <th className="py-3 px-3 text-center bg-blue-900 text-amber-300 font-bold" title="Tổng phép năm = Cơ bản + Thâm niên">Tổng phép</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    Không tìm thấy cán bộ, chiến sĩ nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((cb, index) => {
                  const phepCalc = tinhSoNgayPhepTheoNam(cb.ngayVaoCAND, currentYear);
                  const isTransferred = cb.trangThaiCongTac === 'Chuyển công tác';

                  return (
                    <tr 
                      key={cb.id} 
                      className={`hover:bg-blue-50/50 transition ${isTransferred ? 'bg-slate-50/80 text-slate-500' : ''}`}
                    >
                      <td className="py-3 px-3 text-center font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">
                        {cb.maCanBo}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{cb.hoTen}</span>
                          {cb.gioiTinh === 'Nữ' && (
                            <span className="text-[10px] bg-pink-100 text-pink-700 px-1 rounded">Nữ</span>
                          )}
                        </div>
                        {cb.soHieuCAND && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            SH: {cb.soHieuCAND}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                          {cb.capBac}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {cb.chucVu}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {cb.toCongTac}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {dinhDangNgayVN(cb.ngayVaoCAND)}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-indigo-950 whitespace-nowrap">
                        <span className="font-bold text-sm text-indigo-700">{phepCalc.soNamCongTac}</span> năm
                        {phepCalc.soThangLe > 0 && (
                          <span className="text-[10px] text-slate-500 block">+{phepCalc.soThangLe} tháng</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700 bg-slate-50">
                        {phepCalc.phepCoBan}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-amber-700 bg-slate-50">
                        +{phepCalc.phepTangThem}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-sm bg-blue-50 text-blue-900">
                        {phepCalc.tongPhepDuocHuong} <span className="text-[10px] font-normal text-slate-500">ngày</span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cb.trangThaiCongTac === 'Đang công tác'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : cb.trangThaiCongTac === 'Chuyển công tác'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {cb.trangThaiCongTac}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Xem lịch sử nghỉ phép */}
                          <button
                            onClick={() => setViewingOfficer(cb)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                            title="Xem lịch sử nghỉ phép chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Sửa thông tin */}
                          {currentRole !== 'viewer' && (
                            <button
                              onClick={() => {
                                setEditingOfficer(cb);
                                setIsAddModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition"
                              title="Chỉnh sửa thông tin cán bộ"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Ngừng theo dõi / Chuyển công tác */}
                          {currentRole === 'admin' && cb.trangThaiCongTac === 'Đang công tác' && (
                            <button
                              onClick={() => setTransferingOfficer(cb)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                              title="Báo chuyển công tác (vẫn lưu lịch sử)"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Cán bộ */}
      {isAddModalOpen && editingOfficer && (
        <OfficerEditModal
          officer={editingOfficer}
          isNew={!officers.some(o => o.id === editingOfficer.id)}
          currentYear={currentYear}
          capBacOptions={CAP_BAC_OPTIONS}
          chucVuOptions={CHUC_VU_OPTIONS}
          toOptions={TO_CONG_TAC_OPTIONS}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingOfficer(null);
          }}
          onSave={(saved) => {
            onSaveOfficer(saved);
            setIsAddModalOpen(false);
            setEditingOfficer(null);
          }}
        />
      )}

      {/* Modal Xem chi tiết hồ sơ nghỉ phép */}
      {viewingOfficer && (
        <OfficerDetailHistoryModal
          officer={viewingOfficer}
          leaveRequests={leaveRequests}
          currentYear={currentYear}
          onClose={() => setViewingOfficer(null)}
        />
      )}

      {/* Modal Chuyển công tác */}
      {transferingOfficer && (
        <OfficerTransferModal
          officer={transferingOfficer}
          onClose={() => setTransferingOfficer(null)}
          onConfirm={(ngay, ghiChu) => {
            onTransferOfficer(transferingOfficer.id, ngay, ghiChu);
            setTransferingOfficer(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Thêm / Chỉnh sửa cán bộ
interface OfficerEditModalProps {
  officer: CanBo;
  isNew: boolean;
  currentYear: number;
  capBacOptions: CapBac[];
  chucVuOptions: ChucVu[];
  toOptions: ToCongTac[];
  onClose: () => void;
  onSave: (officer: CanBo) => void;
}

const OfficerEditModal: React.FC<OfficerEditModalProps> = ({
  officer,
  isNew,
  currentYear,
  capBacOptions,
  chucVuOptions,
  toOptions,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CanBo>({ ...officer });

  // Tự động tính thâm niên và ngày phép hiển thị ngay trong form
  const calc = useMemo(() => {
    return tinhSoNgayPhepTheoNam(formData.ngayVaoCAND, currentYear);
  }, [formData.ngayVaoCAND, currentYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen.trim()) {
      alert('Vui lòng nhập họ và tên cán bộ!');
      return;
    }
    if (!formData.ngayVaoCAND) {
      alert('Vui lòng chọn ngày vào CAND!');
      return;
    }
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              {isNew ? 'Thêm mới Cán bộ, Chiến sĩ' : `Chỉnh sửa thông tin: ${formData.hoTen}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã cán bộ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.maCanBo}
                onChange={(e) => setFormData({ ...formData, maCanBo: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số hiệu CAND
              </label>
              <input
                type="text"
                placeholder="VD: 182-456"
                value={formData.soHieuCAND || ''}
                onChange={(e) => setFormData({ ...formData, soHieuCAND: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên CBCS <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn Hùng"
                value={formData.hoTen}
                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính
              </label>
              <select
                value={formData.gioiTinh}
                onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.ngaySinh || ''}
                onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quê quán
              </label>
              <input
                type="text"
                placeholder="VD: Xã Hải Thịnh, Tỉnh Ninh Bình"
                value={formData.queQuan || ''}
                onChange={(e) => setFormData({ ...formData, queQuan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                placeholder="0912..."
                value={formData.soDienThoai || ''}
                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cấp bậc hàm
              </label>
              <select
                value={formData.capBac}
                onChange={(e) => setFormData({ ...formData, capBac: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                {capBacOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chức vụ
              </label>
              <select
                value={formData.chucVu}
                onChange={(e) => setFormData({ ...formData, chucVu: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                {chucVuOptions.map((cv) => (
                  <option key={cv} value={cv}>{cv}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tổ công tác <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.toCongTac}
                onChange={(e) => setFormData({ ...formData, toCongTac: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                {toOptions.map((to) => (
                  <option key={to} value={to}>{to}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày vào CAND (Ngày bắt đầu tính thâm niên) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.ngayVaoCAND}
                onChange={(e) => setFormData({ ...formData, ngayVaoCAND: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 bg-amber-50/50"
              />
            </div>
          </div>

          {/* Hộp tự động tính toán Thâm niên & Ngày phép theo công thức CAND */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
            <div className="font-bold text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Kết quả tính thâm niên & ngày phép năm {currentYear}:
              </span>
              <span className="text-[11px] text-blue-700 font-mono font-normal">
                Công thức: 15 + INT(Năm công tác / 5)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-white p-2 rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-500">Số năm công tác</div>
                <div className="text-base font-bold text-blue-900">
                  {calc.soNamCongTac} năm
                  {calc.soThangLe > 0 && <span className="text-[10px] block font-normal text-slate-500">+{calc.soThangLe} tháng</span>}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-500">Phép cơ bản</div>
                <div className="text-base font-bold text-slate-700">{calc.phepCoBan} ngày</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-500">Phép thâm niên</div>
                <div className="text-base font-bold text-amber-700">+{calc.phepTangThem} ngày</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-200 bg-blue-100/50">
                <div className="text-[10px] text-blue-800 font-semibold">Tổng phép hưởng</div>
                <div className="text-lg font-black text-blue-900">{calc.tongPhepDuocHuong} ngày</div>
              </div>
            </div>
            {calc.ngayDatMocTiepTheo && (
              <div className="text-[11px] text-slate-600 italic">
                * Mốc đạt thâm niên cộng thêm 01 ngày phép tiếp theo: <strong>{calc.ngayDatMocTiepTheo}</strong>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú công tác
            </label>
            <textarea
              rows={2}
              placeholder="Nhiệm vụ phụ trách, phân công địa bàn..."
              value={formData.ghiChu || ''}
              onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition"
            >
              {isNew ? 'Lưu cán bộ mới' : 'Cập nhật thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Chi tiết Hồ sơ nghỉ phép của 1 cán bộ
interface OfficerDetailHistoryModalProps {
  officer: CanBo;
  leaveRequests: PhieuNghiPhep[];
  currentYear: number;
  onClose: () => void;
}

const OfficerDetailHistoryModal: React.FC<OfficerDetailHistoryModalProps> = ({
  officer,
  leaveRequests,
  currentYear,
  onClose,
}) => {
  const calc = tinhSoNgayPhepTheoNam(officer.ngayVaoCAND, currentYear);

  // Lọc tất cả phiếu nghỉ của cán bộ này
  const officerLeaves = leaveRequests.filter((p) => p.maCanBo === officer.maCanBo);

  const leavesThisYear = officerLeaves.filter(
    (p) => (p.namNghi || new Date(p.ngayBatDau).getFullYear()) === currentYear
  );

  const phepDaNghiHopLe = leavesThisYear
    .filter((p) => p.loaiNghi === 'Nghỉ phép năm' && p.trangThai === 'Đã phê duyệt')
    .reduce((sum, p) => sum + p.soNgayNghi, 0);

  const phepConLai = calc.tongPhepDuocHuong - phepDaNghiHopLe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-400 font-mono font-semibold uppercase tracking-wider">
              HỒ SƠ NGHỈ PHÉP CÁN BỘ
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{officer.capBac} {officer.hoTen}</span>
              <span className="text-xs bg-slate-800 font-mono text-slate-300 px-2 py-0.5 rounded">
                {officer.maCanBo}
              </span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Thông tin thâm niên & Quỹ phép năm */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Tổ công tác:</span>
              <span className="font-semibold text-slate-900">{officer.toCongTac}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Ngày vào CAND:</span>
              <span className="font-mono font-bold text-slate-900">{dinhDangNgayVN(officer.ngayVaoCAND)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Thâm niên năm {currentYear}:</span>
              <span className="font-bold text-indigo-700">{calc.soNamCongTac} năm {calc.soThangLe > 0 ? `+${calc.soThangLe}th` : ''}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Trạng thái công tác:</span>
              <span className="font-bold text-emerald-700">{officer.trangThaiCongTac}</span>
            </div>
          </div>

          {/* Thẻ Quỹ phép năm */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
              <span className="text-blue-700 font-medium block">Phép được hưởng ({currentYear})</span>
              <span className="text-xl font-black text-blue-900">{calc.tongPhepDuocHuong}</span> ngày
              <span className="text-[10px] text-slate-500 block">(15 cơ bản + {calc.phepTangThem} thâm niên)</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <span className="text-amber-800 font-medium block">Đã nghỉ (Phép năm)</span>
              <span className="text-xl font-black text-amber-900">{phepDaNghiHopLe}</span> ngày
              <span className="text-[10px] text-slate-500 block">Chỉ tính phiếu đã phê duyệt</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <span className="text-emerald-800 font-medium block">Còn lại</span>
              <span className="text-xl font-black text-emerald-900">{phepConLai}</span> ngày
              <span className="text-[10px] text-slate-500 block">Sẵn sàng sử dụng</span>
            </div>
          </div>

          {/* Lịch sử tất cả các phiếu nghỉ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Lịch sử đăng ký nghỉ phép ({officerLeaves.length} phiếu)
              </h4>
            </div>

            {officerLeaves.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                Cán bộ chưa có phiếu đăng ký nghỉ phép nào trong hệ thống.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Mã phiếu</th>
                      <th className="py-2 px-3">Thời gian nghỉ</th>
                      <th className="py-2 px-2 text-center">Số ngày</th>
                      <th className="py-2 px-3">Loại nghỉ</th>
                      <th className="py-2 px-3">Lý do</th>
                      <th className="py-2 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {officerLeaves.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-900">{p.id}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {dinhDangNgayVN(p.ngayBatDau)} - {dinhDangNgayVN(p.ngayKetThuc)}
                        </td>
                        <td className="py-2 px-2 text-center font-bold">{p.soNgayNghi}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.loaiNghi === 'Nghỉ phép năm' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.loaiNghi}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate" title={p.lyDoNghi}>
                          {p.lyDoNghi}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.trangThai === 'Đã phê duyệt' ? 'bg-emerald-100 text-emerald-800' :
                            p.trangThai === 'Chờ phê duyệt' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {p.trangThai}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Chuyển công tác cán bộ
interface OfficerTransferModalProps {
  officer: CanBo;
  onClose: () => void;
  onConfirm: (ngayChuyen: string, ghiChu: string) => void;
}

const OfficerTransferModal: React.FC<OfficerTransferModalProps> = ({
  officer,
  onClose,
  onConfirm,
}) => {
  const [ngayChuyen, setNgayChuyen] = useState(new Date().toISOString().slice(0, 10));
  const [ghiChu, setGhiChu] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-rose-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserMinus className="w-5 h-5 text-rose-300" />
            <h3 className="font-bold text-sm">Chuyển công tác CBCS</h3>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs text-slate-700">
          <p>
            Đồng chí: <strong className="text-slate-900">{officer.capBac} {officer.hoTen}</strong> ({officer.maCanBo})
          </p>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
            * Lưu ý: Khi chuyển công tác, cán bộ sẽ được ngừng theo dõi trong quân số hiện tại của đơn vị, nhưng toàn bộ hồ sơ và lịch sử nghỉ phép vẫn được lưu giữ trọn vẹn để tra cứu, báo cáo.
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Ngày chuyển công tác:
            </label>
            <input
              type="date"
              value={ngayChuyen}
              onChange={(e) => setNgayChuyen(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Ghi chú đơn vị mới / Quyết định điều động:
            </label>
            <textarea
              rows={2}
              placeholder="VD: Điều động về Công an huyện Gia Lâm theo Quyết định số..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              onClick={() => onConfirm(ngayChuyen, ghiChu)}
              className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold shadow-sm"
            >
              Xác nhận chuyển
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
