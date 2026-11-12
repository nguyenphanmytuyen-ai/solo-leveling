import React, { useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card.js';
import { TEAM_MEMBERS } from '../data/team.js';
import { BRAND } from '../config/brand.js';
import { Users, Sparkles, Target, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = pageRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!page || preference.matches || !('IntersectionObserver' in window)) return;
    const elements = Array.from(page.querySelectorAll<HTMLElement>('[data-about-reveal]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.dataset.aboutVisible = 'true';
        delete element.dataset.aboutPending;
        observer.unobserve(element);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -16px 0px' });
    elements.forEach(element => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) element.dataset.aboutVisible = 'true';
      else { element.dataset.aboutPending = 'true'; observer.observe(element); }
    });
    const revealAll = () => {
      if (!preference.matches) return;
      observer.disconnect();
      elements.forEach(element => { delete element.dataset.aboutPending; element.dataset.aboutVisible = 'true'; });
    };
    preference.addEventListener('change', revealAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', revealAll);
      elements.forEach(element => { delete element.dataset.aboutPending; });
    };
  }, []);
  return (
    <div ref={pageRef} className="about-page space-y-12 max-w-4xl mx-auto py-4">
      {/* Story Banner */}
      <div data-about-reveal className="about-story text-center space-y-4">
        <div className="about-story-tag inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Câu Chuyện Phát Triển</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-100 tracking-tight uppercase">
          VỀ DỰ ÁN {BRAND.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Xuất phát từ nỗi trăn trở của chính những sinh viên đại học: áp lực deadline dồn dập, sự ngần ngại bắt đầu và cảm giác mơ hồ trước các kỳ thi học kỳ.
        </p>
      </div>

      {/* Origin Story & Mission */}
      <div className="about-principles grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-about-reveal variant="surface" className="about-card about-principle p-6 space-y-3">
          <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-400" />
            <span>Vấn Đề & Giải Pháp</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sinh viên thường trì hoãn không phải vì lười biếng, mà vì công việc quá lớn và thiếu phản hồi tức thì (instant gratification).
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Bằng cách áp dụng cơ chế nhập vai RPG: mỗi 25 phút học bài là một lần hoàn thành nhiệm vụ, mỗi ngày kỷ luật là một nấc thang giữ chuỗi streak, và mỗi đồ án nộp trước hạn là một chiến tích hạ gục Boss Dungeon!
          </p>
        </Card>

        <Card data-about-reveal variant="surface" className="about-card about-principle p-6 space-y-3">
          <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Mô Hình Hoạt Động & Bảo Mật</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Toàn bộ dữ liệu của bạn được lưu trữ hoàn toàn trên trình duyệt (client-side storage). Ứng dụng không thu thập dữ liệu cá nhân, không quảng cáo rác, không tạo sự phụ thuộc vào mạng.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Mô hình kinh doanh tương lai: Cung cấp các Quest Packages chuyên sâu theo môn học và lộ trình kỹ năng (hiện đang chạy dưới dạng thanh toán mô phỏng demo).
          </p>
        </Card>
      </div>

      {/* Team of 5 Members */}
      <div className="about-team space-y-6">
        <div data-about-reveal className="about-team-heading text-center space-y-2">
          <h2 className="text-2xl font-black font-heading text-slate-100 uppercase flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Đội Ngũ Phát Triển</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dữ liệu nhóm được đồng bộ từ <code>src/data/team.ts</code>
          </p>
        </div>

        <div className="about-team-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <Card data-about-reveal key={member.id} variant="surface" className="about-card about-member p-5 space-y-3" style={{ '--about-delay': `${Math.min(index, 3) * 35}ms` } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <div className="about-member-avatar w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 flex items-center justify-center font-bold text-lg text-white font-pixel">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{member.name}</h3>
                  <p className="text-[11px] text-violet-300 font-pixel">{member.role}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {member.bio}
              </p>

              <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                Nhiệm vụ yêu thích: <strong className="text-amber-300 font-pixel">{member.favoriteQuest}</strong>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
