'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export const PUBLIC_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

export function getAvatarUrl(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return PUBLIC_AVATARS[Math.abs(hash) % PUBLIC_AVATARS.length];
}

interface UserAvatarProps {
  name: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRing?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export function UserAvatar({
  name,
  id,
  size = 'md',
  className,
  showRing = true,
}: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const avatarUrl = getAvatarUrl(id || name);

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white select-none overflow-hidden transition-transform',
        sizeClasses[size],
        showRing && 'ring-2 ring-red-500/25 dark:ring-red-500/40 shadow-sm',
        className
      )}
    >
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center">
          {initials}
        </div>
      )}
    </div>
  );
}
