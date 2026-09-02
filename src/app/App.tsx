import { AppProviders } from '@/app/providers';
import { CommandPalette } from '@/shell/CommandPalette';
import { AppRoutes } from '@/app/routes';
import '@/styles/globals.css';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <CommandPalette />
    </AppProviders>
  );
}