'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, History, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HistoryDialog } from './HistoryDialog';

interface UserMenuProps {
  onLoadReport: (data: any, reportType: string) => void;
  onSaveReport?: (name: string, reportType: string) => Promise<void>;
  currentReportType: string;
}

export function UserMenu({ onLoadReport, onSaveReport, currentReportType }: UserMenuProps) {
  const { data: session } = useSession();
  const [showHistoryDialog, setShowHistoryDialog] = React.useState(false);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (!session) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-3 h-10 text-white hover:bg-white/10"
          >
            <Avatar className="h-7 w-7 bg-orange-500">
              <AvatarFallback className="bg-orange-500 text-white text-xs font-bold">
                {getInitials(session.user?.name, session.user?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
              {session.user?.name?.split(' ')[0] || 'Usuário'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
          <div className="px-3 py-2 text-sm font-medium text-white">
            {session.user?.name}
          </div>
          <div className="px-3 py-1 text-xs text-gray-400">
            {session.user?.email}
          </div>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            onClick={() => setShowHistoryDialog(true)}
            className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico de Relatórios
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <HistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        onLoadReport={onLoadReport}
        onSaveReport={onSaveReport}
        currentReportType={currentReportType}
      />
    </>
  );
}
