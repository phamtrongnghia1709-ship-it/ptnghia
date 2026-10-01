// Tiện ích tính toán thâm niên, số ngày phép và kiểm tra quy tắc nghiệp vụ CAND
import { CanBo, PhieuNghiPhep, TheoDoiPhepNam, TrangThaiPhepNam } from '../types';

/**
 * Tính số năm và số tháng công tác chính xác từ ngày vào ngành CAND đến ngày mốc
 * Không làm tròn số năm.
 * @param ngayVaoStr Định dạng YYYY-MM-DD
 * @param targetDate Ngày mốc tính (mặc định là hôm nay)
 */
export function tinhThamNien(ngayVaoStr: string, targetDate: Date = new Date()): {
  soNam: number;
  soThangLe: number;
  soNgayLe: number;
  moTa: string;
} {
  if (!ngayVaoStr) {
    return { soNam: 0, soThangLe: 0, soNgayLe: 0, moTa: '0 năm' };
  }

  const ngayVao = new Date(ngayVaoStr);
  if (isNaN(ngayVao.getTime())) {
    return { soNam: 0, soThangLe: 0, soNgayLe: 0, moTa: 'Không xác định' };
  }

  const d1 = ngayVao;
  const d2 = targetDate;

  if (d2 < d1) {
    return { soNam: 0, soThangLe: 0, soNgayLe: 0, moTa: 'Chưa vào ngành' };
  }

  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months -= 1;
    // Lấy số ngày của tháng trước đó
    const prevMonthLastDay = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const soNam = Math.max(0, years);
  const soThangLe = Math.max(0, months);
  const soNgayLe = Math.max(0, days);

  const moTa = `${soNam} năm ${soThangLe > 0 ? `${soThangLe} tháng` : ''}`.trim();

  return {
    soNam,
    soThangLe,
    soNgayLe,
    moTa,
  };
}

/**
 * Tính số ngày phép được hưởng theo năm xét:
 * Nguyên tắc:
 * 1. Cơ bản: 15 ngày/năm.
 * 2. Cứ đủ 05 năm công tác CAND được cộng thêm 01 ngày phép.
 * 3. Công thức: Số ngày phép = 15 + INT(Số năm công tác / 5)
 * 4. Tính riêng ngày phép từng năm: Tại năm Y, xét thâm niên đạt được trong năm Y (đến cuối năm Y hoặc mốc đạt được trong năm Y).
 */
export function tinhSoNgayPhepTheoNam(
  ngayVaoStr: string,
  namXet: number,
  phepCoBan: number = 15,
  chuKyNam: number = 5
): {
  soNamCongTac: number;
  soThangLe: number;
  phepCoBan: number;
  phepTangThem: number;
  tongPhepDuocHuong: number;
  ngayDatMocTiepTheo?: string;
} {
  if (!ngayVaoStr) {
    return {
      soNamCongTac: 0,
      soThangLe: 0,
      phepCoBan,
      phepTangThem: 0,
      tongPhepDuocHuong: phepCoBan,
    };
  }

  const ngayVao = new Date(ngayVaoStr);
  if (isNaN(ngayVao.getTime())) {
    return {
      soNamCongTac: 0,
      soThangLe: 0,
      phepCoBan,
      phepTangThem: 0,
      tongPhepDuocHuong: phepCoBan,
    };
  }

  // Để tính phép cho năm dương lịch Y, tính thâm niên đạt được trong năm Y đó
  // Theo nguyên tắc hưởng phép năm, nếu trong năm Y đồng chí đạt mốc 5 năm (kể cả vào ngày kỷ niệm),
  // đồng chí được hưởng số ngày phép của mốc đó cho năm đó.
  // Mốc chốt cuối năm: 31/12 của năm xét
  const mocChotNam = new Date(namXet, 11, 31);
  const { soNam, soThangLe } = tinhThamNien(ngayVaoStr, mocChotNam);

  // Không làm tròn số năm công tác: chỉ lấy phần nguyên
  const phepTangThem = Math.floor(soNam / chuKyNam);
  const tongPhepDuocHuong = phepCoBan + phepTangThem;

  // Tính ngày đạt mốc 5 năm tiếp theo
  const namMocTiep = Math.floor(soNam / chuKyNam + 1) * chuKyNam;
  const namDatMoc = ngayVao.getFullYear() + namMocTiep;
  const thangDatMoc = String(ngayVao.getMonth() + 1).padStart(2, '0');
  const ngayDatMoc = String(ngayVao.getDate()).padStart(2, '0');
  const ngayDatMocTiepTheo = `${ngayDatMoc}/${thangDatMoc}/${namDatMoc}`;

  return {
    soNamCongTac: soNam,
    soThangLe,
    phepCoBan,
    phepTangThem,
    tongPhepDuocHuong,
    ngayDatMocTiepTheo,
  };
}

/**
 * Tính số ngày nghỉ giữa 2 ngày (bao gồm cả ngày bắt đầu và kết thúc)
 * Mặc định tính ngày liên tục.
 * Nếu chọn ngày làm việc: loại trừ Thứ 7 và Chủ Nhật.
 */
