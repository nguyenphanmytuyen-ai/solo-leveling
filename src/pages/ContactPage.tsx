import React, { useState } from 'react';
import { useGame } from '../store/GameContext.js';
import { FAQ_LIST } from '../data/faq.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Mail, HelpCircle, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND } from '../config/brand.js';

export const ContactPage: React.FC = () => {
  const { dispatch } = useGame();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Vui lòng nhập họ tên của bạn.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Vui lòng nhập email hợp lệ.';
    if (!subject.trim()) newErrors.subject = 'Vui lòng nhập tiêu đề thư.';
    if (!message.trim() || message.length < 10) newErrors.message = 'Nội dung tin nhắn cần tối thiểu 10 ký tự.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    dispatch({
      type: 'SUBMIT_CONTACT_MESSAGE',
      payload: { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() },
    });

    setIsSuccess(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-4xl font-black font-heading text-slate-100 uppercase">
          Liên Hệ & Câu Hỏi Thường Gặp
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Gửi phản hồi đóng góp cho nhóm phát triển hoặc xem các thắc mắc phổ biến về ứng dụng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Contact Form */}
        <Card variant="surface" className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
            <Mail className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold font-heading text-slate-100">
              Gửi Tin Nhắn Phản Hồi
            </h2>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
            ℹ️ Lưu ý: Đây là bản demo, tin nhắn được lưu cục bộ trên thiết bị của bạn để mô phỏng tính năng và không gửi qua mạng.
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="space-y-1">
              <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300">
                Họ và tên *
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                aria-describedby={errors.name ? 'contact-name-err' : undefined}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F132E] border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
              {errors.name && (
                <p id="contact-name-err" className="text-xs text-rose-400 font-medium">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300">
                Địa chỉ Email *
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-describedby={errors.email ? 'contact-email-err' : undefined}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F132E] border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
              {errors.email && (
                <p id="contact-email-err" className="text-xs text-rose-400 font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-300">
                Tiêu đề thư *
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                aria-describedby={errors.subject ? 'contact-subject-err' : undefined}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F132E] border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
              {errors.subject && (
                <p id="contact-subject-err" className="text-xs text-rose-400 font-medium">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-message" className="text-xs font-semibold text-slate-300">
                Nội dung tin nhắn *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                aria-describedby={errors.message ? 'contact-message-err' : undefined}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F132E] border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-violet-500 resize-none"
              />
              {errors.message && (
                <p id="contact-message-err" className="text-xs text-rose-400 font-medium">{errors.message}</p>
              )}
            </div>

            {isSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp cho dự án.</span>
              </div>
            )}

            <Button variant="primary" type="submit" fullWidth>
              Gửi Tin Nhắn Demo
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-500 text-center">
            Email liên hệ hỗ trợ: {BRAND.contactEmail}
          </div>
        </Card>

        {/* 6 FAQ Accordion */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-heading text-slate-100">
              Câu Hỏi Thường Gặp (FAQ)
            </h2>
          </div>

          <div className="space-y-2.5">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <Card
                  key={idx}
                  variant="surface"
                  className="transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm text-slate-200 hover:text-white cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
