// Phân hệ Nhật ký thao tác hệ thống (Audit Log) - Công an xã Bát Tràng
import React, { useState, useMemo } from 'react';
import { History, Search, Shield, Clock, User, Filter, Trash2 } from 'lucide-react';
import { NhatKyHeThong, UserRole } from '../../types';

interface AuditLogViewProps {
  logs: NhatKyHeThong[];
  currentRole: UserRole;
  onClearLogs?: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  currentRole,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const match =
        log.hanhDong.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.chiTiet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nguoiThucHien.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vaiTro.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [logs, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            <span>Nhật ký Thao tác Hệ thống (Audit Log)</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {filteredLogs.length} bản ghi
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Ghi nhận tự động mọi hoạt động thêm, sửa thông tin cán bộ, lập phiếu, duyệt phiếu và hủy phiếu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm trong nhật ký..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
            />
          </div>
        </div>
      </div>

      {/* Danh sách nhật ký */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                <th className="py-3 px-3 w-14 text-center">STT</th>
                <th className="py-3 px-3">Thời gian ghi nhận</th>
                <th className="py-3 px-3">Người thực hiện</th>
                <th className="py-3 px-3">Vai trò</th>
                <th className="py-3 px-3">Hành động</th>
                <th className="py-3 px-3">Nội dung chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không có bản ghi nhật ký nào.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const date = new Date(log.thoiGian);
                  const timeFormatted = isNaN(date.getTime())
                    ? log.thoiGian
                    : `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {timeFormatted}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {log.nguoiThucHien}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {log.vaiTro}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-900 whitespace-nowrap">
                        {log.hanhDong}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {log.chiTiet}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
