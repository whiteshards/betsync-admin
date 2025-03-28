
export const metadata = {
  title: 'Server Page',
  description: 'i like thighs',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="font-sans">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
      <div>
        {children}
      </div>
    </div>
  );
}