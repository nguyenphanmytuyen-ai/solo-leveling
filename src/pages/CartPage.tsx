import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext.js';
import { selectCartCalculations } from '../store/selectors.js';
import { formatVnd } from '../domain/cart.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import {
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const cartCalc = selectCartCalculations(state);

  const [couponInput, setCouponInput] = useState(state.appliedCoupon || '');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'APPLY_COUPON', payload: { coupon: couponInput.trim() || null } });
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { packageId: id } });
  };

  if (cartCalc.items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#161B40] border border-slate-700 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-100">
          Túi Đồ Của Bạn Đang Trống
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Hãy khám phá các gói nhiệm vụ theo mục tiêu để trang bị thêm lộ trình lên cấp kỹ năng!
        </p>
        <Link to="/packages">
          <Button variant="primary" size="sm">
            Khám Phá Quest Packages
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-violet-400" />
            <span>Giỏ Hàng Mở Khóa (Bản Demo)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {cartCalc.items.length} gói nhiệm vụ đã chọn
          </p>
        </div>

        <Link to="/packages" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
          Tiếp tục chọn gói
        </Link>
      </div>

      {/* Demo Disclaimer Alert */}
      <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Lưu ý:</strong> Đây là bản mở khóa mô phỏng DEMO. Không thu tiền thật, không cần tài khoản ngân hàng. Giá VNĐ hiển thị cho trải nghiệm giỏ hàng chân thực.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-2 space-y-3">
          {cartCalc.items.map(item => (
            <Card key={item.id} variant="surface" className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-100 font-heading">
                  {item.title}
                </div>
                {item.isCombo ? (
                  <span className="text-[11px] text-amber-300 font-pixel">
                    Combo giảm 20% ({item.packageCount} gói)
                  </span>
                ) : (
                  <Link
                    to={`/packages/${item.id}`}
                    className="text-[11px] text-violet-400 hover:text-violet-300"
                  >
                    Xem chi tiết gói
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="font-bold text-sm text-amber-400 font-pixel">
                  {formatVnd(item.price)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  aria-label={`Xóa ${item.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}

          {/* Coupon Input Form */}
          <Card variant="surface" className="p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-violet-400" />
              <span>Mã giảm giá (Gợi ý: LEVELUP10 hoặc FRESHMAN):</span>
            </label>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                placeholder="Nhập mã giảm giá..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#0F132E] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-violet-500 uppercase"
              />
              <Button variant="secondary" size="sm" type="submit">
                Áp dụng
              </Button>
            </form>
            {cartCalc.couponMessage && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  cartCalc.isCouponValid ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {cartCalc.isCouponValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{cartCalc.couponMessage}</span>
              </p>
            )}
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <Card variant="surface" className="p-5 space-y-4 border-violet-500/30">
            <h3 className="font-bold font-heading text-base text-slate-100 pb-2 border-b border-slate-700/60">
              Tổng Kết Giỏ Hàng
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Số gói nhiệm vụ:</span>
                <strong className="text-slate-100">{cartCalc.items.length}</strong>
              </div>

              <div className="flex justify-between text-violet-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Tổng XP tiềm năng:</span>
                </span>
                <strong className="font-pixel text-amber-300">+{cartCalc.potentialXp} XP</strong>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Đây là XP tiềm năng bạn sẽ nhận được khi cày xong các nhiệm vụ, không phải XP cấp ngay lập tức.
              </p>

              <div className="pt-2 border-t border-slate-700/60 flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-pixel">{formatVnd(cartCalc.subtotal)}</span>
              </div>

              {cartCalc.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá ({state.appliedCoupon}):</span>
                  <span className="font-pixel">-{formatVnd(cartCalc.discount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-700 flex justify-between text-base font-bold text-slate-100">
                <span>Tổng cộng Demo:</span>
                <span className="text-amber-400 font-pixel text-lg">
                  {formatVnd(cartCalc.total)}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="block pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Tiến Hành Mở Khóa Demo
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 p-3 bg-[#0F132E]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <div className="text-[10px] text-slate-400 font-pixel">Tổng cộng Demo</div>
          <div className="text-base font-black text-amber-400 font-pixel">
            {formatVnd(cartCalc.total)}
          </div>
        </div>
        <Link to="/checkout" className="flex-1 max-w-[200px]">
          <Button variant="primary" size="sm" fullWidth>
            Mở Khóa Demo
          </Button>
        </Link>
      </div>
    </div>
  );
};
