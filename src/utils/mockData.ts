// Bộ dữ liệu khởi tạo chuẩn - Công an xã Bát Tràng
import { CanBo, PhieuNghiPhep, CauHinhHeThong, NhatKyHeThong, TaiKhoan, CauHinhGiayNghiPhep } from '../types';

export const DEFAULT_LEAVE_SLIP_CONFIG: CauHinhGiayNghiPhep = {
  tieuDeDon: 'ĐƠN ĐỀ NGHỊ',
  tieuDePhu: 'Về việc xin nghỉ phép, nghỉ việc riêng',
  kinhGui: 'BCH Công an xã Bát Tràng, Công an TP Hà Nội',
  donViCapTren: 'Công an TP Hà Nội',
  tenDonVi: 'Công an xã Bát Tràng',
  diaDanh: 'Bát Tràng',
  canCuVanBan:
    'Thực hiện Công văn số 9253/CAHN-PX01 ngày 17/12/2025 của Công an TP Hà Nội về việc hướng dẫn thực hiện Thông tư số 96/2025/TT-BCA ngày 06/10/2025 của Bộ Công an quy định về chế độ nghỉ hằng năm trong Công an nhân dân và Công văn số 2059/PX01-Đ1, ngày 16/4/2025 của Phòng Tổ chức cán bộ về việc thực hiện một số thẩm quyền trong công tác tổ chức cán bộ, tôi xin báo cáo và đề nghị như sau:',
  camKetDieuLenh:
    'Trong thời gian nghỉ phép, tôi xin cam kết và xin hứa thực hiện đúng quy định về Điều lệ Đảng, công tác quản lý cán bộ và điều lệnh Công an nhân dân. Nếu có vi phạm tôi xin chịu mọi hình thức xử lý theo quy định.',
  loiCamOn: 'Tôi xin chân thành cảm ơn!',
  tieuDeNguoiBaoCao: 'NGƯỜI BÁO CÁO',
  tieuDeXacNhanTo: 'XÁC NHẬN CỦA {to}',
  tieuDeChiHuyPhuTrach: 'XÁC NHẬN CỦA CHỈ HUY PHỤ TRÁCH',
  tieuDeTruongCAX: 'XÁC NHẬN CỦA TRƯỞNG CAX',
  hoTenTruongCAX: 'Trung tá Phạm Trọng Nghĩa',
  hienThiDauPheDuyet: true,
  khoGiayIn: 'A4',

  // Tương thích
  tieuDeGiay: 'ĐƠN ĐỀ NGHỊ',
  soGiayFormat: '{so}/GNP-CAX',
  chucDanhCapGiay: 'Trưởng Công an xã Bát Tràng cấp cho:',
  chucDanhNguoiKy: 'XÁC NHẬN CỦA TRƯỞNG CAX',
  hoTenNguoiKy: 'Trung tá Phạm Trọng Nghĩa',
  chucDanhNguoiNop: 'NGƯỜI BÁO CÁO',
  hienThiSoHieuCAND: true,
  hienThiSoDienThoai: true,
  hienThiDiaDiem: true,
  noiDungLuuY: '',
};

export const INITIAL_CONFIG: CauHinhHeThong = {
  tenDonViCapTren: 'CÔNG AN HUYỆN GIA LÂM - TP HÀ NỘI',
  tenDonVi: 'CÔNG AN XÃ BÁT TRÀNG',
  diaChiDonVi: 'Thôn Giang Cao, xã Bát Tràng, huyện Gia Lâm, TP. Hà Nội',
  phepCoBanMacDinh: 15,
  chuKyTangPhepNam: 5,
  phuongThucTinhNgay: 'lien_tuc',
  canhBaoTrungQuanSoTo: 2,
  nguoiKyBaoCao: 'Trưởng Công an xã',
  hoTenNguoiKy: 'Trung tá Phạm Trọng Nghĩa',
  gasWebAppUrl: '',
  autoSync: false,
  cauHinhGiayNghiPhep: DEFAULT_LEAVE_SLIP_CONFIG,
};

// Danh sách cán bộ để trống để người dùng tự nhập sau
export const INITIAL_OFFICERS: CanBo[] = [];

// Danh sách phiếu nghỉ phép để trống
export const INITIAL_LEAVE_REQUESTS: PhieuNghiPhep[] = [];

export const INITIAL_AUDIT_LOGS: NhatKyHeThong[] = [
  {
    id: 'LOG-001',
    thoiGian: '2026-01-01T08:00:00.000Z',
    nguoiThucHien: 'Hệ thống',
    vaiTro: 'Quản trị viên',
    hanhDong: 'Khởi tạo hệ thống',
    chiTiet: 'Khởi tạo hệ thống Quản lý ngày nghỉ phép Công an xã Bát Tràng (5 tổ công tác: Tổ Tổng hợp, Tổ An ninh, Tổ Phòng chống tội phạm, Tổ Cảnh sát trật tự, Tổ Cảnh sát khu vực)',
  },
];

// Chỉ để lại tài khoản quản trị duy nhất: quantricaxbattrang / admin@123
export const INITIAL_ACCOUNTS: TaiKhoan[] = [
  {
    id: 'ACC-ADMIN-BATTRANG',
    tenDangNhap: 'quantricaxbattrang',
    matKhau: 'admin@123',
    hoTen: 'Quản trị viên Công an xã Bát Tràng',
    vaiTro: 'admin',
    capBac: 'Trung tá',
    chucVu: 'Trưởng Công an xã',
    toCongTac: 'Lãnh đạo Chỉ huy Công an xã',
    soDienThoai: '',
    kichHoat: true,
    lanDangNhapCuoi: new Date().toISOString(),
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];
