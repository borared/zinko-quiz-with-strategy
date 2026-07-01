import { BookOpen, Users, Compass, BarChart2 } from 'lucide-react';

export const WORKSPACE_MENU_ITEMS = [
  { id: 'library', name: 'Library', shortName: 'Library', icon: BookOpen, path: '/dashboard' },
  { id: 'discover', name: 'Discover', shortName: 'Discover', icon: Compass, path: '/discovery' },
  { id: 'classes', name: 'Classes', shortName: 'Classes', icon: Users, path: '/classpin', comingSoon: true },
  { id: 'reports', name: 'Reports', shortName: 'Reports', icon: BarChart2, path: '/reports', comingSoon: true },
];