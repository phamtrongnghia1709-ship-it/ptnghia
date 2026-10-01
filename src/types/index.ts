// Định nghĩa các kiểu dữ liệu cho Phần mềm Quản lý Nghỉ phép CBCS - Công an xã Bát Tràng

export type CapBac = 
  | 'Binh nhì'
  | 'Binh nhất'
  | 'Hạ sĩ'
  | 'Trung sĩ'
  | 'Thượng sĩ'
  | 'Thiếu úy'
  | 'Trung úy'
  | 'Thượng úy'
  | 'Đại úy'
  | 'Thiếu tá'
  | 'Trung tá'
  | 'Thượng tá'
  | 'Đại tá';

export type ChucVu = 
  | 'Trưởng Công an xã'
  | 'Phó Trưởng Công an xã'
  | 'Cán bộ'
  | 'Chiến sĩ nghĩa vụ';

export type ToCongTac = 
  | 'Lãnh đạo Chỉ huy Công an xã'
  | 'Tổ Tổng hợp'
  | 'Tổ An ninh'
  | 'Tổ Phòng chống tội phạm'
  | 'Tổ Cảnh sát trật tự'
  | 'Tổ Cảnh sát khu vực';

export type TrangThaiCongTac = 'Đang công tác' | 'Chuyển công tác' | 'Nghỉ hưu/Xuất ngũ';

export type LoaiNghi = 
  | 'Nghỉ phép năm'
  | 'Nghỉ bù'
  | 'Nghỉ việc riêng'
  | 'Nghỉ theo chế độ khác';

export type TrangThaiPhieu = 
  | 'Chờ phê duyệt'
  | 'Đã phê duyệt'
  | 'Không phê duyệt'
  | 'Đã hủy';

export type TrangThaiPhepNam = 
  | 'Chưa nghỉ phép'
  | 'Đang sử dụng'
  | 'Còn ít phép'
  | 'Đã hết phép'
  | 'Vượt phép';

export type UserRole = 'admin' | 'tham_muu' | 'viewer';

export interface CanBo {
  id: string; // STT / ID nội bộ
  maCanBo: string; // Duy nhất: vd CA-BT001
  hoTen: string;
  soHieuCAND?: string; // Số hiệu CAND nếu có
  ngaySinh?: string;
  queQuan?: string; // Quê quán (Xã, Huyện, Tỉnh)
  gioiTinh: 'Nam' | 'Nữ';
  capBac: CapBac;
  chucVu: ChucVu;
  toCongTac: ToCongTac;
  ngayVaoCAND: string; // YYYY-MM-DD
  soDienThoai?: string;
  trangThaiCongTac: TrangThaiCongTac;
  ghiChu?: string;
  ngayChuyenCongTac?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhieuNghiPhep {
  id: string; // Mã phiếu: vd PNP-2026-001
  ngayLapPhieu: string; // YYYY-MM-DD
  maCanBo: string;
  hoTenCanBo: string;
  toCongTac: ToCongTac;
  ngayBatDau: string; // YYYY-MM-DD
  ngayKetThuc: string; // YYYY-MM-DD
  soNgayNghi: number;
  loaiNghi: LoaiNghi;
  lyDoNghi: string;
  diaDiemNghi?: string; // Nơi nghỉ phép (quê quán, địa chỉ liên hệ)
  nguoiPheDuyet: string; // Tên người duyệt, vd: Trưởng CAX
  chucVuNguoiDuyet?: string;
  trangThai: TrangThaiPhieu;
  ngayPheDuyet?: string;
  lyDoTuChoi?: string;
  ghiChu?: string;
  namNghi: number; // Năm tính phép
  createdAt: string;
  updatedAt: string;
}

export interface TheoDoiPhepNam {
  maCanBo: string;
  nam: number;
  soNamCongTac: number; // Tính đến năm xét
  soThangLe: number;
  phepCoBan: number; // Mặc định 15
  phepTangThem: number; // INT(soNamCongTac/5)
  tongPhepDuocHuong: number; // 15 + phepTangThem
  phepDaNghi: number; // Chỉ tính loại 'Nghỉ phép năm' & 'Đã phê duyệt'
  phepConLai: number; // tongPhepDuocHuong - phepDaNghi
  tyLeSuDung: number; // (phepDaNghi / tongPhepDuocHuong) * 100
  trangThai: TrangThaiPhepNam;
}

export interface NhatKyHeThong {
  id: string;
  thoiGian: string; // ISO String
  nguoiThucHien: string;
  vaiTro: string;
  hanhDong: string; // vd: "Tạo phiếu nghỉ phép", "Duyệt phiếu", "Thêm cán bộ"
  chiTiet: string;
  duLieuTruoc?: string;
  duLieuSau?: string;
}

export interface CauHinhGiayNghiPhep {
  tieuDeDon: string; // Mặc định: "ĐƠN ĐỀ NGHỊ"
  tieuDePhu: string; // Mặc định: "Về việc xin nghỉ phép, nghỉ việc riêng"
  kinhGui: string; // "BCH Công an xã Bát Tràng, Công an TP Hà Nội"
  donViCapTren: string; // "CÔNG AN TP HÀ NỘI"
  tenDonVi: string; // "Công an xã Bát Tràng"
  diaDanh: string; // "Bát Tràng"
  canCuVanBan: string; // Văn bản căn cứ thông tư & công văn hướng dẫn
  camKetDieuLenh: string; // Đoạn cam kết thực hiện đúng điều lệ Đảng, quản lý cán bộ, điều lệnh CAND
  loiCamOn: string; // "Tôi xin chân thành cảm ơn!"
  tieuDeNguoiBaoCao: string; // "NGƯỜI BÁO CÁO"
  tieuDeXacNhanTo: string; // "XÁC NHẬN CỦA {to}"
  tieuDeChiHuyPhuTrach: string; // "XÁC NHẬN CỦA CHỈ HUY PHỤ TRÁCH"
  tieuDeTruongCAX: string; // "XÁC NHẬN CỦA TRƯỞNG CAX"
  hoTenTruongCAX: string; // "Trung tá Phạm Trọng Nghĩa"
  hienThiDauPheDuyet: boolean;
  khoGiayIn: 'A4' | 'A5';