export function tinhSoNgayNghi(
  ngayBatDauStr: string,
  ngayKetThucStr: string,
  phuongThuc: 'lien_tuc' | 'ngay_lam_viec' = 'lien_tuc'
): number {
  if (!ngayBatDauStr || !ngayKetThucStr) return 0;

  const start = new Date(ngayBatDauStr);
  const end = new Date(ngayKetThucStr);

  // Đặt về 00:00:00 để tránh sai lệch múi giờ
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) return 0;

  if (phuongThuc === 'lien_tuc') {
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // Tính ngày làm việc (không tính T7, CN)
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Kiểm tra xem 2 khoảng thời gian có bị giao nhau (trùng ngày) hay không
 */
export function kiemTraTrungNgay(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 <= e2 && s2 <= e1;
}

/**
 * Tìm các phiếu nghỉ bị trùng lặp của cùng một cán bộ
 */
export function timPhieuTrungLap(
  maCanBo: string,
  start: string,
  end: string,
  danhSachPhieu: PhieuNghiPhep[],
  boQuaIdPhieu?: string
): PhieuNghiPhep[] {
  return danhSachPhieu.filter((p) => {
    if (p.maCanBo !== maCanBo) return false;
    if (boQuaIdPhieu && p.id === boQuaIdPhieu) return false;
    // Bỏ qua các phiếu đã hủy hoặc không duyệt
    if (p.trangThai === 'Đã hủy' || p.trangThai === 'Không phê duyệt') return false;

    return kiemTraTrungNgay(start, end, p.ngayBatDau, p.ngayKetThuc);
  });
}

/**
 * Tìm các đồng chí trong cùng tổ công tác nghỉ trùng thời gian
 * Phục vụ cảnh báo quân số trực ban, trực chiến
 */
export function timTrungLichTrongTo(
  toCongTac: string,
  start: string,
  end: string,
  danhSachPhieu: PhieuNghiPhep[],
  boQuaMaCanBo?: string,
  boQuaIdPhieu?: string
): PhieuNghiPhep[] {
  return danhSachPhieu.filter((p) => {
    if (p.toCongTac !== toCongTac) return false;
    if (boQuaMaCanBo && p.maCanBo === boQuaMaCanBo) return false;
    if (boQuaIdPhieu && p.id === boQuaIdPhieu) return false;
    if (p.trangThai === 'Đã hủy' || p.trangThai === 'Không phê duyệt') return false;

    return kiemTraTrungNgay(start, end, p.ngayBatDau, p.ngayKetThuc);
  });
}

/**
 * Tính toán tình hình nghỉ phép năm của một cán bộ
 */
export function tinhTongHopPhepNamCanBo(
  canBo: CanBo,
  namXet: number,
  danhSachPhieu: PhieuNghiPhep[],
  phepCoBan: number = 15,
  chuKyNam: number = 5
): TheoDoiPhepNam {
  const thongTinPhep = tinhSoNgayPhepTheoNam(canBo.ngayVaoCAND, namXet, phepCoBan, chuKyNam);

  // Chỉ cộng các phiếu:
  // 1. Của cán bộ này
  // 2. Thuộc năm xét (hoặc có ngày bắt đầu trong năm xét)
  // 3. Loại nghỉ: "Nghỉ phép năm"
  // 4. Trạng thái: "Đã phê duyệt"
  const phieuPhepNamHopLe = danhSachPhieu.filter((p) => {
    if (p.maCanBo !== canBo.maCanBo) return false;
    const namPhieu = p.namNghi || new Date(p.ngayBatDau).getFullYear();
    if (namPhieu !== namXet) return false;
    if (p.loaiNghi !== 'Nghỉ phép năm') return false;
    if (p.trangThai !== 'Đã phê duyệt') return false;
    return true;
  });

  const phepDaNghi = phieuPhepNamHopLe.reduce((sum, p) => sum + (p.soNgayNghi || 0), 0);
  const phepConLai = thongTinPhep.tongPhepDuocHuong - phepDaNghi;
  const tyLeSuDung = thongTinPhep.tongPhepDuocHuong > 0
    ? Math.round((phepDaNghi / thongTinPhep.tongPhepDuocHuong) * 100)
    : 0;

  let trangThai: TrangThaiPhepNam = 'Chưa nghỉ phép';
  if (phepDaNghi === 0) {
    trangThai = 'Chưa nghỉ phép';
  } else if (phepConLai < 0) {
    trangThai = 'Vượt phép';
  } else if (phepConLai === 0) {
    trangThai = 'Đã hết phép';
  } else if (phepConLai <= 3) {
    trangThai = 'Còn ít phép';
  } else {
    trangThai = 'Đang sử dụng';
  }

  return {
    maCanBo: canBo.maCanBo,
    nam: namXet,
    soNamCongTac: thongTinPhep.soNamCongTac,
    soThangLe: thongTinPhep.soThangLe,
    phepCoBan: thongTinPhep.phepCoBan,
    phepTangThem: thongTinPhep.phepTangThem,
    tongPhepDuocHuong: thongTinPhep.tongPhepDuocHuong,
    phepDaNghi,
    phepConLai,
    tyLeSuDung,
    trangThai,
  };
}

/**
 * Định dạng ngày theo chuẩn Việt Nam DD/MM/YYYY
 */
export function dinhDangNgayVN(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
