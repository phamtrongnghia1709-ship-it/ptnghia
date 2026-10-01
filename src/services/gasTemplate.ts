// Mã nguồn Google Apps Script (Code.gs) chuẩn hóa và hướng dẫn kết nối Google Sheets

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================================
 * PHẦN MỀM QUẢN LÝ NGÀY NGHỈ PHÉP CÁN BỘ, CHIẾN SĨ - CÔNG AN XÃ BÁT TRÀNG
 * Backend Google Apps Script & Google Sheets Database
 * Tác giả: Bộ phận CNTT & Tham mưu Công an xã Bát Tràng
 * =========================================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (3 BƯỚC):
 * 1. Mở một Google Sheet mới trên Google Drive của bạn (Đặt tên: "CSDL_QuanLyNghiPhep_CAX_BatTrang").
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> chọn "Apps Script".
 * 3. Xóa hết mã cũ trong tệp Code.gs, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn "Lưu" (biểu tượng đĩa mềm hoặc Ctrl+S).
 * 5. Chọn hàm "khoiTaoHeThong" ở thanh công cụ phía trên và nhấn "Chạy" (Run) để tự động tạo 6 Sheet!
 * 6. Nhấn nút màu xanh "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "API Quan ly Nghi phep CAX Bat Trang v1".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Người có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 7. Nhấn "Triển khai", cấp quyền khi Google yêu cầu, sau đó sao chép "URL ứng dụng web" (Web App URL)
 *    và dán vào mục Cài đặt kết nối trên phần mềm Quản lý nghỉ phép!
 */

const SHEET_NAMES = {
  CBCS: 'CBCS',
  NGHI_PHEP: 'NGHI_PHEP',
  THEO_DOI_NAM: 'THEO_DOI_NAM',
  DANH_MUC: 'DANH_MUC',
  CAU_HINH: 'CAU_HINH',
  NHAT_KY: 'NHAT_KY_HE_THONG'
};

// Hàm khởi tạo cấu trúc 6 Sheet chuẩn
function khoiTaoHeThong() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet CBCS
  let sheetCBCS = ss.getSheetByName(SHEET_NAMES.CBCS) || ss.insertSheet(SHEET_NAMES.CBCS);
  sheetCBCS.clear();
  sheetCBCS.appendRow([
    'STT', 'Mã cán bộ', 'Họ và tên', 'Số hiệu CAND', 'Ngày sinh', 'Giới tính', 
    'Cấp bậc', 'Chức vụ', 'Tổ công tác', 'Ngày vào CAND', 'Số điện thoại', 
    'Trạng thái công tác', 'Ghi chú', 'Ngày chuyển công tác', 'Thời gian tạo'
  ]);
  formatHeader(sheetCBCS, '#1e3a8a');

  // 2. Sheet NGHI_PHEP
  let sheetNghi = ss.getSheetByName(SHEET_NAMES.NGHI_PHEP) || ss.insertSheet(SHEET_NAMES.NGHI_PHEP);
  sheetNghi.clear();
  sheetNghi.appendRow([
    'Mã phiếu', 'Ngày lập', 'Mã cán bộ', 'Họ và tên', 'Tổ công tác', 
    'Ngày bắt đầu', 'Ngày kết thúc', 'Số ngày nghỉ', 'Loại nghỉ', 'Lý do nghỉ', 
    'Địa điểm nghỉ', 'Người duyệt', 'Chức vụ người duyệt', 'Trạng thái', 
    'Ngày duyệt', 'Lý do từ chối', 'Ghi chú', 'Năm nghỉ'
  ]);
  formatHeader(sheetNghi, '#1e3a8a');

  // 3. Sheet THEO_DOI_NAM
  let sheetTheoDoi = ss.getSheetByName(SHEET_NAMES.THEO_DOI_NAM) || ss.insertSheet(SHEET_NAMES.THEO_DOI_NAM);
  sheetTheoDoi.clear();
  sheetTheoDoi.appendRow([
    'Năm', 'Mã cán bộ', 'Họ và tên', 'Tổ công tác', 'Số năm công tác', 'Số tháng lẻ', 
    'Phép cơ bản', 'Phép tăng thêm', 'Tổng phép được hưởng', 'Phép đã nghỉ', 
    'Phép còn lại', 'Tỷ lệ sử dụng (%)', 'Trạng thái'
  ]);
  formatHeader(sheetTheoDoi, '#1e3a8a');

  // 4. Sheet DANH_MUC
  let sheetDM = ss.getSheetByName(SHEET_NAMES.DANH_MUC) || ss.insertSheet(SHEET_NAMES.DANH_MUC);
  sheetDM.clear();
  sheetDM.appendRow(['Phân loại', 'Mã', 'Tên danh mục', 'Mô tả']);
  formatHeader(sheetDM, '#1e3a8a');

  // 5. Sheet CAU_HINH
  let sheetConfig = ss.getSheetByName(SHEET_NAMES.CAU_HINH) || ss.insertSheet(SHEET_NAMES.CAU_HINH);
  sheetConfig.clear();
  sheetConfig.appendRow(['Mã cấu hình', 'Tên tham số', 'Giá trị', 'Ghi chú']);
  sheetConfig.appendRow(['TEN_DON_VI_CAP_TREN', 'Đơn vị cấp trên', 'CÔNG AN HUYỆN GIA LÂM - TP HÀ NỘI', '']);
  sheetConfig.appendRow(['TEN_DON_VI', 'Tên đơn vị', 'CÔNG AN XÃ BÁT TRÀNG', '']);
  sheetConfig.appendRow(['DIA_CHI', 'Địa chỉ đơn vị', 'Thôn Giang Cao, xã Bát Tràng, huyện Gia Lâm, TP. Hà Nội', '']);
  sheetConfig.appendRow(['PHEP_CO_BAN', 'Phép cơ bản mặc định', '15', 'ngày/năm']);
  sheetConfig.appendRow(['CHU_KY_TANG_PHEP', 'Chu kỳ thâm niên tăng phép', '5', 'năm tăng 1 ngày']);
  sheetConfig.appendRow(['PHUONG_THUC_TINH', 'Phương thức tính ngày', 'lien_tuc', 'lien_tuc hoặc ngay_lam_viec']);
  sheetConfig.appendRow(['CANH_BAO_TRUNG_TO', 'Ngưỡng cảnh báo trùng cùng tổ', '2', 'cán bộ']);
  formatHeader(sheetConfig, '#1e3a8a');

  // 6. Sheet NHAT_KY_HE_THONG
  let sheetLog = ss.getSheetByName(SHEET_NAMES.NHAT_KY) || ss.insertSheet(SHEET_NAMES.NHAT_KY);
  sheetLog.clear();
  sheetLog.appendRow(['Mã log', 'Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Chi tiết']);
  formatHeader(sheetLog, '#1e3a8a');

  Logger.log('Khởi tạo thành công 6 trang tính của hệ thống!');
}

