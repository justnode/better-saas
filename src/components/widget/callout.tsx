export function Callout({
  children,
  type = 'info',
}: { children: React.ReactNode; type?: 'info' | 'warning' }) {
  return (
    <div
      className={`my-4 border-l-4 bg-gray-50 dark:bg-gray-800 ${
        type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
      }`}
    >
      <div className="flex items-start">
        <div className="ml-2">{children}</div>
      </div>
    </div>
  );
}
