// Modal Cấu hình & Đồng bộ Cơ sở dữ liệu Google Sheets / Google Apps Script
import React, { useState } from 'react';
import { 
  Sheet, 
  Cloud, 
  Check, 
  Copy, 
  RefreshCw, 
  Upload, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  X,
  FileCode,
  Database
} from 'lucide-react';
import { CauHinhHeThong } from '../../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/gasTemplate';
import { StorageService } from '../../services/storageService';

interface GoogleSheetSyncModalProps {
  config: CauHinhHeThong;
  onSaveConfig: (cfg: CauHinhHeThong) => void;
  onClose: () => void;
  onRefreshData: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  config,
  onSaveConfig,
  onClose,
  onRefreshData,
}) => {
  const [gasUrl, setGasUrl] = useState(config.gasWebAppUrl || '');
  const [activeTab, setActiveTab] = useState<'sync' | 'code' | 'backup'>('sync');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Lưu cấu hình URL
  const handleSaveUrl = () => {
    onSaveConfig({
      ...config,
      gasWebAppUrl: gasUrl.trim(),
    });
    setTestResult({ success: true, message: 'Đã lưu cấu hình URL Google Apps Script!' });
  };

  // Kiểm tra kết nối
  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập URL Google Apps Script Web App!' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await StorageService.testGoogleAppsScriptConnection(gasUrl.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  // Đồng bộ đẩy dữ liệu lên Google Sheets
  const handleSyncUp = async () => {
    if (!gasUrl.trim()) {
      setSyncResult({ success: false, message: 'Chưa cấu hình URL Google Apps Script!' });
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);

    const res = await StorageService.syncToGoogleSheet(gasUrl.trim());
    setIsSyncing(false);
    setSyncResult(res);
    if (res.success) {
      onRefreshData();
    }
  };

  // Đồng bộ tải dữ liệu từ Google Sheets về
  const handleSyncDown = async () => {
    if (!gasUrl.trim()) {
      setSyncResult({ success: false, message: 'Chưa cấu hình URL Google Apps Script!' });
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);

    const res = await StorageService.syncFromGoogleSheet(gasUrl.trim());
    setIsSyncing(false);
    setSyncResult(res);
    if (res.success) {
      onRefreshData();
    }
  };

  // Sao chép mã Apps Script
  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 3000);
  };

  // Nhập sao lưu JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = StorageService.importBackupJSON(json);
        alert(result.message);
        if (result.success) {
          onRefreshData();
        }
      } catch (err: any) {
        alert('Tệp JSON không hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Sheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Cơ sở dữ liệu Google Sheets & Google Apps Script
              </h3>
              <p className="text-[11px] text-slate-400">
                Đồng bộ hai chiều dữ liệu 6 bảng (CBCS, NGHI_PHEP, THEO_DOI_NAM, DANH_MUC, CAU_HINH, NHAT_KY)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Kết nối & Đồng bộ trực tiếp</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Mã nguồn Google Apps Script (Code.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sao lưu & Khôi phục dữ liệu</span>
          </button>
        </div>

        {/* Tab 1: Kết nối & Đồng bộ trực tiếp */}
        {activeTab === 'sync' && (
          <div className="p-6 space-y-5 text-xs text-slate-700">
            {/* Hướng dẫn 3 bước nhanh */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Quy trình kết nối Google Sheets thực tế qua Google Apps Script (3 bước):
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed text-[11px]">
                <li>
                  Tạo 1 Google Sheet mới trên Google Drive cá nhân hoặc đơn vị.
                </li>
                <li>
                  Vào <strong>Tiện ích mở rộng (Extensions)</strong> → <strong>Apps Script</strong> → Sao chép đoạn mã tại tab <strong>"Mã nguồn Code.gs"</strong> và dán vào, sau đó chạy hàm <code>khoiTaoHeThong</code> để tự động sinh 6 trang tính.
                </li>
                <li>
                  Nhấn <strong>Triển khai (Deploy)</strong> → <strong>Triển khai mới (New deployment)</strong> → Chọn <strong>Ứng dụng web (Web app)</strong> (Truy cập: "Bất kỳ ai / Anyone") → Sao chép Web App URL và dán vào ô bên dưới!
                </li>
              </ol>
            </div>

            {/* Ô nhập URL Apps Script Web App */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                URL ứng dụng web Google Apps Script (Web App URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveUrl}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition"
                >
                  Lưu URL
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Định dạng chuẩn: <code>https://script.google.com/macros/s/.../exec</code>
              </p>
            </div>

            {/* Trạng thái kiểm tra kết nối */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Trạng thái đồng bộ */}
            {syncResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  syncResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {syncResult.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{syncResult.message}</span>
              </div>
            )}

            {/* Các nút thao tác Đồng bộ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-bold text-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-slate-600" /> : <ExternalLink className="w-4 h-4" />}
                <span>Kiểm tra kết nối</span>
              </button>

              <button
                onClick={handleSyncUp}
                disabled={isSyncing}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Đẩy dữ liệu lên Sheets</span>
              </button>

              <button
                onClick={handleSyncDown}
                disabled={isSyncing}
                className="py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Tải dữ liệu từ Sheets về</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Mã nguồn Code.gs */}
        {activeTab === 'code' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Mã nguồn Google Apps Script (Code.gs)</span>
                <span className="text-[11px] text-slate-500">
                  Chỉ cần sao chép toàn bộ mã này và dán vào Apps Script của Google Sheets
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold transition"
              >
                {hasCopiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] h-80 overflow-y-auto border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        )}

        {/* Tab 3: Sao lưu & Khôi phục */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-5 text-xs text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Xuất tệp sao lưu dữ liệu toàn hệ thống</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Lưu giữ dự phòng dữ liệu toàn bộ cán bộ chiến sĩ, lịch sử phiếu nghỉ và nhật ký thao tác ra tệp JSON hoặc Excel.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => StorageService.exportBackupJSON()}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải tệp sao lưu JSON (.json)</span>
                </button>
                <button
                  onClick={() => StorageService.exportToExcel(new Date().getFullYear())}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2"
                >
                  <Sheet className="w-4 h-4" />
                  <span>Xuất toàn bộ CSDL Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Khôi phục dữ liệu từ tệp sao lưu JSON</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Chọn tệp JSON sao lưu trước đó để phục hồi lại hệ thống khi cần thiết.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
