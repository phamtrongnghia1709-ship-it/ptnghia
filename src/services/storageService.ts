// Dịch vụ quản lý dữ liệu: LocalStorage, Export/Import Excel, JSON & Đồng bộ Google Sheets qua Google Apps Script
import * as XLSX from 'xlsx';
import { CanBo, PhieuNghiPhep, CauHinhHeThong, NhatKyHeThong, TaiKhoan, AuthSession, CauHinhGiayNghiPhep } from '../types';
import { INITIAL_CONFIG, INITIAL_OFFICERS, INITIAL_LEAVE_REQUESTS, INITIAL_AUDIT_LOGS, INITIAL_ACCOUNTS, DEFAULT_LEAVE_SLIP_CONFIG } from '../utils/mockData';
import { tinhSoNgayPhepTheoNam } from '../utils/calculator';

const STORAGE_KEYS = {
  OFFICERS: 'cax_battrang_officers_v4',
  LEAVE_REQUESTS: 'cax_battrang_leave_requests_v4',
  CONFIG: 'cax_battrang_config_v4',
  AUDIT_LOGS: 'cax_battrang_audit_logs_v4',
  USER_ROLE: 'cax_battrang_current_role_v4',
  ACCOUNTS: 'cax_battrang_accounts_v4',
  CURRENT_SESSION: 'cax_battrang_current_session_v4',
};

