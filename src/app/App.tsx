import { AppProviders } from '@/app/providers';
import { AppRoutes } from '@/app/routes';
import '@/styles/globals.css';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}