function formatHeader(sheet, bgColor) {
  let range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground(bgColor);
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// Xử lý GET request (Tải dữ liệu từ Google Sheets về ứng dụng web)
function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return jsonResponse({ status: 'success', message: 'Kết nối Google Sheets thành công!' });
    }

    // Lấy toàn bộ dữ liệu
    const cbcsData = getSheetRowsAsJson(ss.getSheetByName(SHEET_NAMES.CBCS));
    const nghiPhepData = getSheetRowsAsJson(ss.getSheetByName(SHEET_NAMES.NGHI_PHEP));
    const cauHinhData = getSheetRowsAsJson(ss.getSheetByName(SHEET_NAMES.CAU_HINH));
    const nhatKyData = getSheetRowsAsJson(ss.getSheetByName(SHEET_NAMES.NHAT_KY));

    return jsonResponse({
      status: 'success',
      data: {
        officers: cbcsData,
        leaveRequests: nghiPhepData,
        config: cauHinhData,
        logs: nhatKyData,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// Xử lý POST request (Đồng bộ dữ liệu từ ứng dụng web lên Google Sheets)
function doPost(e) {
  try {
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch(parseErr) {
      payload = e.parameter;
    }

    const action = payload.action || 'syncAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'syncAll') {
      const { officers, leaveRequests, logs } = payload;

      if (Array.isArray(officers)) {
        updateSheetFromList(ss.getSheetByName(SHEET_NAMES.CBCS), officers, (item, i) => [
          i + 1, item.maCanBo, item.hoTen, item.soHieuCAND || '', item.ngaySinh || '', 
          item.gioiTinh || 'Nam', item.capBac, item.chucVu, item.toCongTac, 
          item.ngayVaoCAND, item.soDienThoai || '', item.trangThaiCongTac, 
          item.ghiChu || '', item.ngayChuyenCongTac || '', item.createdAt || new Date().toISOString()
        ]);
      }

      if (Array.isArray(leaveRequests)) {
        updateSheetFromList(ss.getSheetByName(SHEET_NAMES.NGHI_PHEP), leaveRequests, (item) => [
          item.id, item.ngayLapPhieu, item.maCanBo, item.hoTenCanBo, item.toCongTac, 
          item.ngayBatDau, item.ngayKetThuc, item.soNgayNghi, item.loaiNghi, item.lyDoNghi, 
          item.diaDiemNghi || '', item.nguoiPheDuyet, item.chucVuNguoiDuyet || '', 
          item.trangThai, item.ngayPheDuyet || '', item.lyDoTuChoi || '', item.ghiChu || '', 
          item.namNghi || new Date(item.ngayBatDau).getFullYear()
        ]);
      }

      if (Array.isArray(logs)) {
        updateSheetFromList(ss.getSheetByName(SHEET_NAMES.NHAT_KY), logs, (item) => [
          item.id, item.thoiGian, item.nguoiThucHien, item.vaiTro, item.hanhDong, item.chiTiet
        ]);
      }

      return jsonResponse({
        status: 'success',
        message: 'Đã lưu và đồng bộ toàn bộ dữ liệu vào Google Sheets thành công!',
        syncTime: new Date().toISOString()
      });
    }

    return jsonResponse({ status: 'error', message: 'Hành động không xác định: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function updateSheetFromList(sheet, list, rowMapper) {
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  if (list.length === 0) return;

  const rows = list.map(rowMapper);
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function getSheetRowsAsJson(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
