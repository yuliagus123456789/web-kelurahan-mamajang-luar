import { createContext, useContext, useEffect, useState, ReactNode, MouseEvent } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function getInitialPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const onHashChange = () => setPath(getInitialPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: string) => {
    if (to === path) return;
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({
  to,
  children,
  className,
  title,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    navigate(to);
  };
  return (
    <a href={`#${to}`} className={className} title={title} onClick={handleClick}>
      {children}
    </a>
  );
}
