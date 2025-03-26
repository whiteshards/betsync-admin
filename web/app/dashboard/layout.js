
export const metadata = {
  title: 'Dashboard - BetSync Admin Panel',
  description: 'Dashboard for BetSync Admin Panel',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="font-sans">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" />
      <div className="md:pl-64">
        {children}
      </div>
    </div>
  );
}
