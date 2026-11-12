import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-950/60 border-2 border-violet-500/40 flex items-center justify-center text-4xl font-pixel text-violet-400 shadow-2xl">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black font-heading text-slate-100 uppercase">
          Lạc Vào Hầm Ngục Hư Vô!
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Tọa độ dungeon này không tồn tại hoặc đã bị đóng cổng không gian. Hãy quay lại căn cứ để tiếp tục hành trình!
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <Link to="/play">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Về Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
            Về Trang Chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};
