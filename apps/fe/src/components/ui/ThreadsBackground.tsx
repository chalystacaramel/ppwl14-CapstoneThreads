// ThreadsBackground.tsx
// Lingkaran outline dengan teks melingkar, persis Threads.com/login

const ThreadsRing = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 500 500" className={`absolute pointer-events-none opacity-[0.22] ${className}`}>
    <path id="circlePath" d="M 250, 250 m -175, 0 a 175,175 0 1,1 350,0 a 175,175 0 1,1 -350,0" fill="none" />
    <text fill="white" fontSize="30" fontWeight="800" letterSpacing="10">
      <textPath href="#circlePath" startOffset="0%">THREADS THREADS THREADS THREADS</textPath>
    </text>
  </svg>
);

export function ThreadsBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <ThreadsRing className="-top-[12%] -left-[10%] w-[480px] -rotate-12" />
      <ThreadsRing className="-top-[22%] left-[28%] w-[520px] rotate-6" />
      <ThreadsRing className="-top-[6%] -right-[10%] w-[460px] rotate-45" />
      <ThreadsRing className="bottom-[12%] -left-[15%] w-[580px] rotate-15" />
      <ThreadsRing className="bottom-[-8%] -right-[12%] w-[600px] -rotate-45" />
    </div>
  );
}