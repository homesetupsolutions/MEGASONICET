'use client'
declare global { interface Window { electronAPI?: { minimize:()=>void; maximize:()=>void; close:()=>void } } }

export default function TitleBar() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI
  if (!isElectron) return null
  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-[#0a0a0f] border-b border-[#1e1e2e] flex items-center justify-between px-4 z-50" style={{WebkitAppRegion:'drag'} as React.CSSProperties}>
      <span className="text-[#00f5ff] text-xs font-bold tracking-widest">MEGASONIC COMMAND CENTER</span>
      <div className="flex gap-2" style={{WebkitAppRegion:'no-drag'} as React.CSSProperties}>
        <button onClick={() => window.electronAPI?.minimize()} className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300" />
        <button onClick={() => window.electronAPI?.maximize()} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400" />
        <button onClick={() => window.electronAPI?.close()} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" />
      </div>
    </div>
  )
}
