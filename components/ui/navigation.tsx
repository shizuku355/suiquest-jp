'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';
import { Card } from './card';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'イベント一覧', icon: '🎯' },
    { href: '/card', label: 'Stamp Card', icon: '🎫' },
    { href: '/admin', label: '管理', icon: '⚙️' },
  ];

  return (
    <Card className="p-4 mb-6">
      <nav className="flex justify-center space-x-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'default' : 'outline'}
            asChild
          >
            <Link href={item.href}>
              <span className="mr-2">{item.icon}</span>
              <span className={item.href === '/card' ? 'font-[family-name:var(--font-fredoka)]' : ''}>
                {item.label}
              </span>
            </Link>
          </Button>
        ))}
      </nav>
    </Card>
  );
}