  // Thuộc tính tương thích
  tieuDeGiay?: string;
  soGiayFormat?: string;
  chucDanhCapGiay?: string;
  chucDanhNguoiKy?: string;
  hoTenNguoiKy?: string;
  chucDanhNguoiNop?: string;
  hienThiSoHieuCAND?: boolean;
  hienThiSoDienThoai?: boolean;
  hienThiDiaDiem?: boolean;
  noiDungLuuY?: string;
}

export interface CauHinhHeThong {
  tenDonViCapTren: string; // vd: "CÔNG AN THÀNH PHỐ HÀ NỘI - CÔNG AN HUYỆN GIA LÂM"
  tenDonVi: string; // "CÔNG AN XÃ BÁT TRÀNG"
  diaChiDonVi: string; // "Xã Bát Tràng, huyện Gia Lâm, TP Hà Nội"
  phepCoBanMacDinh: number; // 15
  chuKyTangPhepNam: number; // 5 năm thêm 1 ngày
  phuongThucTinhNgay: 'lien_tuc' | 'ngay_lam_viec'; // Liên tục (tính cả T7, CN) hoặc trừ T7, CN
  canhBaoTrungQuanSoTo: number; // Cảnh báo nếu số CBCS trong 1 tổ nghỉ trùng >= X (mặc định 2)
  nguoiKyBaoCao: string; // vd: "Trưởng Công an xã"
  hoTenNguoiKy: string;
  gasWebAppUrl?: string; // URL Google Apps Script Web App
  lastSyncTime?: string;
  autoSync: boolean;
  cauHinhGiayNghiPhep?: CauHinhGiayNghiPhep;
}

export interface StatDashboard {
  tongCBCS: number;
  tongPhepDuocHuong: number;
  tongPhepDaNghi: number;
  tongPhepConLai: number;
  soChuaNghi: number;
  soHetPhep: number;
  soConDuoi3Ngay: number;
  soVuotPhep: number;
  tongLuotNghiTrongThang: number;
  cbcsDangNghiHomNay: number;
}

export interface TaiKhoan {
  id: string;
  tenDangNhap: string; // Tên đăng nhập hoặc mã cán bộ
  matKhau: string; // Mật khẩu
  maCanBo?: string; // Liên kết hồ sơ CBCS
  hoTen: string;
  vaiTro: UserRole; // 'admin' | 'tham_muu' | 'viewer'
  capBac?: CapBac;
  chucVu?: ChucVu;
  toCongTac?: ToCongTac;
  soDienThoai?: string;
  kichHoat: boolean; // true: Hoạt động, false: Bị khóa
  lanDangNhapCuoi?: string;
  createdAt: string;
}

export interface AuthSession {
  user: TaiKhoan;
  loginTime: string;
}
