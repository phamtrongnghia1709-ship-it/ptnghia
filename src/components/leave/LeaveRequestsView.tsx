// Phân hệ Quản lý Phiếu nghỉ phép - Công an xã Bát Tràng
import React, { useState, useMemo } from 'react';
import { 
  FilePlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Printer, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  X,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  PhieuNghiPhep, 
  CanBo, 
  LoaiNghi, 
  TrangThaiPhieu, 
  ToCongTac, 
  CauHinhHeThong, 
  UserRole 
} from '../../types';
import { 
  tinhSoNgayNghi, 
  tinhTongHopPhepNamCanBo, 
  timPhieuTrungLap, 
  timTrungLichTrongTo, 
  dinhDangNgayVN 
} from '../../utils/calculator';
import { LeaveSlipModal } from './LeaveSlipModal';

interface LeaveRequestsViewProps {
  leaveRequests: PhieuNghiPhep[];
  officers: CanBo[];
  currentYear: number;
  config: CauHinhHeThong;
  currentRole: UserRole;
  onSaveRequest: (request: PhieuNghiPhep) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onCancelRequest: (requestId: string, reason: string) => void;
  onDeleteRequest: (requestId: string) => void;
  onOpenSlipConfig?: () => void;
}

export const LeaveRequestsView: React.FC<LeaveRequestsViewProps> = ({
  leaveRequests,
  officers,
  currentYear,
  config,
  currentRole,
  onSaveRequest,
  onApproveRequest,
  onRejectRequest,
  onCancelRequest,
  onDeleteRequest,
  onOpenSlipConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTo, setSelectedTo] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PhieuNghiPhep | null>(null);
  const [printingRequest, setPrintingRequest] = useState<PhieuNghiPhep | null>(null);

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Cancel modal state
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const LOAI_NGHI_OPTIONS: LoaiNghi[] = [
    'Nghỉ phép năm',
    'Nghỉ bù',
    'Nghỉ việc riêng',
    'Nghỉ theo chế độ khác',
  ];

  const TRANG_THAI_OPTIONS: TrangThaiPhieu[] = [
    'Chờ phê duyệt',
    'Đã phê duyệt',
    'Không phê duyệt',
    'Đã hủy',
  ];

  const TO_CONG_TAC_OPTIONS: ToCongTac[] = [
    'Lãnh đạo Chỉ huy Công an xã',
    'Tổ Tổng hợp',
    'Tổ An ninh',
    'Tổ Phòng chống tội phạm',
    'Tổ Cảnh sát trật tự',
    'Tổ Cảnh sát khu vực',
  ];

  // Lọc danh sách phiếu
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((p) => {
      const pYear = p.namNghi || new Date(p.ngayBatDau).getFullYear();
      if (pYear !== currentYear) return false;

      const matchSearch =
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hoTenCanBo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.maCanBo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lyDoNghi.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTo = selectedTo === 'all' || p.toCongTac === selectedTo;
      const matchType = selectedType === 'all' || p.loaiNghi === selectedType;
      const matchStatus = selectedStatus === 'all' || p.trangThai === selectedStatus;

      return matchSearch && matchTo && matchType && matchStatus;
    });
  }, [leaveRequests, currentYear, searchTerm, selectedTo, selectedType, selectedStatus]);

  // Khởi tạo phiếu mới
  const handleOpenCreate = () => {
    if (officers.length === 0) {
      alert('Chưa có danh sách cán bộ, chiến sĩ trong hệ thống. Vui lòng vào phân hệ "Danh sách CBCS" để thêm cán bộ trước!');
      return;
    }

    const nextNum = leaveRequests.length + 1;
    const newId = `PNP-${currentYear}-${String(nextNum).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);

    const defaultOfficer = officers.find(o => o.trangThaiCongTac === 'Đang công tác') || officers[0];

    const newReq: PhieuNghiPhep = {
      id: newId,
      ngayLapPhieu: today,
      maCanBo: defaultOfficer ? defaultOfficer.maCanBo : '',
      hoTenCanBo: defaultOfficer ? defaultOfficer.hoTen : '',
      toCongTac: defaultOfficer ? defaultOfficer.toCongTac : 'Tổ Tổng hợp',
      ngayBatDau: today,
      ngayKetThuc: today,
      soNgayNghi: 1,
      loaiNghi: 'Nghỉ phép năm',
      lyDoNghi: '',
      diaDiemNghi: '',
      nguoiPheDuyet: config.hoTenNguoiKy,
      chucVuNguoiDuyet: config.nguoiKyBaoCao,
      trangThai: 'Chờ phê duyệt',
      namNghi: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingRequest(newReq);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Quản lý Phiếu nghỉ phép CBCS – Năm {currentYear}</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {filteredRequests.length} phiếu
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Chỉ trừ ngày phép khi phiếu thuộc loại "Nghỉ phép năm" & có trạng thái "Đã phê duyệt". Khi hủy phiếu, hệ thống tự động hoàn lại ngày phép.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSlipConfig && (
            <button
              type="button"
              onClick={onOpenSlipConfig}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 transition shrink-0"
              title="Tùy chỉnh tiêu đề, mẫu in, con dấu & điều lệnh giấy nghỉ phép"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>Cấu hình mẫu in</span>
            </button>
          )}

          {currentRole !== 'viewer' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
            >
              <FilePlus className="w-4 h-4" />
              <span>Lập phiếu nghỉ phép mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu, tên CBCS, lý do..."
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Lọc theo loại nghỉ"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại nghỉ</option>
            {LOAI_NGHI_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái phê duyệt"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái duyệt</option>
            {TRANG_THAI_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng Danh sách Phiếu nghỉ phép */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                <th className="py-3 px-3">Mã phiếu</th>
                <th className="py-3 px-3">Ngày lập</th>
                <th className="py-3 px-3">Cán bộ chiến sĩ</th>
                <th className="py-3 px-3">Tổ công tác</th>
                <th className="py-3 px-3">Thời gian nghỉ</th>
                <th className="py-3 px-2 text-center">Số ngày</th>
                <th className="py-3 px-3">Loại nghỉ</th>
                <th className="py-3 px-3">Lý do nghỉ phép</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy phiếu nghỉ phép nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((p) => {
                  const isPending = p.trangThai === 'Chờ phê duyệt';
                  const isApproved = p.trangThai === 'Đã phê duyệt';
                  const isRejected = p.trangThai === 'Không phê duyệt';
                  const isCancelled = p.trangThai === 'Đã hủy';

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">
                        {p.id}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {dinhDangNgayVN(p.ngayLapPhieu)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div>{p.hoTenCanBo}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.maCanBo}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {p.toCongTac}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium">
                        {dinhDangNgayVN(p.ngayBatDau)} - {dinhDangNgayVN(p.ngayKetThuc)}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-sm">
                          {p.soNgayNghi}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.loaiNghi === 'Nghỉ phép năm'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : p.loaiNghi === 'Nghỉ bù'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.loaiNghi}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[220px] truncate text-slate-600" title={p.lyDoNghi}>
                        {p.lyDoNghi}
                        {p.diaDiemNghi && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            Nơi nghỉ: {p.diaDiemNghi}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          isRejected ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          {isCancelled && <Ban className="w-3 h-3 text-slate-500" />}
                          <span>{p.trangThai}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* In Giấy nghỉ phép */}
                          <button
                            onClick={() => setPrintingRequest(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                            title="In Giấy nghỉ phép chuẩn CAND"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Phê duyệt nhanh nếu đang Chờ duyệt */}
                          {currentRole !== 'viewer' && isPending && (
                            <>
                              <button
                                onClick={() => onApproveRequest(p.id)}
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
                                title="Phê duyệt phiếu"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(p.id);
                                  setRejectReason('');
                                }}
                                className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition"
                                title="Không phê duyệt"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Hủy phiếu nếu Đã phê duyệt (Hoàn lại ngày phép) */}
                          {currentRole !== 'viewer' && isApproved && (
                            <button
                              onClick={() => {
                                setCancelingId(p.id);
                                setCancelReason('');
                              }}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition"
                              title="Hủy phiếu (Hoàn lại ngày phép)"
                            >
                              <Ban className="w-4 h-4" />
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

      {/* Modal Lập / Chỉnh sửa Phiếu nghỉ phép */}
      {isCreateModalOpen && editingRequest && (
        <LeaveRequestEditModal
          request={editingRequest}
          officers={officers}
          allRequests={leaveRequests}
          currentYear={currentYear}
          config={config}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingRequest(null);
          }}
          onSave={(saved) => {
            onSaveRequest(saved);
            setIsCreateModalOpen(false);
            setEditingRequest(null);
          }}
        />
      )}

      {/* Modal In Giấy Nghỉ Phép */}
      {printingRequest && (
        <LeaveSlipModal
          leave={printingRequest}
          officer={officers.find(o => o.maCanBo === printingRequest.maCanBo)}
          config={config}
          onClose={() => setPrintingRequest(null)}
        />
      )}

      {/* Modal Từ chối duyệt */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-rose-900 mb-2">Không phê duyệt phiếu nghỉ</h3>
            <p className="text-xs text-slate-600 mb-3">
              Vui lòng nhập lý do không phê duyệt để thông báo cho cán bộ:
            </p>
            <textarea
              rows={3}
              placeholder="VD: Quân số trực chiến không bảo đảm..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onRejectRequest(rejectingId, rejectReason || 'Không đủ quân số');
                  setRejectingId(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hủy phiếu */}
      {cancelingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-amber-900 mb-2">Hủy phiếu nghỉ phép</h3>
            <p className="text-xs text-slate-600 mb-2">
              Phiếu này sẽ chuyển sang trạng thái <strong>"Đã hủy"</strong> và hệ thống sẽ <strong>tự động hoàn lại số ngày phép</strong> cho cán bộ.
            </p>
            <textarea
              rows={2}
              placeholder="Lý do hủy phiếu..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelingId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Hủy thao tác
              </button>
              <button
                onClick={() => {
                  onCancelRequest(cancelingId, cancelReason || 'Cán bộ đề nghị hủy');
                  setCancelingId(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white"
              >
                Xác nhận hủy phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Tạo / Chỉnh sửa Phiếu Nghỉ Phép với đầy đủ Validation
interface LeaveRequestEditModalProps {
  request: PhieuNghiPhep;
  officers: CanBo[];
  allRequests: PhieuNghiPhep[];
  currentYear: number;
  config: CauHinhHeThong;
  onClose: () => void;
  onSave: (req: PhieuNghiPhep) => void;
}

const LeaveRequestEditModal: React.FC<LeaveRequestEditModalProps> = ({
  request,
  officers,
  allRequests,
  currentYear,
  config,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PhieuNghiPhep>({ ...request });

  // Chọn cán bộ
  const selectedOfficer = useMemo(() => {
    return officers.find(o => o.maCanBo === formData.maCanBo) || officers[0];
  }, [officers, formData.maCanBo]);

  // Quỹ phép năm của cán bộ được chọn
  const leaveSummary = useMemo(() => {
    if (!selectedOfficer) return null;
    return tinhTongHopPhepNamCanBo(selectedOfficer, currentYear, allRequests);
  }, [selectedOfficer, currentYear, allRequests]);

  // Tự động tính số ngày nghỉ khi đổi ngày bắt đầu hoặc ngày kết thúc
  const calculatedDays = useMemo(() => {
    return tinhSoNgayNghi(formData.ngayBatDau, formData.ngayKetThuc, config.phuongThucTinhNgay);
  }, [formData.ngayBatDau, formData.ngayKetThuc, config.phuongThucTinhNgay]);

  // Kiểm tra ngày kết thúc trước ngày bắt đầu
  const isDateInvalid = useMemo(() => {
    if (!formData.ngayBatDau || !formData.ngayKetThuc) return false;
    return formData.ngayKetThuc < formData.ngayBatDau;
  }, [formData.ngayBatDau, formData.ngayKetThuc]);

  // Kiểm tra trùng ngày với các phiếu khác của cán bộ này
  const duplicateTickets = useMemo(() => {
    if (!formData.maCanBo || !formData.ngayBatDau || !formData.ngayKetThuc) return [];
    return timPhieuTrungLap(
      formData.maCanBo,
      formData.ngayBatDau,
      formData.ngayKetThuc,
      allRequests,
      formData.id
    );
  }, [formData.maCanBo, formData.ngayBatDau, formData.ngayKetThuc, allRequests, formData.id]);

  // Kiểm tra cảnh báo trùng lịch trong cùng tổ công tác
  const unitColleagueConflicts = useMemo(() => {
    if (!formData.toCongTac || !formData.ngayBatDau || !formData.ngayKetThuc) return [];
    return timTrungLichTrongTo(
      formData.toCongTac,
      formData.ngayBatDau,
      formData.ngayKetThuc,
      allRequests,
      formData.maCanBo,
      formData.id
    );
  }, [formData.toCongTac, formData.ngayBatDau, formData.ngayKetThuc, allRequests, formData.maCanBo, formData.id]);

  // Kiểm tra nếu nghỉ phép năm vượt số phép còn lại
  const isOverQuota = useMemo(() => {
    if (formData.loaiNghi !== 'Nghỉ phép năm' || !leaveSummary) return false;
    return calculatedDays > leaveSummary.phepConLai;
  }, [formData.loaiNghi, calculatedDays, leaveSummary]);

  const handleOfficerChange = (maCB: string) => {
    const off = officers.find(o => o.maCanBo === maCB);
    if (off) {
      setFormData(prev => ({
        ...prev,
        maCanBo: off.maCanBo,
        hoTenCanBo: off.hoTen,
        toCongTac: off.toCongTac,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDateInvalid) {
      alert('Lỗi: Ngày kết thúc không được trước ngày bắt đầu!');
      return;
    }

    if (!formData.lyDoNghi.trim()) {
      alert('Vui lòng nhập lý do xin nghỉ phép!');
      return;
    }

    if (duplicateTickets.length > 0) {
      const confirmDup = window.confirm(
        `Cảnh báo: Cán bộ này đã có phiếu nghỉ trùng ngày (${duplicateTickets[0].id}: ${duplicateTickets[0].ngayBatDau} đến ${duplicateTickets[0].ngayKetThuc}). Bạn có chắc chắn muốn tiếp tục lưu không?`
      );
      if (!confirmDup) return;
    }

    if (isOverQuota) {
      const confirmOver = window.confirm(
        `Cảnh báo: Số ngày đăng ký (${calculatedDays} ngày) vượt quá số phép còn lại (${leaveSummary?.phepConLai} ngày) của đồng chí ${formData.hoTenCanBo}. Bạn có chắc chắn muốn lập phiếu này không?`
      );
      if (!confirmOver) return;
    }

    onSave({
      ...formData,
      soNgayNghi: calculatedDays,
      namNghi: new Date(formData.ngayBatDau).getFullYear(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              Lập phiếu đăng ký nghỉ phép CBCS
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Chọn cán bộ & Thông tin tổ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã phiếu nghỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={formData.id}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày lập phiếu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.ngayLapPhieu}
                onChange={(e) => setFormData({ ...formData, ngayLapPhieu: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Chọn Cán bộ, Chiến sĩ xin nghỉ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.maCanBo}
                onChange={(e) => handleOfficerChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
              >
                {officers.map((o) => (
                  <option key={o.id} value={o.maCanBo}>
                    {o.maCanBo} - {o.capBac} {o.hoTen} ({o.toCongTac})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hộp Thống kê tình hình phép hiện tại của Cán bộ */}
          {leaveSummary && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Quỹ phép năm {currentYear}:</span>
                <span className="font-bold text-slate-900 ml-1">
                  Được hưởng {leaveSummary.tongPhepDuocHuong} ngày
                </span>
                <span className="text-slate-400 mx-1">|</span>
                <span className="text-amber-800">Đã nghỉ: {leaveSummary.phepDaNghi} ngày</span>
              </div>
              <div className="font-bold">
                <span className="text-slate-600">Còn lại: </span>
                <span className={`text-sm ${leaveSummary.phepConLai <= 2 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {leaveSummary.phepConLai} ngày
                </span>
              </div>
            </div>
          )}

          {/* Chọn ngày bắt đầu, ngày kết thúc và loại nghỉ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày bắt đầu nghỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.ngayBatDau}
                onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày kết thúc nghỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.ngayKetThuc}
                onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tổng số ngày tính toán:
              </label>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg font-black text-sm text-blue-900 flex items-center justify-between">
                <span>{calculatedDays} ngày</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({config.phuongThucTinhNgay === 'lien_tuc' ? 'Liên tục' : 'Ngày làm việc'})
                </span>
              </div>
            </div>
          </div>

          {/* Cảnh báo lỗi ngày */}
          {isDateInvalid && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Lỗi: Ngày kết thúc không thể trước ngày bắt đầu nghỉ!</span>
            </div>
          )}

          {/* Cảnh báo trùng lặp phiếu cùng cán bộ */}
          {duplicateTickets.length > 0 && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo trùng lặp phiếu:</strong> Đồng chí {formData.hoTenCanBo} đã có phiếu nghỉ{' '}
                <span className="font-mono font-bold">{duplicateTickets[0].id}</span> từ ngày{' '}
                {dinhDangNgayVN(duplicateTickets[0].ngayBatDau)} đến {dinhDangNgayVN(duplicateTickets[0].ngayKetThuc)}.
              </div>
            </div>
          )}

          {/* Cảnh báo quân số đồng đội cùng tổ nghỉ trùng ngày */}
          {unitColleagueConflicts.length > 0 && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo quân số tổ công tác:</strong> Trong khoảng thời gian này, {formData.toCongTac} đã có đồng chí{' '}
                <span className="font-bold">{unitColleagueConflicts.map(c => c.hoTenCanBo).join(', ')}</span> đăng ký nghỉ.
                Chỉ huy đơn vị lưu ý cân đối quân số thường trực!
              </div>
            </div>
          )}

          {/* Cảnh báo vượt quá quỹ phép còn lại */}
          {isOverQuota && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Cảnh báo: Số ngày đăng ký ({calculatedDays} ngày) vượt quá số phép năm còn lại ({leaveSummary?.phepConLai} ngày)!
              </span>
            </div>
          )}

          {/* Loại nghỉ & Người phê duyệt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Loại nghỉ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.loaiNghi}
                onChange={(e) => setFormData({ ...formData, loaiNghi: e.target.value as LoaiNghi })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="Nghỉ phép năm">Nghỉ phép năm (Trừ vào quỹ phép)</option>
                <option value="Nghỉ bù">Nghỉ bù (Không trừ phép năm)</option>
                <option value="Nghỉ việc riêng">Nghỉ việc riêng (Không trừ phép năm)</option>
                <option value="Nghỉ theo chế độ khác">Nghỉ theo chế độ khác</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Người phê duyệt
              </label>
              <input
                type="text"
                value={formData.nguoiPheDuyet}
                onChange={(e) => setFormData({ ...formData, nguoiPheDuyet: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Lý do nghỉ & Địa điểm */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lý do xin nghỉ phép <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="VD: Giải quyết công việc gia đình kết hợp thăm người thân..."
              value={formData.lyDoNghi}
              onChange={(e) => setFormData({ ...formData, lyDoNghi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Địa điểm nơi nghỉ phép (Địa chỉ liên hệ khi cần)
            </label>
            <input
              type="text"
              placeholder="VD: Xã Bát Tràng, huyện Gia Lâm, Hà Nội"
              value={formData.diaDiemNghi || ''}
              onChange={(e) => setFormData({ ...formData, diaDiemNghi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          {/* Nút thao tác */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isDateInvalid}
              className="px-5 py-2 rounded-xl font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition disabled:opacity-50"
            >
              Lưu phiếu đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
