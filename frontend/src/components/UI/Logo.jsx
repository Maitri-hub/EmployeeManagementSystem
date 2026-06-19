import { Layers } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const iconSize = size === 'sm' ? 16 : 20;
  return (
    <div className="auth-logo">
      <div className="auth-logo-icon">
        <Layers size={iconSize} />
      </div>
      <span className="auth-logo-name">WorkFlow</span>
    </div>
  );
}
