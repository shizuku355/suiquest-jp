'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';
import { Card } from './card';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'イベント', icon: '🎯' },
    { href: '/card', label: 'カード', icon: '🎫' },
  ];

  return (
    <Card className="p-4 mb-6">
      <nav className="flex justify-center gap-2 sm:gap-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'default' : 'outline'}
            asChild
            className="flex-1 sm:flex-none"
          >
            <Link href={item.href}>
              <span className="mr-1 sm:mr-2">{item.icon}</span>
              <span className={`text-sm sm:text-base ${item.href === '/card' ? 'font-[family-name:var(--font-fredoka)]' : ''}`}>
                {item.label}
              </span>
            </Link>
          </Button>
        ))}
      </nav>
    </Card>
  );
}