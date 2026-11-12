import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '../store/GameContext.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { formatVnd } from '../domain/cart.js';
import { CheckCircle2, Sparkles, ArrowRight, Layers, Home } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useGame();

  const order = state.orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold font-heading text-slate-100">
          Không Tìm Thấy Đơn Hàng
        </h2>
        <p className="text-xs text-slate-400">
          Mã đơn hàng không tồn tại trong lịch sử lưu trữ cục bộ.
        </p>
        <Link to="/play">
          <Button variant="primary" size="sm">
            Về Trang Tổng Quan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center py-6">
      {/* Victory Celebration Graphic */}
      <div className="relative inline-block">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 p-1 flex items-center justify-center animate-bounce shadow-xl">
          <div className="w-full h-full bg-[#0A0E27] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Xác Nhận Thành Công</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-heading text-slate-100 tracking-tight uppercase">
          QUEST PACKAGES UNLOCKED!
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Chúc mừng thợ săn <strong>{order.characterName}</strong>! Các gói nhiệm vụ mới đã được mở khóa hoàn tất và sẵn sàng để bạn cày lấy XP.
        </p>
      </div>

      {/* Order Receipt Details */}
      <Card variant="surface" className="p-6 text-left space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-pixel">Mã Đơn Hàng Demo</div>
            <div className="text-sm font-bold text-slate-100 font-pixel">{order.id}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-pixel">Thời Gian</div>
            <div className="text-xs text-slate-300">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400">Các gói đã mở khóa:</div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs py-1">
              <span className="text-slate-200">{item.title}</span>
              <span className="text-amber-300 font-pixel">{formatVnd(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-700/60 space-y-1.5 text-xs text-slate-300">
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Giảm giá ({order.couponCode}):</span>
              <span className="font-pixel">-{formatVnd(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-100 pt-1 border-t border-slate-800">
            <span>Tổng cộng Demo:</span>
            <span className="text-amber-400 font-pixel text-base">{formatVnd(order.total)}</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link to="/play/quests" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" fullWidth icon={<ArrowRight className="w-5 h-5" />}>
            Bắt Đầu Cày Nhiệm Vụ Ngay
          </Button>
        </Link>
        <Link to="/play" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" fullWidth icon={<Home className="w-4 h-4" />}>
            Về Trang Tổng Quan
          </Button>
        </Link>
      </div>
    </div>
  );
};
