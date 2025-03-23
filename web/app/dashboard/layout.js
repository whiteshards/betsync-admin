
export const metadata = {
  title: 'Dashboard - BetSync Admin Panel',
  description: 'Dashboard for BetSync Admin Panel',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="dark">
      {children}
    </div>
  );
}
