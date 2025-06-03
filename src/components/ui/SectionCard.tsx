export default function SectionCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}