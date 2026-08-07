import { BookOpen, Users, Compass, BarChart2, ShoppingBag, GraduationCap } from 'lucide-react';

export const WORKSPACE_MENU_ITEMS = [
  { id: 'library', name: 'Dashboard', shortName: 'Dashboard', icon: BookOpen, path: '/dashboard' },
  { id: 'discover', name: 'Discover', shortName: 'Discover', icon: Compass, path: '/discovery' },
  { id: 'classes', name: 'Classes', shortName: 'Classes', icon: GraduationCap, path: '/classpin', comingSoon: true },
];