export class StorageService {
  // Lấy danh sách tài khoản
  static getAccounts(): TaiKhoan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (data) {
        const parsed: TaiKhoan[] = JSON.parse(data);
        // Đảm bảo các tài khoản khởi tạo chính luôn tồn tại
        let hasChanges = false;
        INITIAL_ACCOUNTS.forEach((initAcc) => {
          if (!parsed.some((a) => a.tenDangNhap.toLowerCase() === initAcc.tenDangNhap.toLowerCase())) {
            parsed.unshift(initAcc);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          this.saveAccounts(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi đọc tài khoản:', e);
    }
    this.saveAccounts(INITIAL_ACCOUNTS);
    return INITIAL_ACCOUNTS;
  }

  // Lưu danh sách tài khoản
  static saveAccounts(accounts: TaiKhoan[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  // Lấy phiên đăng nhập hiện tại
  static getCurrentSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi khi đọc phiên đăng nhập:', e);
    }
    return null;
  }

  // Lưu phiên đăng nhập
  static setCurrentSession(session: AuthSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }

  // Xác thực đăng nhập
  static authenticate(tenDangNhap: string, matKhau: string): { success: boolean; message: string; session?: AuthSession } {
    const accounts = this.getAccounts();
    const cleanUser = tenDangNhap.trim().toLowerCase();

    // Cho phép đăng nhập bằng tên đăng nhập HOẶC mã cán bộ
    const account = accounts.find(
      (a) => a.tenDangNhap.toLowerCase() === cleanUser || (a.maCanBo && a.maCanBo.toLowerCase() === cleanUser)
    );

    if (!account) {
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' };
    }

    if (!account.kichHoat) {
      return { success: false, message: 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Chỉ huy CAX!' };
    }

    if (account.matKhau !== matKhau) {
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' };
    }

    // Cập nhật lần đăng nhập cuối
    account.lanDangNhapCuoi = new Date().toISOString();
    this.saveAccounts(accounts);

    const session: AuthSession = {
      user: account,
      loginTime: new Date().toISOString(),
    };
    this.setCurrentSession(session);

    this.addAuditLog(
      'Đăng nhập hệ thống',
      `Đồng chí ${account.capBac || ''} ${account.hoTen} (${account.tenDangNhap}) đăng nhập thành công`,
      account.hoTen,
      account.vaiTro === 'admin' ? 'Chỉ huy đơn vị' : account.vaiTro === 'tham_muu' ? 'Tham mưu' : 'Cán bộ chiến sĩ'
    );

    return { success: true, message: 'Đăng nhập thành công!', session };
  }

  // Đăng ký tạo tài khoản mới
  static registerAccount(accountData: Omit<TaiKhoan, 'id' | 'createdAt'>): { success: boolean; message: string; account?: TaiKhoan } {
    const accounts = this.getAccounts();
    const cleanUsername = accountData.tenDangNhap.trim().toLowerCase();

    if (accounts.some((a) => a.tenDangNhap.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác!' };
    }

    if (accountData.maCanBo && accounts.some((a) => a.maCanBo === accountData.maCanBo)) {
      return { success: false, message: 'Cán bộ chiến sĩ này đã có tài khoản trong hệ thống!' };
    }

    const newAccount: TaiKhoan = {
      ...accountData,
      id: `ACC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    this.addAuditLog(
      'Tạo tài khoản mới',
      `Tạo tài khoản ${newAccount.tenDangNhap} cho đồng chí ${newAccount.hoTen} (${newAccount.vaiTro})`,
      newAccount.hoTen,
      newAccount.vaiTro === 'admin' ? 'Chỉ huy đơn vị' : 'Cán bộ chiến sĩ'
    );

    return { success: true, message: 'Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.', account: newAccount };
  }

  // Đổi mật khẩu
  static changePassword(userId: string, matKhauCu: string, matKhauMoi: string): { success: boolean; message: string } {
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.id === userId);

    if (!account) {
      return { success: false, message: 'Không tìm thấy thông tin tài khoản!' };
    }

    if (account.matKhau !== matKhauCu) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }

    if (matKhauMoi.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }

    account.matKhau = matKhauMoi;
    this.saveAccounts(accounts);

    // Cập nhật session nếu là user hiện tại
    const current = this.getCurrentSession();
    if (current && current.user.id === userId) {
      current.user.matKhau = matKhauMoi;
      this.setCurrentSession(current);
    }

    this.addAuditLog(
      'Đổi mật khẩu',
      `Đồng chí ${account.hoTen} đã thay đổi mật khẩu tài khoản ${account.tenDangNhap}`,
      account.hoTen,
      account.vaiTro
    );

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  }

  // Quản trị viên cập nhật trạng thái tài khoản
  static updateAccountStatus(id: string, kichHoat: boolean): void {
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      acc.kichHoat = kichHoat;
      this.saveAccounts(accounts);
      this.addAuditLog(
        kichHoat ? 'Kích hoạt tài khoản' : 'Khóa tài khoản',
        `${kichHoat ? 'Kích hoạt' : 'Khóa'} tài khoản ${acc.tenDangNhap} của đồng chí ${acc.hoTen}`
      );
    }
  }

  // Quản trị viên đặt lại mật khẩu cho tài khoản
  static resetPassword(id: string, matKhauMoi: string): { success: boolean; message: string } {
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return { success: false, message: 'Không tìm thấy tài khoản!' };

    acc.matKhau = matKhauMoi;
    this.saveAccounts(accounts);

    this.addAuditLog(
      'Đặt lại mật khẩu',
      `Chỉ huy đã đặt lại mật khẩu cho tài khoản ${acc.tenDangNhap} của đồng chí ${acc.hoTen}`
    );
    return { success: true, message: `Đặt lại mật khẩu thành công cho tài khoản ${acc.tenDangNhap}!` };
  }

  // Xóa tài khoản (Không thể xóa tài khoản quantricaxbattrang)
  static deleteAccount(id: string): { success: boolean; message: string } {
    const accounts = this.getAccounts();
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return { success: false, message: 'Không tìm thấy tài khoản!' };
    
    if (acc.tenDangNhap.toLowerCase() === 'quantricaxbattrang') {
      return { success: false, message: 'Không thể xóa tài khoản Quản trị viên hệ thống quantricaxbattrang!' };
    }

    const updated = accounts.filter((a) => a.id !== id);
    this.saveAccounts(updated);

    this.addAuditLog(
      'Xóa tài khoản',
      `Xóa tài khoản ${acc.tenDangNhap} của đồng chí ${acc.hoTen}`
    );
    return { success: true, message: `Đã xóa tài khoản ${acc.tenDangNhap}!` };
  }

  // Đăng xuất
  static logout(): void {
    const current = this.getCurrentSession();
    if (current) {
      this.addAuditLog(
        'Đăng xuất hệ thống',
        `Đồng chí ${current.user.hoTen} đăng xuất khỏi hệ thống`,
        current.user.hoTen,
        current.user.vaiTro
      );
    }
    this.setCurrentSession(null);
  }

  // Lấy cấu hình hệ thống
  static getConfig(): CauHinhHeThong {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) {
        const parsed: CauHinhHeThong = JSON.parse(data);
        if (!parsed.cauHinhGiayNghiPhep || !parsed.cauHinhGiayNghiPhep.tieuDeDon) {
          parsed.cauHinhGiayNghiPhep = { ...DEFAULT_LEAVE_SLIP_CONFIG, ...parsed.cauHinhGiayNghiPhep };
        }
        return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi đọc cấu hình từ localStorage:', e);
    }
    return { ...INITIAL_CONFIG, cauHinhGiayNghiPhep: { ...DEFAULT_LEAVE_SLIP_CONFIG } };
  }

  // Lưu cấu hình hệ thống
  static saveConfig(config: CauHinhHeThong): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  // Lưu riêng cấu hình mẫu giấy nghỉ phép
  static saveLeaveSlipConfig(slipConfig: CauHinhGiayNghiPhep): CauHinhHeThong {
    const currentConfig = this.getConfig();
    const updatedConfig: CauHinhHeThong = {
      ...currentConfig,
      cauHinhGiayNghiPhep: slipConfig,
      // Đồng bộ tên đơn vị nếu cấu hình giấy phép có thay đổi
      tenDonViCapTren: slipConfig.donViCapTren || currentConfig.tenDonViCapTren,
      tenDonVi: slipConfig.tenDonVi || currentConfig.tenDonVi,
      hoTenNguoiKy: slipConfig.hoTenNguoiKy || currentConfig.hoTenNguoiKy,
    };
    this.saveConfig(updatedConfig);
    this.addAuditLog(
      'Cấu hình giấy nghỉ phép',
      `Cập nhật mẫu giấy nghỉ phép: ${slipConfig.tieuDeGiay} - ${slipConfig.tenDonVi}`
    );
    return updatedConfig;
  }

  // Lấy danh sách CBCS
  static getOfficers(): CanBo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFICERS);
      if (data) {
        const parsed: CanBo[] = JSON.parse(data);
        let hasChanges = false;
        INITIAL_OFFICERS.forEach((initOff) => {
          if (!parsed.some((o) => o.maCanBo === initOff.maCanBo)) {
            parsed.unshift(initOff);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          this.saveOfficers(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi đọc CBCS từ localStorage:', e);
    }
    // Khởi tạo mặc định nếu chưa có
    this.saveOfficers(INITIAL_OFFICERS);
    return INITIAL_OFFICERS;
  }

  // Lưu danh sách CBCS
  static saveOfficers(officers: CanBo[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
  }

  // Lấy danh sách phiếu nghỉ phép
  static getLeaveRequests(): PhieuNghiPhep[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi khi đọc phiếu nghỉ từ localStorage:', e);
    }
    this.saveLeaveRequests(INITIAL_LEAVE_REQUESTS);
    return INITIAL_LEAVE_REQUESTS;
  }

  // Lưu danh sách phiếu nghỉ phép
  static saveLeaveRequests(requests: PhieuNghiPhep[]): void {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
  }

  // Lấy nhật ký hệ thống
  static getAuditLogs(): NhatKyHeThong[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi khi đọc nhật ký:', e);
    }
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
    return INITIAL_AUDIT_LOGS;
  }

  // Lưu nhật ký hệ thống
  static saveAuditLogs(logs: NhatKyHeThong[]): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  // Ghi thêm một bản ghi nhật ký
  static addAuditLog(
    hanhDong: string,
    chiTiet: string,
    nguoiThucHien: string = 'Quản trị viên',
    vaiTro: string = 'Quản trị viên'
  ): void {
    const logs = this.getAuditLogs();
    const newLog: NhatKyHeThong = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      thoiGian: new Date().toISOString(),
      nguoiThucHien,
      vaiTro,
      hanhDong,
      chiTiet,
    };
    logs.unshift(newLog);
    // Giới hạn 200 bản ghi mới nhất
    if (logs.length > 200) logs.pop();
    this.saveAuditLogs(logs);
  }

  // Đặt lại dữ liệu gốc ban đầu
  static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(INITIAL_OFFICERS));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(INITIAL_LEAVE_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
  }

  // Xuất file sao lưu JSON
  static exportBackupJSON(): void {
    const backupData = {
      version: '1.0',
      unit: 'CÔNG AN XÃ BÁT TRÀNG',
      exportedAt: new Date().toISOString(),
      config: this.getConfig(),
      officers: this.getOfficers(),
      leaveRequests: this.getLeaveRequests(),
      auditLogs: this.getAuditLogs(),
      accounts: this.getAccounts(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SaoLuu_QuanLyNghiPhep_CAX_BatTrang_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Nhập dữ liệu từ file sao lưu JSON
  static importBackupJSON(jsonData: any): { success: boolean; message: string } {
    try {
      if (!jsonData || (!jsonData.officers && !jsonData.leaveRequests)) {
        return { success: false, message: 'Tệp JSON không đúng định dạng dữ liệu hệ thống!' };
      }

      if (Array.isArray(jsonData.officers)) {
        this.saveOfficers(jsonData.officers);
      }
      if (Array.isArray(jsonData.leaveRequests)) {
        this.saveLeaveRequests(jsonData.leaveRequests);
      }
      if (jsonData.config) {
        this.saveConfig({ ...this.getConfig(), ...jsonData.config });
      }
      if (Array.isArray(jsonData.auditLogs)) {
        this.saveAuditLogs(jsonData.auditLogs);
      }
      if (Array.isArray(jsonData.accounts)) {
        this.saveAccounts(jsonData.accounts);
      }

      this.addAuditLog('Khôi phục dữ liệu', 'Khôi phục dữ liệu hệ thống từ tệp sao lưu JSON');
      return { success: true, message: 'Khôi phục dữ liệu thành công!' };
    } catch (err: any) {
      return { success: false, message: 'Lỗi xử lý tệp: ' + err.message };
    }
  }

  // Xuất toàn bộ cơ sở dữ liệu ra tệp Excel chuẩn với 6 Sheets theo yêu cầu mục V
  static exportToExcel(currentYear: number): void {
    const officers = this.getOfficers();
    const leaveRequests = this.getLeaveRequests();
    const config = this.getConfig();
    const auditLogs = this.getAuditLogs();

    const wb = XLSX.utils.book_new();

    // 1. Sheet CBCS
    const cbcsRows = officers.map((cb, idx) => ({
      'STT': idx + 1,
      'Mã cán bộ': cb.maCanBo,
      'Họ và tên': cb.hoTen,
      'Số hiệu CAND': cb.soHieuCAND || '',
      'Ngày sinh': cb.ngaySinh || '',
      'Giới tính': cb.gioiTinh,
      'Cấp bậc': cb.capBac,
      'Chức vụ': cb.chucVu,
      'Tổ công tác': cb.toCongTac,
      'Ngày vào CAND': cb.ngayVaoCAND,
      'Số điện thoại': cb.soDienThoai || '',
      'Trạng thái công tác': cb.trangThaiCongTac,
      'Ghi chú': cb.ghiChu || '',
    }));
    const wsCBCS = XLSX.utils.json_to_sheet(cbcsRows);
    XLSX.utils.book_append_sheet(wb, wsCBCS, 'CBCS');

    // 2. Sheet NGHI_PHEP
    const leaveRows = leaveRequests.map((p) => ({
      'Mã phiếu': p.id,
      'Ngày lập': p.ngayLapPhieu,
      'Mã CBCS': p.maCanBo,
      'Họ và tên': p.hoTenCanBo,
      'Tổ công tác': p.toCongTac,
      'Ngày bắt đầu': p.ngayBatDau,
      'Ngày kết thúc': p.ngayKetThuc,
      'Số ngày nghỉ': p.soNgayNghi,
      'Loại nghỉ': p.loaiNghi,
      'Lý do nghỉ': p.lyDoNghi,
      'Địa điểm nghỉ': p.diaDiemNghi || '',
      'Người phê duyệt': p.nguoiPheDuyet,
      'Trạng thái': p.trangThai,
      'Ngày phê duyệt': p.ngayPheDuyet || '',
      'Năm nghỉ': p.namNghi,
    }));
    const wsNghi = XLSX.utils.json_to_sheet(leaveRows);
    XLSX.utils.book_append_sheet(wb, wsNghi, 'NGHI_PHEP');

    // 3. Sheet THEO_DOI_NAM
    const theoDoiRows = officers.map((cb) => {
      const calc = tinhSoNgayPhepTheoNam(cb.ngayVaoCAND, currentYear, config.phepCoBanMacDinh, config.chuKyTangPhepNam);
      const phepDaNghi = leaveRequests
        .filter((p) => p.maCanBo === cb.maCanBo && p.namNghi === currentYear && p.loaiNghi === 'Nghỉ phép năm' && p.trangThai === 'Đã phê duyệt')
        .reduce((sum, p) => sum + p.soNgayNghi, 0);
      const phepConLai = calc.tongPhepDuocHuong - phepDaNghi;

      return {
        'Năm': currentYear,
        'Mã cán bộ': cb.maCanBo,
        'Họ và tên': cb.hoTen,
        'Tổ công tác': cb.toCongTac,
        'Số năm công tác': calc.soNamCongTac,
        'Số tháng lẻ': calc.soThangLe,
        'Phép cơ bản': calc.phepCoBan,
        'Phép thâm niên': calc.phepTangThem,
        'Tổng phép được hưởng': calc.tongPhepDuocHuong,
        'Phép đã nghỉ': phepDaNghi,
        'Phép còn lại': phepConLai,
        'Tỷ lệ sử dụng (%)': calc.tongPhepDuocHuong > 0 ? Math.round((phepDaNghi / calc.tongPhepDuocHuong) * 100) : 0,
        'Trạng thái công tác': cb.trangThaiCongTac,
      };
    });
    const wsTheoDoi = XLSX.utils.json_to_sheet(theoDoiRows);
    XLSX.utils.book_append_sheet(wb, wsTheoDoi, 'THEO_DOI_NAM');

    // 4. Sheet DANH_MUC
    const danhMucRows = [
      { 'Phân loại': 'Tổ công tác', 'Tên': 'Tổ Tổng hợp' },
      { 'Phân loại': 'Tổ công tác', 'Tên': 'Tổ An ninh' },
      { 'Phân loại': 'Tổ công tác', 'Tên': 'Tổ Phòng chống tội phạm' },
      { 'Phân loại': 'Tổ công tác', 'Tên': 'Tổ Cảnh sát trật tự' },
      { 'Phân loại': 'Tổ công tác', 'Tên': 'Tổ Cảnh sát khu vực' },
      { 'Phân loại': 'Loại nghỉ', 'Tên': 'Nghỉ phép năm' },
      { 'Phân loại': 'Loại nghỉ', 'Tên': 'Nghỉ bù' },
      { 'Phân loại': 'Loại nghỉ', 'Tên': 'Nghỉ việc riêng' },
      { 'Phân loại': 'Loại nghỉ', 'Tên': 'Nghỉ theo chế độ khác' },
      { 'Phân loại': 'Trạng thái phiếu', 'Tên': 'Chờ phê duyệt' },
      { 'Phân loại': 'Trạng thái phiếu', 'Tên': 'Đã phê duyệt' },
      { 'Phân loại': 'Trạng thái phiếu', 'Tên': 'Không phê duyệt' },
      { 'Phân loại': 'Trạng thái phiếu', 'Tên': 'Đã hủy' },
    ];
    const wsDM = XLSX.utils.json_to_sheet(danhMucRows);
    XLSX.utils.book_append_sheet(wb, wsDM, 'DANH_MUC');

    // 5. Sheet CAU_HINH
    const configRows = [
      { 'Mã': 'TEN_DON_VI_CAP_TREN', 'Tham số': 'Đơn vị cấp trên', 'Giá trị': config.tenDonViCapTren },
      { 'Mã': 'TEN_DON_VI', 'Tham số': 'Tên đơn vị', 'Giá trị': config.tenDonVi },
      { 'Mã': 'DIA_CHI', 'Tham số': 'Địa chỉ', 'Giá trị': config.diaChiDonVi },
      { 'Mã': 'PHEP_CO_BAN', 'Tham số': 'Phép cơ bản mặc định', 'Giá trị': config.phepCoBanMacDinh },
      { 'Mã': 'CHU_KY_THAM_NIEN', 'Tham số': 'Chu kỳ thâm niên (năm/1 ngày)', 'Giá trị': config.chuKyTangPhepNam },
      { 'Mã': 'PHUONG_THUC_TINH', 'Tham số': 'Phương thức tính ngày', 'Giá trị': config.phuongThucTinhNgay },
      { 'Mã': 'NGUOI_KY_BAO_CAO', 'Tham số': 'Người ký báo cáo', 'Giá trị': `${config.hoTenNguoiKy} - ${config.nguoiKyBaoCao}` },
    ];
    const wsConfig = XLSX.utils.json_to_sheet(configRows);
    XLSX.utils.book_append_sheet(wb, wsConfig, 'CAU_HINH');

    // 6. Sheet NHAT_KY_HE_THONG
    const logRows = auditLogs.map((log) => ({
      'Mã log': log.id,
      'Thời gian': log.thoiGian,
      'Người thực hiện': log.nguoiThucHien,
      'Vai trò': log.vaiTro,
      'Hành động': log.hanhDong,
      'Nội dung chi tiết': log.chiTiet,
    }));
    const wsLog = XLSX.utils.json_to_sheet(logRows);
    XLSX.utils.book_append_sheet(wb, wsLog, 'NHAT_KY_HE_THONG');

    // Lưu tệp
    XLSX.writeFile(wb, `CSDL_NghiPhep_CAX_BatTrang_Nam_${currentYear}.xlsx`);
  }

  // Kiểm tra kết nối tới Google Apps Script Web App
  static async testGoogleAppsScriptConnection(url: string): Promise<{ success: boolean; message: string }> {
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
      return { success: false, message: 'URL không hợp lệ. Phải có định dạng: https://script.google.com/macros/s/.../exec' };
    }

    try {
      const pingUrl = `${url}?action=ping`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Mã lỗi HTTP: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success') {
        return { success: true, message: resJson.message || 'Kết nối Google Sheets thành công!' };
      }
      return { success: false, message: resJson.message || 'Phản hồi từ Google Sheets không hợp lệ' };
    } catch (err: any) {
      // Trong trường hợp Google Apps Script trả về redirect CORS, hướng dẫn người dùng
      return {
        success: false,
        message: 'Lỗi kết nối tới Google Sheets: ' + (err.message || 'Lỗi mạng hoặc chưa mở quyền Truy cập Bất kỳ ai trong Apps Script'),
      };
    }
  }

  // Đồng bộ đẩy dữ liệu lên Google Sheets qua Apps Script Web App
  static async syncToGoogleSheet(url: string): Promise<{ success: boolean; message: string }> {
    if (!url) return { success: false, message: 'Chưa cấu hình URL Google Apps Script!' };

    const payload = {
      action: 'syncAll',
      officers: this.getOfficers(),
      leaveRequests: this.getLeaveRequests(),
      logs: this.getAuditLogs().slice(0, 50),
      config: this.getConfig(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (resJson.status === 'success') {
        const config = this.getConfig();
        config.lastSyncTime = new Date().toISOString();
        this.saveConfig(config);
        this.addAuditLog('Đồng bộ dữ liệu', 'Đồng bộ toàn bộ danh sách CBCS và Phiếu nghỉ lên Google Sheets');
        return { success: true, message: resJson.message || 'Đồng bộ lên Google Sheets thành công!' };
      }
      return { success: false, message: resJson.message || 'Lỗi đồng bộ dữ liệu' };
    } catch (err: any) {
      return { success: false, message: 'Lỗi gửi dữ liệu lên Google Sheets: ' + err.message };
    }
  }

  // Đồng bộ tải dữ liệu từ Google Sheets về hệ thống
  static async syncFromGoogleSheet(url: string): Promise<{ success: boolean; message: string }> {
    if (!url) return { success: false, message: 'Chưa cấu hình URL Google Apps Script!' };

    try {
      const response = await fetch(`${url}?action=getAll`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      const resJson = await response.json();
      if (resJson.status === 'success' && resJson.data) {
        const { officers, leaveRequests } = resJson.data;
        if (Array.isArray(officers) && officers.length > 0) {
          this.saveOfficers(officers);
        }
        if (Array.isArray(leaveRequests) && leaveRequests.length > 0) {
          this.saveLeaveRequests(leaveRequests);
        }

        const config = this.getConfig();
        config.lastSyncTime = new Date().toISOString();
        this.saveConfig(config);

        this.addAuditLog('Tải dữ liệu', 'Đồng bộ tải dữ liệu mới nhất từ Google Sheets về phần mềm');
        return { success: true, message: 'Tải dữ liệu từ Google Sheets về thành công!' };
      }
      return { success: false, message: resJson.message || 'Không có dữ liệu hợp lệ trả về' };
    } catch (err: any) {
      return { success: false, message: 'Lỗi khi tải dữ liệu từ Google Sheets: ' + err.message };
    }
  }
}
